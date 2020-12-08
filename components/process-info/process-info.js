(function () {
    angular.module('App')
        .component('processInfo', {
            templateUrl: window["APP_FOLDER"] + 'components/process-info/process-info.view.html?rnd' + Math.random(),
            bindings: {
                allApplications: '<',
                item: "="
            },
            controllerAs: 'ctrl',
            controller: ['$scope', '$ApiService', '$Preload', '$q', '$location', ctrl]
        });

    function ctrl($scope, $ApiService, $Preload, $q, $location) {
        var ctrl = this;
        ctrl.api = $ApiService;
        ctrl.dateOptions = {
            formatYear: 'yyyy',
            startingDay: 1
        };

    }
})();