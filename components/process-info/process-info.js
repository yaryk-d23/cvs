(function () {
    angular.module('App')
        .component('processInfo', {
            templateUrl: window["APP_FOLDER"] + 'components/process-info/process-info.view.html?rnd' + Math.random(),
            bindings: {
                allApplications: '<',
                item: "=",
                allTestPlans: "<"
            },
            controllerAs: 'ctrl',
            controller: ['$scope', '$ApiService', '$Preload', '$q', '$location', '$routeParams', ctrl]
        });

    function ctrl($scope, $ApiService, $Preload, $q, $location, $routeParams) {
        var ctrl = this;
        ctrl.routeParams = $routeParams;
        ctrl.api = $ApiService;
        var currYear = new Date().getFullYear();
        ctrl.dateOptions = {
            formatYear: 'yyyy',
            startingDay: 1
        };

        ctrl.close = function () {
            $location.path("/dashboard");
        }

        ctrl.getChidrenItems = function (item) {
            return ctrl.allApplications.filter(function (x) {
                return x.ParentId === item.Id;
            }).map(function (i) {
                return i.Title;
            }).join(", ");
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
            let ivalidForm = false;
            let existApplication = ctrl.allTestPlans.filter(function(x){ return x.ApplicationId === ctrl.item.Application.Id;});
            if(existApplication && existApplication.length){
                ctrl.form.Application.$setValidity('isExist',false);
                ctrl.form.Application.$setTouched();
                ivalidForm = true;
            }
            else {
                ctrl.form.Application.$setValidity('isExist',true);
            }
            if(ivalidForm) return;
            $Preload.show();
            $ApiService.createApplicationTestPlan({
                ApplicationId: ctrl.item.Application.Id,
                Title: ctrl.item.Application.Title,
                DueDate: dayjs(ctrl.item.DueDate).format('YYYY-MM-DDTHH:mm:ss'),
                Stage: 1,
            }).then(function (res) {

                $ApiService.deleteEmailItems(ctrl.item.Application.Id).then(function () {
                    Promise.all([
                        $ApiService.getEmailTemplate(CONSTANT.PROCESS_INFO),
                        $ApiService.getEmailTemplate(CONSTANT.PROCESS_INFO_DUE),
                        $ApiService.getEmailTemplate(CONSTANT.PROCESS_INFO_PAST_DUE)
                    ]).then(function (template) {
                        let req = [];
                        req.push($ApiService.sendEmail({
                            ToId: { 'results': ctrl.item.Application.TestPlanOwnerId.results },
                            CCId: { 'results': [ctrl.item.Application.ApprovingManagerId] },
                            Subject: $ApiService.getHTMLTemplate(template[0].Subject, { Title: ctrl.item.Application.Title }),
                            Body: $ApiService.getHTMLTemplate(template[0].Body, {
                                Title: ctrl.item.Application.Title,
                                DueDate: new Date(ctrl.item.DueDate).toLocaleDateString(),
                                APP_PAGE_LOCATION_URL: window["APP_PAGE_LOCATION_URL"]
                            }),
                            // Subject: "Reminder: " + ctrl.item.Application.Title + " Failover Exercise",
                            // Body: "Hello, <p>Just a reminder that the " + ctrl.item.Application.Title + " Failover Exercise is scheduled for " + new Date(ctrl.item.DueDate).toLocaleDateString() +
                            //     " and it is time to begin completing " +
                            //     "the required documentation.  Please complete the Application Failover Test Plan and Timeline and upload it into the " +
                            //     "<a href='" + window["APP_PAGE_LOCATION_URL"] + "#/dashboard'>Failover Exercise Portal<i style='color:red'>*</i></a> within the next two weeks.</p>" +
                            //     "<p>Please feel free to contact the EDR Team at <a href='mailto:Disasterrecoverytestteam@cvshealth.com'>Disasterrecoverytestteam@cvshealth.com</a> if you have any questions.</p>" +
                            //     "<p><span style=' font-size: 12px;color: red;'>* Supported Browsers:  Google Chrome and Edge</span></p>" +
                            //     "Thank you,<br>EDR Team",
                            // DelayDate: new Date(new Date(ctrl.item.DueDate).setDate(new Date(ctrl.item.DueDate).getDate() - 28)),
                            DelayDate: new Date(new Date().getTime() + 5 * 60000).toISOString(),
                            ApplicationId: ctrl.item.Application.Id,
                        }));
                        req.push($ApiService.sendEmail({
                            ToId: { 'results': ctrl.item.Application.TestPlanOwnerId.results },
                            CCId: { 'results': [ctrl.item.Application.ApprovingManagerId] },
                            Subject: $ApiService.getHTMLTemplate(template[1].Subject, { Title: ctrl.item.Application.Title }),
                            Body: $ApiService.getHTMLTemplate(template[1].Body, {
                                Title: ctrl.item.Application.Title,
                                DueDate: new Date(ctrl.item.DueDate).toLocaleDateString(),
                                APP_PAGE_LOCATION_URL: window["APP_PAGE_LOCATION_URL"]
                            }),
                            // Subject: "Reminder: " + ctrl.item.Application.Title + " Failover Exercise Requirement Due",
                            // Body: "Hello, <p>Just a reminder that the " + ctrl.item.Application.Title + " Failover Exercise is scheduled for " + new Date(ctrl.item.DueDate).toLocaleDateString() +
                            //     " and the Failover Exercise Requirements have not been completed. " +
                            //     "Please complete the Application Failover Test Plan and Timeline and upload into the <a href='"
                            //     + window["APP_PAGE_LOCATION_URL"] + "#/dashboard'>Failover Exercise Portal<i style='color:red'>*</i></a> as soon as possible.</p>" +
                            //     "<p>Please feel free to contact the EDR Team at <a href='mailto:Disasterrecoverytestteam@cvshealth.com'>Disasterrecoverytestteam@cvshealth.com</a> if you have any questions.</p>" +
                            //     "<p><span style=' font-size: 12px;color: red;'>* Supported Browsers:  Google Chrome and Edge</span></p>" +
                            //     "Thank you,<br>EDR Team",
                            // DelayDate: new Date(new Date(ctrl.item.DueDate).setDate(new Date(ctrl.item.DueDate).getDate() - 14)),
                            DelayDate: new Date(new Date().getTime() + 5 * 60000).toISOString(),
                            ApplicationId: ctrl.item.Application.Id,
                            RepeatDay: "3"
                        }));
                        req.push($ApiService.sendEmail({
                            ToId: { 'results': ctrl.item.Application.TestPlanOwnerId.results },
                            CCId: { 'results': [ctrl.item.Application.ApprovingManagerId] },
                            Subject: $ApiService.getHTMLTemplate(template[0].Subject, { Title: ctrl.item.Application.Title }),
                            Body: $ApiService.getHTMLTemplate(template[0].Body, {
                                Title: ctrl.item.Application.Title,
                                DueDate: new Date(ctrl.item.DueDate).toLocaleDateString(),
                                APP_PAGE_LOCATION_URL: window["APP_PAGE_LOCATION_URL"]
                            }),
                            // Subject: "Reminder: " + ctrl.item.Application.Title + " Failover Exercise Requirement Past Due",
                            // Body: "Hello, <p>Just a reminder that the " + ctrl.item.Application.Title + " Failover Exercise is scheduled for " + new Date(ctrl.item.DueDate).toLocaleDateString() +
                            //     " and the Failover Exercise Requirements have not been completed. " +
                            //     "Please complete the Application Failover Test Plan and Timeline and upload into the <a href='"
                            //     + window["APP_PAGE_LOCATION_URL"] + "#/dashboard'>Failover Exercise Portal<i style='color:red'>*</i></a> as soon as possible.</p>" +
                            //     "<p>Please feel free to contact the EDR Team at <a href='mailto:Disasterrecoverytestteam@cvshealth.com'>Disasterrecoverytestteam@cvshealth.com</a> if you have any questions.</p>" +
                            //     "<p><span style=' font-size: 12px;color: red;'>* Supported Browsers:  Google Chrome and Edge</span></p>" +
                            //     "Thank you,<br>EDR Team",
                            // DelayDate: new Date(new Date(ctrl.item.DueDate).setDate(new Date(ctrl.item.DueDate).getDate() - 17)),
                            DelayDate: new Date(new Date().getTime() + 10 * 60000).toISOString(),
                            ApplicationId: ctrl.item.Application.Id,
                            RepeatDay: "3"
                        }));
                        Promise.all(req).then(function () {
                            setTimeout(function () {
                                $scope.$apply(function () {
                                    $location.path("/owners-dashboard");
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