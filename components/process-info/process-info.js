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
        var currYear = new Date().getFullYear();
        ctrl.dateOptions = {
            formatYear: 'yyyy',
            startingDay: 1
        };

        ctrl.close = function () {
            $location.path("/dashboard");
        }

        ctrl.getChidrenItems = function(item) {
            return ctrl.allApplications.filter(function(x){
                return x.ParentId === item.Id;
            }).map(function(i){
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
            $Preload.show();
            $ApiService.createApplicationTestPlan({
                ApplicationId: ctrl.item.Application.Id,
                DueDate: dayjs(ctrl.item.DueDate).format('YYYY-MM-DDTHH:mm:ss'),
                Stage: 1,
            }).then(function (res) {
                let req = [
                    $ApiService.createExerciseTimeline({
                        Title: "Identify any changes to Application ownership",
                        SortOrder: 1,
                        Owners: "Application Teams",
                        Description: "Application Ownership / POC changes must be acknowledged and updated via the " +
                            "<a href='" + window["APP_PAGE_LOCATION_URL"] + "#/dashboard'>Failover Exercise Portal</a>.",
                        DueDate: new Date(ctrl.item.Application.TestDate).toLocaleDateString('en-us') + " - "
                            + new Date(new Date(ctrl.item.Application.TestDate).setDate(new Date(ctrl.item.Application.TestDate).getDate() + 7)).toLocaleDateString('en-us'),
                        TestPlanItemId: res.data.Id,

                    }),
                    $ApiService.createExerciseTimeline({
                        Title: "Identify and submit " + currYear + " Failover Exercise date",
                        SortOrder: 2,
                        Owners: "Application Teams",
                        Description: "Test dates must be identified and submitted via the " +
                            "<a href='" + window["APP_PAGE_LOCATION_URL"] + "#/dashboard'>Failover Exercise Portal</a>.",
                        DueDate: new Date(ctrl.item.Application.TestDate).toLocaleDateString('en-us') + " - "
                            + new Date(new Date(ctrl.item.Application.TestDate).setDate(new Date(ctrl.item.Application.TestDate).getDate() + 14)).toLocaleDateString('en-us'),
                        TestPlanItemId: res.data.Id,

                    }),
                    $ApiService.createExerciseTimeline({
                        Title: "Application Failover Test Plan and Timeline - DRAFT",
                        SortOrder: 3,
                        Owners: "Application Teams",
                        Description: "<p>Upload the first draft of the Failover Exercise Test Plan via the " +
                            "<a href='" + window["APP_PAGE_LOCATION_URL"] + "'>Failover Portal</a>.</p>" +
                            "<p>EDR Team will review and reject/provide feedback or Approve via the Portal.</p>" +
                            "<p>1st Time Failover Testing: Application Failover Test Plan and Results Template is located on " +
                            "<a href='https://collab-sm.corp.cvscaremark.com/sites/DisasterRecovery/Exercises/SitePages/Home.aspx?RootFolder=%2Fsites%2FDisasterRecovery%2FExercises%2FShared%20Documents%2FExercises%2F2021%20EDR%20Exercises%2FFailover&FolderCTID=0x0120008ED08C2B756CCF4496D4F6DDF22E6A21&View=%7B2122DA51%2D3F10%2D43CF%2DAC61%2DE90D82A513EF%7D'>Failover</a> section of the EDR SharePoint site.</p>" +
                            "<p>Previous Failover Testing: Use last year’s Application Failover Test Plan and Results document and update it for " + currYear + ".</p>" +
                            "<p>Located here: <a target='_blank' href='https://collab-sm.corp.cvscaremark.com/sites/DisasterRecovery/Exercises/_layouts/15/start.aspx#/Shared%20Documents/Forms/AllItems.aspx?RootFolder=%2Fsites%2FDisasterRecovery%2FExercises%2FShared%20Documents%2FApplication%20Test%20Plans%2FFailover&FolderCTID=0x0120008ED08C2B756CCF4496D4F6DDF22E6A21&View=%7B5BC6DCA6%2D5BED%2D4FA6%2DBF69%2D9F4DEF9C28E5%7D'>Failover Test Plans</a>.</p>",
                        DueDate: new Date(res.data.Created).toLocaleDateString('en-us') + " - " + new Date(new Date(res.data.DueDate).setDate(new Date(res.data.DueDate).getDate() - 14)).toLocaleDateString('en-us'),
                        TestPlanItemId: res.data.Id,
                    }),
                    $ApiService.createExerciseTimeline({
                        Title: "Submit Request for Change (RFC)",
                        SortOrder: 4,
                        Owners: "Application Teams",
                        Description: "Submit RFC for the Failover Exercise",
                        DueDate: "Follow normal guidelines/lead time for RFC submissions",
                        TestPlanItemId: res.data.Id,
                    }),
                    $ApiService.createExerciseTimeline({
                        Title: "Application Failover Test Plan and Timeline – FINAL Approval Process",
                        SortOrder: 5,
                        Owners: "Application Managers/Tech Owners and Directors/Sub Portfolio Owners",
                        Description: "<p>Upon EDR Approval of the Failover Exercise Test Plan, Approve the Final Application Failover Exercise Test Plan via the " +
                            "<a href='" + window["APP_PAGE_LOCATION_URL"] + "'>Failover Portal</a>.</p>" +
                            "<p>The final test plan MUST include the RFC and timeline (IQ/OQ)</p>",
                        DueDate: new Date(new Date(res.data.DueDate).setDate(new Date(res.data.DueDate).getDate() - 7)).toLocaleDateString('en-us') + " - " +
                            new Date(res.data.DueDate).toLocaleDateString('en-us'),
                        TestPlanItemId: res.data.Id,
                    })
                ];
                Promise.all(req).then(function (res) {
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
                                        $location.path("/dashboard");
                                        $Preload.hide();
                                    });
                                }, 0);
                            });
                        });
                    });
                });
            });
        }

    }
})();