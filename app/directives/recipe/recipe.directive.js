angular.module('myApp')

.directive('recipe', function () {
  'use strict';

  return {
    restrict: 'E',
    templateUrl: 'directives/recipe/recipe.html',
    scope: {
      recipe: '='
    },
    controller: function($scope, $uibModal) {
      $scope.viewMeal = function () {
        $uibModal.open({
          templateUrl: 'routes/full-recipe/full-recipe.html',
          controller: 'ModalInstanceCtrl',
          size: 'lg',
          resolve: {
            recipe: function () {
              return $scope.recipe;
            }
          }
        });
      };
    }
  };
});
