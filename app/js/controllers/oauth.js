angular.module('paytm.ctrl.oauth', []).
    controller('oauthCtrl', ['$rootScope', '$scope', '$location', '$interval', function ($rootScope, $scope, $location, $interval) {

        $rootScope.paytmData = $scope.paytmData = [];
        var paytm = {
            name: 'null',
            money: 'null'
        };
        $scope.unqEmailIds = [];

        var GoogleAuth;
        var SCOPE = 'https://mail.google.com/';

        var initClient = function () {
            // Retrieve the discovery document for version 3 of Google Drive API.
            // In practice, your app can retrieve one or more discovery documents.
            var discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';

            // Initialize the gapi.client object, which app uses to make API requests.
            // Get API key and client ID from API Console.
            // 'scope' field specifies space-delimited list of access scopes.
            gapi.client.init({
                'apiKey': 'AIzaSyDKLxC_asJTktXLyuuA_w_RXU3dILYIZhI',
                'discoveryDocs': [discoveryUrl],
                'clientId': '495884395031-q7it5skfpnrofvkm7bjpiebodv3fvmcm.apps.googleusercontent.com',
                'scope': SCOPE
            }).then(function () {
                GoogleAuth = gapi.auth2.getAuthInstance();

                // Listen for sign-in state changes.
                GoogleAuth.isSignedIn.listen(updateSigninStatus);

                // Handle initial sign-in state. (Determine if user is already signed in.)
                var user = GoogleAuth.currentUser.get();
                setSigninStatus();

                // Call handleAuthClick function when user clicks on
                //      "Sign In/Authorize" button.
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
                // User is authorized and has clicked 'Sign out' button.
                GoogleAuth.signOut();
            } else {
                // User is not signed in. Start Google auth flow.
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
                $('#auth-status').html('You are currently signed in and have granted ' +
                    'access to this app.');
            } else {
                $('#sign-in-or-out-button').html('Sign In/Authorize');
                $('#revoke-access-button').css('display', 'none');
                $('#auth-status').html('You have not authorized this app or you are signed out.');
            }
        }

        function updateSigninStatus(isSignedIn) {
            setSigninStatus();
        }

        var listAndReadMailsFn = function () {
            gapi.client.gmail.users.messages.list({
                'userId': 'me',
                'q': 'is:paytm'//,'maxResults': 5
            }).then(function (res) {
                _.forEach(res.result.messages, function (e) {
                    var result = $scope.unqEmailIds.indexOf(e.id) > -1;
                    if (!result) {
                        // Storing ids and then not to push the data again
                        $scope.unqEmailIds.push(e.id);

                        gapi.client.gmail.users.messages.get({
                            'userId': 'me',
                            'id': e.id,
                            'format': 'metadata'
                        }).then(function (res) {
                            res = res.result;
                            for (var headerIndex = 0, num = 1; headerIndex < res.payload.headers.length; headerIndex++) {
                                if (res.payload.headers[headerIndex].name == 'Subject') {
                                    var data = res.payload.headers[headerIndex].value;
                                    data = data.replace('You have received ', '');
                                    data = data.replace(/ from /g, ' ');
                                    var patt1 = /\w[\d]/g;
                                    var moneyData = data.match(patt1);
                                    var nameData = data.replace('Rs.' + moneyData, '');
                                    var patt2 = new RegExp(data);
                                    paytm = {
                                        money: moneyData,
                                        name: nameData
                                    };
                                    $scope.paytmData.push(paytm);
                                    //appendPreMsg(data);
                                }
                            }
                        });
                    }
                });
            });
        };

        var listMailsArrayFn = function () {
            gapi.client.gmail.users.messages.list({
                'userId': 'me',
                'q': 'is:paytm'
            }).then(function (res) {
                _.forEach(res.result.messages, function (e) {
                    var result = $scope.unqEmailIds.indexOf(e.id) > -1;
                    if (!result) {
                        // Storing ids and then not to push the data again
                        $scope.unqEmailIds.shift(e.id);
                    }
                });
            });
        };
        var readMailsFn = function () {
            _.forEach($scope.unqEmailIds, function (e) {
                gapi.client.gmail.users.messages.get({
                    'userId': 'me',
                    'id': e.id,
                    'format': 'metadata'
                }).then(function (res) {
                    res = res.result;
                    for (var headerIndex = 0, num = 1; headerIndex < res.payload.headers.length; headerIndex++) {
                        if (res.payload.headers[headerIndex].name == 'Subject') {
                            var data = res.payload.headers[headerIndex].value;
                            data = data.replace('You have received ', '');
                            data = data.replace(/ from /g, ' ');
                            var patt1 = /\w[\d]/g;
                            var moneyData = data.match(patt1);
                            var nameData = data.replace('Rs.' + moneyData, '');
                            var patt2 = new RegExp(data);
                            paytm = {
                                money: moneyData,
                                name: nameData
                            };
                            $scope.paytmData.push(paytm);
                            //appendPreMsg(data);
                        }
                    }
                });
            });
        };
        $rootScope.manualFetch = function () {
            listMailsArrayFn();
            readMailsFn();
        };
        $rootScope.autoFetch = function () {
            $interval(function () {
                listAndReadMailsFn();
            }, 1000);
        };
        var paytmData = $scope.paytmData = [];
        paytm = {};
        var unqEmailIds = [];
        listMailsArrayFn = function () {
            gapi.client.gmail.users.messages.list({
                'userId': 'me',
                'q': 'is:paytm'
            }).then(function (res) {
                _.forEach(res.result.messages, function (e) {
                    var result = unqEmailIds.indexOf(e.id) > -1;
                    if (!result) {
                        unqEmailIds.shift(e.id);
                    }
                });
            });
        };
        readMailsFn = function () {
            _.forEach(unqEmailIds, function (e) {
                gapi.client.gmail.users.messages.get({
                    'userId': 'me',
                    'id': e.id,
                    'format': 'metadata'
                }).then(function (res) {
                    res = res.result;
                    for (var headerIndex = 0, num = 1; headerIndex < res.payload.headers.length; headerIndex++) {
                        if (res.payload.headers[headerIndex].name == 'Subject') {
                            var data = res.payload.headers[headerIndex].value;
                            data = data.replace('You have received ', '');
                            data = data.replace(/ from /g, ' ');
                            var patt1 = /\w[\d]/g;
                            var moneyData = data.match(patt1);
                            var nameData = data.replace('Rs.' + moneyData, '');
                            var patt2 = new RegExp(data);
                            paytm = {
                                money: moneyData,
                                name: nameData
                            };
                            paytmData.push(paytm);
                        }
                    }
                });
            });
        };
        $scope.manualFetch = function () {
            listMailsArrayFn();
            readMailsFn();
        };
        $scope.autoFetch = function () {
            $interval(function () {
                listAndReadMailsFn();
            }, 1000);
            $interval(function () {
                console.log(paytmData);
                _.forEach(paytmData, function (e) {
                    //alert(JSON.stringify(e));
                    var animateData = $(`
                    <li class="list-group-item">
                    <strong>${e.money}</strong> ${e.name.toUpperCase()}
                    </li>
                    `).hide();
                    $('.list-group').prepend(animateData);
                    setTimeout(function () {
                        animateData.show('slow');
                    }, 1000);
                });
                paytmData = [];
            }, (paytmData.length + 1) * 1000);
        };

        $scope.$on('$routeChangeSuccess', function (event, current, previous) {
            gapi.load('client:auth2', initClient);
        });

        $scope.gotoHome = function () {
            $location.path('/home');
        };
    }]);