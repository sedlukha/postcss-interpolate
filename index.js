var postcss = require('postcss');

module.exports = postcss.plugin('postcss-interpolate', (options = {}) => {
  return css => {

      // Html font-size value
      var rootString;

      // Get 'rootString' value
      css.walkDecls(decl => {
        if ((decl.parent.selector.indexOf('html') > -1) &&
          (decl.prop.indexOf('font-size') > -1)) {
          rootString = decl.value;
          return
        }
      });

      css.walkDecls(decl => {

        // Get property line
        if (decl.value.indexOf('interpolate(') !== -1) {

          // Get array of interolate() values
          const interpolateArray = decl.value.match(/\(([^)]+)\)/)[1].split(',');

          if (interpolateArray.length > 3) {

            function isString(array){
              return isNaN(parseFloat(array))
            }

            function isOdd(array){
              return (array.length & 1)
            }

            var startFrom, directionViewport;

            function checkDirection(arrayForCheck){

              if (isOdd(arrayForCheck) == false && isString(arrayForCheck[0]) == false) {
                directionViewport = 'vw';
                startFrom = 0
              }

              // With direction
              else if (isOdd(arrayForCheck) == true && isString(arrayForCheck[0]) == true) {

                var direction = arrayForCheck[0];

                if ((direction.indexOf('horizontally') > -1) || (direction.indexOf('vw') > -1)) {
                  directionViewport = 'vw';
                } else if ((direction.indexOf('vertically') > -1) || (direction.indexOf('vh') > -1)) {
                  directionViewport = 'vh';
                } else {
                  // WARN
                }
                startFrom = 1;
              }

              // Syntax error
              else {
                // WARN
              }

              return
            }

            var mediaArray = [];
            var valueArray = [];
            const rule = decl.parent;
            const root = rule.parent;

            // Generate media and values arrays
            function generateArrays() {
              checkDirection(interpolateArray)

              for (var i = startFrom; i < interpolateArray.length; i += 2) {
                mediaArray.push(interpolateArray[i]);
                valueArray.push(interpolateArray[i + 1]);
              }
              return
            }

            // Get html font-size value
            function getHtmlValue(actualViewport) {
              actualViewport = parseFloat(actualViewport)

              function isPx(i) {
                return i.indexOf('px') > -1
              }

              function isRem(i) {
                return i.indexOf('rem') > -1
              }

              if (mediaArray.every(isPx) && valueArray.every(isPx)) {
                return 1;
              }

              else if (mediaArray.every(isPx) && valueArray.every(isRem)) {
                var rootMediaArray = [];
                var rootValueArray = [];
                var bigger = [];
                var rootReadyArray;

                if (rootString.indexOf('interpolate(') > -1) {
                  rootReadyArray = rootString.match(/\(([^)]+)\)/)[1].split(',');

                  checkDirection(rootReadyArray)

                  // Get array of mediaqueries and array of values
                  for (var i = startFrom; i < rootReadyArray.length; i += 2) {
                    rootMediaArray.push(rootReadyArray[i]);
                    rootValueArray.push(rootReadyArray[i + 1]);
                  }

                  var minrootMediaArray, maxrootMediaArray, minrootValueArray, maxrootValueArray;

                  for (var i = 0; i < rootMediaArray.length; i++) {
                    if ((actualViewport <= parseFloat(rootMediaArray[i])) && (actualViewport >= parseFloat(rootMediaArray[i - 1]))) {
                      maxrootMediaArray = parseFloat(rootMediaArray[i]);
                      minrootMediaArray = parseFloat(rootMediaArray[i - 1]);
                      maxrootValueArray = parseFloat(rootValueArray[i]);
                      minrootValueArray = parseFloat(rootValueArray[i - 1]);
                    }
                  }

                  var formula;

                  if (minrootMediaArray == maxrootMediaArray) {
                    formula = parseFloat(minrootValueArray)
                  }

                  else {
                    formula = minrootValueArray + (maxrootValueArray - minrootValueArray) * (actualViewport - minrootMediaArray) / (maxrootMediaArray - minrootMediaArray);
                  }

                  return formula
                }
              }

              else {
                console.log('LOL')
                // WARN
              }
            }

            // First @media rule
            function firstRule(){
              decl.replaceWith({
                prop: decl.prop,
                value: interpolateArray[startFrom + 1]
              });
            }

            // Middle @media rule
            function middleRule(){
              for (var i = 0; i < mediaArray.length - 1; i++) {
                for (var i = 0; i < valueArray.length - 1; i++) {

                  // Generate @media atrule
                  var mediaAtrule = postcss.atRule({
                    name: 'media',
                    params: 'screen and (min-width: ' + mediaArray[i] + ')'
                  })

                  var maxMedia = mediaArray[i + 1];
                  var minMedia = mediaArray[i];
                  var maxValue = valueArray[i + 1];
                  var minValue = valueArray[i];

                  // Append current selector with properties and values
                  mediaAtrule.append({
                    selector: rule.selector
                  }).walkRules(function(selector) {
                    selector.append({
                      prop: decl.prop,
                      value: 'calc(' + minValue + ' + ' + (parseFloat(maxValue) - parseFloat(minValue)) + ' * (100' + directionViewport + ' - ' + minMedia + ') / ' + ((parseFloat(maxMedia) - parseFloat(minMedia)) / getHtmlValue(maxMedia)) + ')'
                    });
                  });

                  // Insert middle mediaquery
                  root.insertAfter(root.last, mediaAtrule)
                }
              }
            }

            // Last @media rule
            function lastRule() {

              // Generate @media atrule
              var lastMedia = postcss.atRule({
                name: 'media',
                params: 'screen and (min-width: ' + mediaArray[mediaArray.length - 1] + ')'
              })

              // Append current selector with properties and values
              lastMedia.append({
                selector: rule.selector
              }).walkRules(function(selector) {
                selector.append({
                  prop: decl.prop,
                  value: valueArray[valueArray.length - 1]
                });
              });

              // Insert last media rule
              root.insertAfter(root.last, lastMedia);
            }

            // Get array of mediaqueries and array of values
            generateArrays()

            // Generate and insert firsl value rule
            firstRule()

            // Generate and insert middle @media rule
            middleRule()

            // Generate and insert last @media rule
            lastRule()
          }
        }
    });
  };
});
