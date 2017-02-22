import * as postcss from 'postcss';

export default postcss.plugin('postcss-interpolate', (options = {}) => {
    return css => {
        css.walkDecls(decl => {

          // Get property
          if (decl.value.indexOf( 'interpolate(' ) !== -1) {

              // Get array of values
              var interpolateArray = decl.value.match(/\(([^)]+)\)/)[1].split(',');

              if (interpolateArray.length > 3){

                var direction          = interpolateArray[0];
                var mediaqueries       = [];
                var values             = [];
                var firstValueIsString = isNaN(parseInt(direction, 10));
                var valuesNumberIsOdd  = (interpolateArray.length & 1);
                var n;


                // Shorthand, without direction
                if (valuesNumberIsOdd == false && firstValueIsString == false){
                  var directionViewport = 'vw';
                  n = 0;
                }

                // with direction
                if (valuesNumberIsOdd == true && firstValueIsString == true){
                  if (direction == 'horizontally') {
                    var directionViewport = 'vw';
                  } else if (direction == 'vertically') {
                    var directionViewport = 'vh';
                  }
                  n = 1;
                }

                if ((valuesNumberIsOdd == true && firstValueIsString == false) || (valuesNumberIsOdd == false && firstValueIsString == true)){
                  console.log('нечетное и число или четное и не число')
                }

                // Get array of mediaqueries and array of values
                for (var i = n; i < interpolateArray.length; i+=2) {
                  mediaqueries.push(interpolateArray[i]);
                  values.push(interpolateArray[i+1]);
                }

                  // Last mediaquery rule
                  var lastMedia = postcss.atRule({
                    name: 'media',
                    params: 'screen and (min-width: ' + mediaqueries[mediaqueries.length - 1] +')'
                  })

                  lastMedia.append({selector: decl.parent.selector}).walkRules(function(selector){
                    selector.append({
                      prop: decl.prop,
                      value: values[values.length - 1]
                    });
                  });

                  // Insert last mediaquery
                  decl.parent.parent.insertAfter(decl.parent, lastMedia)

                  // Middle mediaquery rule
                  for (var i = 0; i < mediaqueries.length - 1; i++) {
                    for (var i = 0; i < values.length - 1; i++) {

                      var media = postcss.atRule({
                        name: 'media',
                        params: 'screen and (min-width: ' + mediaqueries[i] +')'
                      })

                      media.append({selector: decl.parent.selector}).walkRules(function(selector){
                        selector.append({
                          prop: decl.prop,
                          value: 'calc(' + values[i] + ' + ' + (parseInt(values[i+1], 10) - parseInt(values[i], 10)) + ' * (100' + directionViewport + ' - ' + mediaqueries[i] + ') / ' +  parseInt(mediaqueries[i+1], 10) + ' - ' +  parseInt(mediaqueries[i], 10) +')'
                        });
                      });

                      // Insert middle mediaquery
                      decl.parent.parent.insertAfter(decl.parent, media)
                    }
                  }

                  // Insert first value
                  decl.replaceWith({ prop: decl.prop, value: interpolateArray[n+1]});
                }

          }
        });
    };
});