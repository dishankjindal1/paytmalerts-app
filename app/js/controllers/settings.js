angular.module('paytm.ctrl.settings', []).
    controller('settingsCtrl', ['$scope', '$rootScope', '$interval', '$timeout', function ($scope, $rootScope, $interval, $timeout) {
        $scope.title = "Settings";


        $scope.isValidForm = true; 

        $('#formDateData').keyup(function () {
            $rootScope.formDateData = $(this).val();
        });
        $('#formDisplayAmount').keyup(function () {
            $rootScope.formDisplayAmount = $(this).val();
        });
        $('#formAudioFile').keyup(function () {
            $rootScope.formAudioFile = $(this).val();
            $(this).parent().append('<audio id="deleteMeBaby" hidden="true" controls autoplay><source src="' + $(this).val() + '" type="audio/mpeg"></audio>');
            $(this).addClass('bg-warning');
            $timeout(function () {
                $('#formAudioFile').removeClass('bg-warning');
                $('#deleteMeBaby').remove();
            }, 3000);
            /*
            var url = window.location.origin + '/media/alert.mp3';
            console.log(url);
            $.get(url)
            .done(function() {
                console.log(true);
            }).fail(function(){
                console.log(false);
            });
            */
        });
        $('#formAudioFile').click(function () {
            $('#formAudioFile').removeClass('bg-warning');
            $('#deleteMeBaby').remove();
        });
        
        var promise = $interval(function () {
            if($('#formDateData').val() != '' && $('#formDisplayAmount').val() != ''){
                $scope.isValidForm = true;
            } else {
                $scope.isValidForm = false;
            }
            $rootScope.isCheckAudio = $('#inputGroupSelect01').val();
            //$scope.isValidForm = $('#formAudioFile').val() == '' ? false : true;
            $rootScope.slabs_access_token = $('#inputSlabsToken').val();
        }, 100);

        $scope.$on('$destroy', function () {
            $interval.cancel(promise);
            $rootScope.paytmData = [];
            $rootScope.unqEmailIds = [];
        });
    }]);