(function () {
    angular.module('App')
        .component('testApplicationProcess', {
            templateUrl: window["APP_FOLDER"] + 'components/test-application-process/test-application-process.view.html?rnd' + Math.random(),
            bindings: {
                //user: '<'
            },
            controllerAs: 'ctrl',
            controller: ['$scope', '$ApiService', '$Preload', '$q', '$location', '$routeParams', ctrl]
        });

    function ctrl($scope, $ApiService, $Preload, $q, $location, $routeParams) {
        $Preload.show();
        var ctrl = this;
        ctrl.allApplications = [];
        ctrl.item = {};
        ctrl.api = $ApiService;

        async function loadData() {
            ctrl.allApplications = await ctrl.api.getDRApplicationItems();
            if ($routeParams.id) {
                setTimeout(function () {
                    $scope.$apply(function () {
                        ctrl.item.Application = ctrl.allApplications[0];
                    });
                }, 0);
            }
        }
        loadData();
    }
})();