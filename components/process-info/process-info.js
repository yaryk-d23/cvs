(function () {
    angular.module('App')
        .component('processInfo', {
            templateUrl: window["APP_FOLDER"] + 'components/process-info/process-info.view.html?rnd' + Math.random(),
            bindings: {
                allApplications: '<',
                item: "=",
            },
            controllerAs: 'ctrl',
            controller: ['$scope', '$ApiService', '$Preload', '$q', '$location', '$routeParams', ctrl]
        });

    function ctrl($scope, $ApiService, $Preload, $q, $location, $routeParams) {
        var ctrl = this;
        ctrl.routeParams = $routeParams;
        ctrl.dateOptions = {
            formatYear: 'yyyy',
            startingDay: 1
        };

    }
})();