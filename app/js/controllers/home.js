angular.module('paytm.ctrl.home', []).
    controller('homeCtrl', ['$rootScope', '$scope', '$location', '$window', function ($rootScope, $scope, $location, $window) {
        $scope.title = "Paytm Alerts";

        var paytm = $rootScope.paytmData;

        $scope.paytmStart = function() {
            $location.path('/scroll');
        };
        $scope.gotoSettings = function () {
            $location.path('/settings');
        };
        $scope.gotoOAUTH = function () {
            $location.path('/oauth');
        };

    }]);