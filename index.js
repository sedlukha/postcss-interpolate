var postcss = require('postcss');

module.exports =  postcss.plugin('postcss-interpolate', (options = {}) => {
    return css => {

        var rootInterpolateArray;
        css.walkDecls(decl =>{
          if ((decl.parent.selector.indexOf('html') > -1) && (decl.prop.indexOf('font-size') > -1) && (decl.value.indexOf( 'interpolate(' ) !== -1)){
            rootInterpolateArray = decl.value;
            return
          }
        })

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

                generateArrays(0)
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
                startFrom = 1;
                generateArrays(1);
              }

              else {
                // WARN
              }



              function generateArrays(startfrom){
                var mediaqueriesArray = [];
                var valuesArray = [];

                const rule = decl.parent;
                const root = rule.parent;

                // Get array of mediaqueries and array of values
                for (var i = startFrom; i < interpolateArray.length; i+=2) {
                  mediaqueriesArray.push(interpolateArray[i]);
                  valuesArray.push(interpolateArray[i+1]);
                }


                function checkArrays(){
                  function isPx(i){
                    return i.indexOf('px') > -1
                  }

                  function isRem(i){
                    return i.indexOf('rem') > -1
                  }

                  function getDivider(actualViewport){
                    actualViewport = parseFloat(actualViewport)

                   if (mediaqueriesArray.every(isPx) && valuesArray.every(isPx)) {
                     return 1;
                   }

                   else if (mediaqueriesArray.every(isPx) && valuesArray.every(isRem)) {
                     var rootMedia = [];
                     var rootValue = [];
                     var bigger = [];
                     var rootReadyArray;

                     if(rootInterpolateArray.indexOf('interpolate(') > -1 ){
                       rootReadyArray = rootInterpolateArray.match(/\(([^)]+)\)/)[1].split(',');

                       // Get array of mediaqueries and array of values
                       for (var i = startFrom; i < rootReadyArray.length; i+=2) {
                         rootMedia.push(rootReadyArray[i]);
                         rootValue.push(rootReadyArray[i+1]);
                       }


                       var minRootMedia, maxRootMedia, minRootValue, maxRootValue;

                       for (var i = 0; i < rootMedia.length; i++) {

                         if((actualViewport <= parseInt(rootMedia[i], 10)) && (actualViewport >= parseInt(rootMedia[i-1], 10))){
                           maxRootMedia = parseFloat(rootMedia[i]);
                           minRootMedia = parseFloat(rootMedia[i-1]);
                           maxRootValue = parseFloat(rootValue[i]);
                           minRootValue = parseFloat(rootValue[i-1]);
                         }
                       }

					   var formula;

                       if (minRootMedia == maxRootMedia){
                         formula = parseInt(minRootValue, 10)
                       } else {
                         formula = minRootValue + (maxRootValue - minRootValue) * (actualViewport - minRootMedia)/(maxRootMedia - minRootMedia);
                       }
                       return formula

                     }
                   }
                   else {
                     console.log('LOL')
                     // WARN
                   }

                  }



                  function generate(){
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
                              value: 'calc(' + valuesArray[i] + ' + ' + (parseFloat(valuesArray[i+1]) - parseFloat(valuesArray[i])) + ' * (100' + directionViewport + ' - ' + mediaqueriesArray[i] + ') / ' +  ((parseInt(mediaqueriesArray[i+1], 10) - parseInt(mediaqueriesArray[i], 10)) / getDivider(mediaqueriesArray[i+1])) +')'
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

                  generate()

                }
                checkArrays()
              }
            }
          }
      });
    };
});
