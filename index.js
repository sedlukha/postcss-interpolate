var postcss = require('postcss');

module.exports = postcss.plugin('postcss-interpolate', (options = {}) => {
    return css => {
        css.walkDecls(decl => {

          // Get property
          if (decl.value.indexOf( 'interpolate(' ) !== -1) {

              // Get array of values
              var interpolateArray = decl.value.match(/\(([^)]+)\)/)[1].split(',');

              if (interpolateArray.length > 3){

                var firstValueIsString = isNaN(parseInt(interpolateArray[0], 10));
                var valuesNumberIsOdd  = (interpolateArray.length & 1);
                var startFrom = 0;

                // Shorthand, without direction
                if (valuesNumberIsOdd == false && firstValueIsString == false){
                  var directionViewport = 'vw';
                }

                // With direction
                if (valuesNumberIsOdd == true && firstValueIsString == true){
                  var direction          = interpolateArray[0];

                  if (direction == 'horizontally') {
                    var directionViewport = 'vw';
                  } else if (direction == 'vertically') {
                    var directionViewport = 'vh';
                  }
                  startFrom = 1;
                }

                if ((valuesNumberIsOdd == true && firstValueIsString == false) || (valuesNumberIsOdd == false && firstValueIsString == true)){
                  console.log('нечетное и число или четное и не число')
                }

                var mediaqueries = [];
                var values = [];

                // Get array of mediaqueries and array of values
                for (var i = startFrom; i < interpolateArray.length; i+=2) {
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
                  decl.replaceWith({ prop: decl.prop, value: interpolateArray[startFrom+1]});
                }

          }
        });
    };
});
