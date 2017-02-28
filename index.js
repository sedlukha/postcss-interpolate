var postcss = require('postcss');

module.exports =  postcss.plugin('postcss-interpolate', (options = {}) => {
    return css => {
        css.walkDecls(decl => {

          // Get property
          if (decl.value.indexOf( 'interpolate(' ) !== -1) {

            // Get array of interolate() values
            const interpolateArray = decl.value.match(/\(([^)]+)\)/)[1].split(',');

            if (interpolateArray.length > 3){
              var firstValueIsString = isNaN(parseInt(interpolateArray[0], 10));
              var valuesNumberIsOdd  = (interpolateArray.length & 1);
              var startFrom = 0;

              // Shorthand, without direction
              if (valuesNumberIsOdd == false && firstValueIsString == false){
                var directionViewport = 'vw';

                generate(0)
              }

              else if (valuesNumberIsOdd == true && firstValueIsString == true){
                var direction = interpolateArray[0];

                if (direction == 'horizontally') {
                  var directionViewport = 'vw';
                }

                else if (direction == 'vertically') {
                  var directionViewport = 'vh';
                }

                else {
                  // WARN
                }

                generate(1);
              }

              else {
                // WARN
              }

              function generate(startfrom){
                var mediaqueriesArray = [];
                var valuesArray = [];

                const rule = decl.parent;
                const root = rule.parent;

                // Get array of mediaqueries and array of values
                for (var i = startFrom; i < interpolateArray.length; i+=2) {
                  mediaqueriesArray.push(interpolateArray[i]);
                  valuesArray.push(interpolateArray[i+1]);
                }

                var remDivider =  1;

                // Firsl value rule
                decl.replaceWith({ prop: decl.prop, value: interpolateArray[startFrom+1]});

                // Middle mediaquery rule
                for (var i = 0; i < mediaqueriesArray.length - 1; i++) {
                  for (var i = 0; i < valuesArray.length - 1; i++) {

                    function middleMedia(){
                      var media = postcss.atRule({
                        name: 'media',
                        params: 'screen and (min-width: ' + mediaqueriesArray[i] +')'
                      })

                      media.append({selector: rule.selector}).walkRules(function(selector){
                        selector.append({
                          prop: decl.prop,
                          value: 'calc(' + valuesArray[i] + ' + ' + (parseInt(valuesArray[i+1], 10) - parseInt(valuesArray[i], 10)) + ' * (100' + directionViewport + ' - ' + mediaqueriesArray[i] + ') / ' +  ((parseInt(mediaqueriesArray[i+1], 10) - parseInt(mediaqueriesArray[i], 10)) ) +')'
                        });
                      });

                      // Insert middle mediaquery
                      root.insertAfter(root.last, media)
                    }

                    middleMedia()
                  }
                }

                //Last mediaquery rule
                var lastMedia = postcss.atRule({
                  name: 'media',
                  params: 'screen and (min-width: ' + mediaqueriesArray[mediaqueriesArray.length - 1] +')'
                })

                lastMedia.append({selector: rule.selector}).walkRules(function(selector){
                  selector.append({
                    prop: decl.prop,
                    value: valuesArray[valuesArray.length - 1]
                  });
                });

                // Insert last mediaquery
                root.insertAfter(root.last, lastMedia);
              }
            }
          }
      });
    };
});
