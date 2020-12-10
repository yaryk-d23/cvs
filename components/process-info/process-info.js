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
        ctrl.api = $ApiService;
        ctrl.dateOptions = {
            formatYear: 'yyyy',
            startingDay: 1
        };

        ctrl.close = function () {
            $location.path("/dashboard");
        }

        ctrl.submit = function () {
            if (ctrl.form.$invalid) {
                angular.forEach(ctrl.form.$error, function (field) {
                    angular.forEach(field, function (errorField) {
                        errorField.$setTouched();
                    });
                });
                return;
            }
            $Preload.show();
            $ApiService.createApplicationTestPlan({
                ApplicationId: ctrl.item.Application.Id,
                DueDate: ctrl.item.DueDate,
                Stage: 1,
            }).then(function (res) {
                $ApiService.updateApplication({
                    Id: ctrl.item.Application.Id,
                    Status: "In progress"
                }).then(function () {
                    setTimeout(function () {
                        $scope.$apply(function () {
                            $location.path("/process-form/" + res.data.Id);
                            $Preload.hide();
                        });
                    }, 0);
                });
            });
        }

    }
})();