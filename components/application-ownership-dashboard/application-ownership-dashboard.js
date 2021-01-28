(function () {
    angular.module('App')
        .component('applicationOwnershipDashboard', {
            templateUrl: window["APP_FOLDER"] + 'components/application-ownership-dashboard/application-ownership-dashboard.view.html?rnd' + Math.random(),
            bindings: {
                //user: '<'
            },
            controllerAs: 'ctrl',
            controller: ['$scope', '$ApiService', '$Preload', '$q', '$location', '$uibModal', 'CONSTANT', ctrl]
        });

    function ctrl($scope, $ApiService, $Preload, $q, $location, $uibModal, CONSTANT) {
        $Preload.show();
        var ctrl = this;
        ctrl.items = [];
        ctrl.filteredItems = [];
        ctrl.pageNumber = 1;
        ctrl.itemsPerPage = 10;
        ctrl.filterStartDate = getCurrentMonthFirstDate();
        ctrl.filterEndDate = getCurrentMonthLastDate();
        ctrl.dashboardLink = window["APP_PAGE_LOCATION_URL"] + "#/owners-dashboard";

        function getData() {
            $ApiService.getMyApplicationItems().then(function (res) {
                setTimeout(function () {
                    $scope.$apply(function () {
                        ctrl.items = res || [];
                        ctrl.filterData();
                    });
                }, 0);
            });

        };
        getData();
        ctrl.getStatusIndicator = (status) => {
            switch (status) {
                case "In progress":
                    return '<span class="statusIndicator inProgressStatus" ></span>';
                case "Completed":
                    return '<span class="statusIndicator approvedStatus" ></span>';
                case "Overdue":
                    return '<span class="statusIndicator notStartedStatus" ></span>';
                default:
                    return null;
            }
        };

        function getCurrentMonthFirstDate() {
            let date = new Date(),
                y = date.getFullYear(),
                m = 0;
            return new Date(y, m, 1);
        };

        function getCurrentMonthLastDate() {
            let date = new Date(),
                y = date.getFullYear(),
                m = 11;
            return new Date(y, m + 1, 0);
        };

        ctrl.filterData = () => {
            $Preload.show();
            let items = this.filterItemsByDateRange(ctrl.items);
            items = this.getItemRange(items);
            ctrl.filteredItems = items;
            $Preload.hide();
        };

        ctrl.filterItemsByDateRange = (
            items
        ) => {
            return items.filter((x) => {
                return (
                    new Date(x.Modified).getTime() >=
                    ctrl.filterStartDate.getTime() &&
                    new Date(x.Modified).getTime() <= ctrl.filterEndDate.getTime()
                );
            });
        };

        ctrl.onDateRangeChange = (startDate, endDate) => {
            ctrl.filterStartDate = startDate;
            ctrl.filterEndDate = endDate;
            ctrl.filterData();
        };

        ctrl.getItemRange = (
            items
        ) => {
            let pageNumber = ctrl.pageNumber;
            --pageNumber;
            let start = pageNumber * ctrl.itemsPerPage;
            let end = (pageNumber + 1) * ctrl.itemsPerPage;
            let newRange = items.slice(start, end);
            return newRange;
        };

        ctrl.handlePageClick = (page) => {
            ctrl.pageNumber = page.selected;
        };

        ctrl.checkSelectedItemsLength = function () {
            return ctrl.filteredItems.filter(function (x) {
                return x.selected;
            }).length;
        }

        ctrl.setIncorrectData = function (item) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: window["APP_FOLDER"] + 'common/comments-modal/comments-modal.view.html?rnd' + Math.random(),
                controller: 'commentsModalCtrl',
                controllerAs: 'ctrl',
                resolve: {}
            });

            modalInstance.result.then(function (comment) {
                $Preload.show();
                $ApiService.deleteEmailItems(item.Id).then(function () {
                    $ApiService.getEmailTemplate(CONSTANT.INCORRECT_APP).then(function (template) {
                        $ApiService.sendEmail({
                            // ToEmails: "disasterrecoverytestteam@cvshealth.com",
                            ToEmails: "y.masyuk@chironit.com",
                            Subject: $ApiService.getHTMLTemplate(template.Subject, {}),
                            Body: $ApiService.getHTMLTemplate(template.Body, { Title: item.Title, comment: comment.replace(/\n/g, '<br>'), currentSPUser: window.currentSPUser })
                            // "<p>Hello EDR Team,</p>" +
                            //     "<p>You are receiving this email because " + item.Title + " indicated in the Failover Exercise Portal that the Application Ownership is incorrect. " +
                            //     "<p>Comments: <br>" + comment.replace(/\n/g, '<br>') + "</p>" +
                            //     "Please follow up with " + window.currentSPUser.Title +
                            //     " and inform them the information has been corrected and they should access the Failover Exercise Portal to review and approve the updates.</p>" +
                            //     "<p>Thank you!</p>"
                            // item.TestPlanOwner.results.map(function (i) { return i.Title; }).join('; ')
                        }).then(function () {
                            setTimeout(function () {
                                $scope.$apply(function () {
                                    $Preload.hide();
                                });
                            }, 0);
                        });
                    });
                });
            }, function () {
            });
        }

        ctrl.markApproved = function () {
            $Preload.show();
            let selectedApp = ctrl.filteredItems.filter(function (x) {
                return x.selected;
            });
            let req = [];
            selectedApp.forEach(function (item) {
                req.push($ApiService.deleteEmailItems(item.Id));
            });
            Promise.all(req).then(function () {
                req = [];
                selectedApp.forEach(function (item) {
                    req.push($ApiService.updateApplication({
                        Id: item.Id,
                        Status: "Completed"
                    }));
                });
                Promise.all(req).then(function (_) {
                    Promise.all([
                        $ApiService.getEmailTemplate(CONSTANT.MARK_APPROVED_REMINDER,
                        $ApiService.getEmailTemplate(CONSTANT.DELAY_MARK_APPROVED_REMINDER)
                        )]).then(function (template) {
                            req = [];
                            selectedApp.forEach(function (item) {
                                req.push($ApiService.sendEmail({
                                    ToId: { 'results': item.TestPlanOwnerId.results },
                                    CCId: { 'results': [item.ApprovingManagerId] },
                                    Subject: $ApiService.getHTMLTemplate(template[0].Subject, { Title: item.Title }),
                                    Body: $ApiService.getHTMLTemplate(template[0].Body, { Title: item.Title, dashboardLink: ctrl.dashboardLink }),
                                    // "Hello, <p>You are receiving this email because you have an outstanding deliverable for your upcoming " + item.Title + " Failover Exercise. " +
                                    //     "Please go to the <a href='" + ctrl.dashboardLink + "'>Failover Portal<i style='color:red'>*</i></a> and complete the Failover Exercise requirements as soon as possible.</p>" +
                                    //     "<p>Please feel free to contact the EDR Team at <a href='mailto:Disasterrecoverytestteam@cvshealth.com'>Disasterrecoverytestteam@cvshealth.com</a> if you have any questions.</p>" +
                                    //     "<p><span style=' font-size: 12px;color: red;'>* Supported Browsers:  Google Chrome and Edge</span></p>" +
                                    //     "Thank you,<br>EDR Team",
                                    DelayDate: new Date(new Date(item.TestDate).setDate(new Date(item.TestDate).getDate() + 9)),
                                    // DelayDate: new Date(new Date().getTime() + 10 * 60000).toISOString(),
                                    ApplicationId: item.Id,
                                }));
                                req.push($ApiService.sendEmail({
                                    ToId: { 'results': item.TestPlanOwnerId.results },
                                    CCId: { 'results': [item.ApprovingManagerId] },
                                    Subject: $ApiService.getHTMLTemplate(template[1].Subject, { Title: item.Title }),
                                    Body: $ApiService.getHTMLTemplate(template.Body[1], { Title: item.Title, dashboardLink: ctrl.dashboardLink }), 
                                        // "Hello, <p>You are receiving this email because you have an outstanding deliverable for your upcoming " + item.Title + " Failover Exercise. " +
                                        // "Please go to the <a href='" + ctrl.dashboardLink + "'>Failover Portal<i style='color:red'>*</i></a> and complete the Failover Exercise requirements as soon as possible.</p>" +
                                        // "<p>Please feel free to contact the EDR Team at <a href='mailto:Disasterrecoverytestteam@cvshealth.com'>Disasterrecoverytestteam@cvshealth.com</a> if you have any questions.</p>" +
                                        // "<p><span style=' font-size: 12px;color: red;'>* Supported Browsers:  Google Chrome and Edge</span></p>" +
                                        // "Thank you,<br>EDR Team",
                                    DelayDate: new Date(new Date(item.TestDate).setDate(new Date(item.TestDate).getDate() + 13)),
                                    // DelayDate: new Date(new Date().getTime() + 10 * 60000).toISOString(),
                                    ApplicationId: item.Id,
                                }));
                            });
                            Promise.all(req).then(function (_) {
                                setTimeout(function () {
                                    $scope.$apply(function () {
                                        $Preload.hide();
                                        getData();
                                    });
                                }, 0);
                            });
                        });
                });
            });
        }
    }
})();