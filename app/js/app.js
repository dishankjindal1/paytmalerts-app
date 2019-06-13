angular.module('paytm', ['ngRoute', 'paytm.ctrl.oauth', 'paytm.ctrl.home', 'paytm.ctrl.settings', 'paytm.ctrl.scroll']).
    config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
        //initialize get if not there
        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
        }

        // Answer edited to include suggestions from comments
        // because previous version of code introduced browser-related errors

        //disable IE ajax request caching
        $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
        // extra
        $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
        $httpProvider.defaults.headers.get.Pragma = 'no-cache';
        $routeProvider.
            when('/home', {
                controller: 'homeCtrl',
                templateUrl: 'views/home.html'
            }).
            when('/settings', {
                controller: 'settingsCtrl',
                templateUrl: 'views/settings.html'
            }).
            when('/oauth', {
                controller: 'oauthCtrl',
                templateUrl: 'views/oauth.html'
            }).
            when('/scroll', {
                controller: 'scrollCtrl',
                templateUrl: 'views/scroll.html'
            })
            .otherwise({ redirectTo: '/home' });
    }]).
    controller('mainAppCtrl', ['$scope', '$rootScope', '$location', '$interval', function ($scope, $rootScope, $location, $interval) {

        $scope.title = "paytm alerts";

        var slabtoken = $location.absUrl().search('code');

        //Initalizers - settings.js
        $rootScope.streamlabsToken = slabtoken;
        $rootScope.formDateData = 6;
        $rootScope.formDisplayAmount = 50;
        $rootScope.formAudioFile = "media/alert.mp3";
        $rootScope.isCheckAudio = true;
        $rootScope.slabs_access_token = '';
        // scroll.js
        $rootScope.paytmData = {};
        $rootScope.unqEmailIds = [];
        $rootScope.dateCategory = [];
        //Ended

        //Start
        var GoogleAuth;
        var SCOPE = 'https://mail.google.com/';

        var initClient = function () {
            var discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';

            gapi.client.init({
                'apiKey': 'AIzaSyDKLxC_asJTktXLyuuA_w_RXU3dILYIZhI',
                'discoveryDocs': [discoveryUrl],
                'clientId': '495884395031-q7it5skfpnrofvkm7bjpiebodv3fvmcm',
                'scope': SCOPE
            }).then(function () {
                GoogleAuth = gapi.auth2.getAuthInstance();

                GoogleAuth.isSignedIn.listen(updateSigninStatus);

                var user = GoogleAuth.currentUser.get();
                setSigninStatus();

                $('#sign-in-or-out-button').click(function () {
                    handleAuthClick();
                });
                $('#revoke-access-button').click(function () {
                    revokeAccess();
                });
            });
        };

        function handleAuthClick() {
            if (GoogleAuth.isSignedIn.get()) {
                GoogleAuth.signOut();
            } else {
                GoogleAuth.signIn();
            }
        }

        function revokeAccess() {
            GoogleAuth.disconnect();
        }

        function setSigninStatus(isSignedIn) {
            var user = GoogleAuth.currentUser.get();
            var isAuthorized = user.hasGrantedScopes(SCOPE);
            if (isAuthorized) {
                $('#sign-in-or-out-button').html('Sign out');
                $('#revoke-access-button').css('display', 'inline-block');
                $('#auth-status').html('You are currently signed in and have granted access to this app.');
            } else {
                $('#sign-in-or-out-button').html('Sign In/Authorize');
                $('#revoke-access-button').css('display', 'none');
                $('#auth-status').html('You have not authorized this app or you are signed out.');
            }
        }

        function updateSigninStatus(isSignedIn) {
            setSigninStatus();
        }
        //END

        $rootScope.gotoHome = function () {
            $location.path('/home');
        };
        $rootScope.gotoScroll = function () {
            $location.path('/scroll');
        };
        $rootScope.gotoSettings = function () {
            $location.path('/settings');
        };
        $rootScope.gotoOauth = function () {
            $location.path('/oauth');
        };

        $scope.$on('$routeChangeSuccess', function (event, current, previous) {
            gapi.load('client:auth2', initClient);
        });
        $scope.$on('$viewContentLoaded', function(){
            loading_screen.finish();
        });
    }]);