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
                let req = [
                    $ApiService.createExcerciseTimeline({
                        Title: "Identify any changes to Application ownership",
                        Owners: "Application Teams",
                        Description: "Application Ownership / ITLT POC changes must be acknowledged and updated via the " +
                            "<a href='" + window["APP_PAGE_LOCATION_URL"] + "#/dashboard'>Failover Exercise Portal</a>.",
                        DueDate: new Date(ctrl.item.Application.TestDate).toLocaleDateString('en-us') + " - "
                            + new Date(new Date(ctrl.item.Application.TestDate).setDate(new Date(ctrl.item.Application.TestDate).getDate() + 7)).toLocaleDateString('en-us'),
                        TestPlanItemId: res.data.Id,

                    }),
                    $ApiService.createExcerciseTimeline({
                        Title: "Identify and submit " + new Date().getFullYear() + " Failover Exercise date",
                        Owners: "Application Teams",
                        Description: "Test dates must be identified and submitted via the " +
                            "<a href='" + window["APP_PAGE_LOCATION_URL"] + "#/dashboard'>Failover Exercise Portal</a>.",
                        DueDate: new Date(ctrl.item.Application.TestDate).toLocaleDateString('en-us') + " - "
                            + new Date(new Date(ctrl.item.Application.TestDate).setDate(new Date(ctrl.item.Application.TestDate).getDate() + 14)).toLocaleDateString('en-us'),
                        TestPlanItemId: res.data.Id,

                    }),
                ];
                Promise.all(req).then(function (res) {
                    $ApiService.deleteEmailItems(ctrl.item.Application.Id).then(function () {
                        let req = [];
                        req.push($ApiService.sendEmail({
                            ToId: { 'results': ctrl.item.Application.TestPlanOwnerId.results },
                            CCId: { 'results': [ctrl.item.Application.ApprovingManagerId] },
                            Subject: "Reminder: " + ctrl.item.Application.Title + " Failover Exercise",
                            Body: "Hello, <p>Just a reminder that the " + ctrl.item.Application.Title + " Failover Exercise is scheduled for " + new Date(ctrl.item.DueDate).toLocaleDateString() +
                                " and it is time to begin completing " +
                                "the required documentation.  Please complete the Application Failover Test Plan and Timeline and upload it into the " +
                                "<a href='" + window["APP_PAGE_LOCATION_URL"] + "#/dashboard'>Failover Exercise Portal</a> within the next two weeks.</p>" +
                                "<p>Please feel free to contact the EDR Team at <a href='mailto:Disasterrecoverytestteam@cvshealth.com'>Disasterrecoverytestteam@cvshealth.com</a> if you have any questions.</p>" +
                                "Thank you,<br>EDR Team",
                            DelayDate: new Date(new Date(ctrl.item.DueDate).setDate(new Date(ctrl.item.DueDate).getDate() - 28)),
                            // DelayDate: new Date(new Date(ctrl.item.DueDate).getTime() - 9 * 60000).toISOString(),
                            ApplicationId: ctrl.item.Application.Id,
                        }));
                        req.push($ApiService.sendEmail({
                            ToId: { 'results': ctrl.item.Application.TestPlanOwnerId.results },
                            CCId: { 'results': [ctrl.item.Application.ApprovingManagerId] },
                            Subject: "Reminder: " + ctrl.item.Application.Title + " Failover Exercise Requirement Due",
                            Body: "Hello, <p>Just a reminder that the " + ctrl.item.Application.Title + " Failover Exercise is scheduled for " + new Date(ctrl.item.DueDate).toLocaleDateString() +
                                " and the Failover Exercise Requirements have not been completed. " +
                                "Please complete the Application Failover Test Plan and Timeline and upload into the <a href='"
                                + window["APP_PAGE_LOCATION_URL"] + "#/dashboard'>Failover Exercise Portal</a> as soon as possible.</p>" +
                                "<p>Please feel free to contact the EDR Team at <a href='mailto:Disasterrecoverytestteam@cvshealth.com'>Disasterrecoverytestteam@cvshealth.com</a> if you have any questions.</p>" +
                                "Thank you,<br>EDR Team",
                            DelayDate: new Date(new Date(ctrl.item.DueDate).setDate(new Date(ctrl.item.DueDate).getDate() - 14)),
                            // DelayDate: new Date(new Date(ctrl.item.DueDate).getTime() - 13 * 60000).toISOString(),
                            ApplicationId: ctrl.item.Application.Id,
                            RepeatDay: "3"
                        }));
                        req.push($ApiService.sendEmail({
                            ToId: { 'results': ctrl.item.Application.TestPlanOwnerId.results },
                            CCId: { 'results': [ctrl.item.Application.ApprovingManagerId] },
                            Subject: "Reminder: " + ctrl.item.Application.Title + " Failover Exercise Requirement Past Due",
                            Body: "Hello, <p>Just a reminder that the " + ctrl.item.Application.Title + " Failover Exercise is scheduled for " + new Date(ctrl.item.DueDate).toLocaleDateString() +
                                " and the Failover Exercise Requirements have not been completed. " +
                                "Please complete the Application Failover Test Plan and Timeline and upload into the <a href='"
                                + window["APP_PAGE_LOCATION_URL"] + "#/dashboard'>Failover Exercise Portal</a> as soon as possible.</p>" +
                                "<p>Please feel free to contact the EDR Team at <a href='mailto:Disasterrecoverytestteam@cvshealth.com'>Disasterrecoverytestteam@cvshealth.com</a> if you have any questions.</p>" +
                                "Thank you,<br>EDR Team",
                            DelayDate: new Date(new Date(ctrl.item.DueDate).setDate(new Date(ctrl.item.DueDate).getDate() - 17)),
                            // DelayDate: new Date(new Date(ctrl.item.DueDate).getTime() - 13 * 60000).toISOString(),
                            ApplicationId: ctrl.item.Application.Id,
                            RepeatDay: "3"
                        }));
                        Promise.all(req).then(function () {
                            setTimeout(function () {
                                $scope.$apply(function () {
                                    $location.path("/dashboard");
                                    $Preload.hide();
                                });
                            }, 0);
                        });
                    });
                });
            });
        }

    }
})();