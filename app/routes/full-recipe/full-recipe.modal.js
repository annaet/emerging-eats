angular.module('myApp')

.controller('ModalInstanceCtrl', function ($uibModalInstance, $scope, recipe) {
  'use strict';

  $scope.recipe = recipe;

  $scope.ok = function () {
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss();
  };
});
