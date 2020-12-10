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

        ctrl.loadData = function () {
            $ApiService.getDRApplicationItems().then(function (res) {
                if ($routeParams.id) {
                    $ApiService.getApplicationTestPlanItemById($routeParams.id).then(function (item) {
                        setTimeout(function () {
                            $scope.$apply(function () {
                                ctrl.allApplications = res;
                                ctrl.item = item;
                                ctrl.item.DueDate = new Date(ctrl.item.DueDate);
                                ctrl.item.Application = ctrl.allApplications.filter(function (x) {
                                    return x.Id === item.ApplicationId;
                                })[0];
                                $Preload.hide();
                            });
                        }, 0);
                    }, function (error) {
                        alert("Invalid Application Test Plan item ID");
                    });
                }
                else {
                    setTimeout(function () {
                        $scope.$apply(function () {
                            ctrl.allApplications = res.filter(function (x) {
                                return x.Status === "Late";
                            });
                            $Preload.hide();
                        });
                    }, 0);
                }
            });
        }
        ctrl.loadData();
    }
})();