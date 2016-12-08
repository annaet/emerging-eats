'use strict';

angular.module('myApp')

.filter('capitalize', function() {
  return function(input) {
    return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
  };
})

.controller('HomeCtrl', function($scope, $timeout, $http) {
  // var recipes = [{
  //   name: 'Italian Meatballs',
  //   desc: 'With spaghetti and salad',
  //   preparation: '10 minutes',
  //   cooking: '30 - 40 minutes',
  //   img: 'images/meatballs.jpg',
  //   ingredients: ['Maggi', 'Beef', 'Red onion'],
  //   method: ['Preheat', 'Cook', 'Serve']
  // }];

  // var interpretation = ['family', 'quick', 'beef', 'winter'];

  $scope.conversation = [];
  $scope.placeholder = 'What kind of recipe are you looking for?';
  $scope.checked = false;

  $scope.possibleContext = {
    time: {
      ten: '10.png',
      two: '14.png',
      six: '18.png'
    },
    weather: {
      rain: 'rain.svg',
      sun: 'sun.svg',
      hot: 'temperature.svg',
      cold: 'thermometer.svg'
    }
  };

  $scope.context = {
    weather: 'rain',
    time: 'ten'
  };

  $scope.selectContextDetail = function(key) {
    $scope.showContextTitles = !$scope.showContextTitles;
    $scope.showContextDetail = key;
    console.log('show detail');
  };

  $scope.addContext = function(key) {
    $scope.context[$scope.showContextDetail] = key;
    $scope.showContextDetail = false;
    console.log($scope.context);
    console.log($scope.checked);
  };

  var requirements = {
    'size description': 'Who are you cooking for?',
    'time description': 'How quick do you need it?',
    'season': 'It’s been a cold day, would you like to try a great winter recipe?',
    'ingredient': 'Are there any ingredients that you would like to include?'
  };

  var options = {
    'style': true
  };

  var propertyMap = {
    'size description': 'size',
    'time description': 'time',
    'ingredient': 'contains',
    'season': 'seasonality',
    'style': 'flavour'
  };

  var foundReqs = {};
  var recipes;
  var recipesUrl = 'http://emerging-eats-ce.mybluemix.net/ce-store/stores/DEFAULT/concepts/recipe/instances?style=normalised';
  $http.get(recipesUrl).then(function(response) {
    console.log(response);
    recipes = response.data;
  });

  $scope.create = function() {
    var convPart = {
      question: $scope.question
    };

    var interpreterUrl = 'http://emerging-eats-ce.mybluemix.net/ce-store/special/hudson/interpreter';
    $http.post(interpreterUrl, $scope.question).then(function(response) {
      if (response && response.data) {
        var interpretations = response.data.interpretations;
        if (interpretations && interpretations[0]) {
          var insts = interpretations[0].result.instances;
          console.log(insts);

          var positive = false;

          insts.forEach(function(inst) {
            var ents = inst.entities;
            ents.forEach(function(ent) {
              ent._concept.forEach(function(concept) {
                if (requirements[concept] || options[concept]) {
                  foundReqs[concept] = ent._id;
                }
              });

              // hard coded use case for winter
              if (ent._concept.indexOf('positive response') > -1) {
                positive = true;
                foundReqs.season = 'winter';
              }
            });
          });
          console.log(foundReqs);

          // Check requirements have been filled
          var nextQ;
          for (var req in requirements) {
            if (!foundReqs[req]) {
              nextQ = requirements[req];
              break;
            }
          }
          if (!nextQ) {
            var result = [];
            recipes.forEach(function(recipe) {
              var found = true;

              for (var req in foundReqs) {
                var property = propertyMap[req];
                if (Array.isArray(recipe[property])) {
                  var foundProperty = false;
                  recipe[property].forEach(function(prop) {
                    if (prop.toLowerCase() === foundReqs[req].toLowerCase()) {
                      foundProperty = true;
                    }
                  });

                  if (!foundProperty) {
                    found = false;
                    break;
                  }
                // } else if (req === 'style') {
                //   if (recipe[property].toLowerCase() === foundReqs[req].toLowerCase()) {
                //     found = false;
                //     break;
                //   }
                } else if (recipe[property].toLowerCase() !== foundReqs[req].toLowerCase()) {
                  found = false;
                  break;
                }
              }
              if (found) {
                result.push(recipe);
              }
            });

            var context = [];
            for (var req in foundReqs) {
              context.push(foundReqs[req]);
            }

            convPart.answer = {
              recipes: result,
              interpretation: context
            };
            $scope.conversation.push(convPart);
          } else {
            convPart.answer = nextQ;
            $scope.conversation.push(convPart);
          }
        }

        $scope.question = '';

        $timeout(function() {
          var objDiv = document.getElementById('recipe-search');
          objDiv.scrollTop = objDiv.scrollHeight;
        }, 100);
      }
    });
  };
});
