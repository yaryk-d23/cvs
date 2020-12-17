(function () {
    angular.module('App')
        .component('applicationOwnershipDashboard', {
            templateUrl: window["APP_FOLDER"] + 'components/application-ownership-dashboard/application-ownership-dashboard.view.html?rnd' + Math.random(),
            bindings: {
                //user: '<'
            },
            controllerAs: 'ctrl',
            controller: ['$scope', '$ApiService', '$Preload', '$q', '$location', '$uibModal', ctrl]
        });

    function ctrl($scope, $ApiService, $Preload, $q, $location, $uibModal) {
        $Preload.show();
        var ctrl = this;
        ctrl.items = [];
        ctrl.filteredItems = [];
        ctrl.pageNumber = 1;
        ctrl.itemsPerPage = 10;
        ctrl.filterStartDate = getCurrentMonthFirstDate();
        ctrl.filterEndDate = getCurrentMonthLastDate();
        ctrl.dashboardLink = window["APP_PAGE_LOCATION_URL"] + "#/dashboard";

        function getData() {
            $ApiService.getMyApplicationItems().then(function (res) {
                setTimeout(function () {
                    $scope.$apply(function () {
                        ctrl.items = res;
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
                case "Approved":
                    return '<span class="statusIndicator approvedStatus" ></span>';
                case "Late":
                    return '<span class="statusIndicator notStartedStatus" ></span>';
                default:
                    return null;
            }
        };

        function getCurrentMonthFirstDate() {
            let date = new Date(),
                y = date.getFullYear(),
                m = date.getMonth();
            return new Date(y, m, 1);
        };

        function getCurrentMonthLastDate() {
            let date = new Date(),
                y = date.getFullYear(),
                m = date.getMonth();
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
                    $ApiService.sendEmail({
                        ToId: { 'results': [item.TestPlanOwnerId] },
                        CCId: { 'results': [item.TestPlanOwnerId] },
                        Subject: "Failover Exercise Notification – Incorrect Application Ownership",
                        Body: "<p>Hello EDR Team,</p>" +
                            "<p>You are receiving this email because " + item.Title + " indicated in the " +
                            "Failover Exercise Portal that the Application Ownership is incorrect.  " +
                            "<p>Comments: <br>" + comment.replace(/\n/g, '<br>') + "</p>" +
                            "Please follow up with " + item.TestPlanOwner.Title + " to correct the information. </p>" +
                            "<p>Thank you!</p>"
                    }).then(function () {
                        setTimeout(function () {
                            $scope.$apply(function () {
                                $Preload.hide();
                            });
                        }, 0);
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
                        Status: "In progress"
                    }));
                });
                Promise.all(req).then(function (_) {
                    req = [];
                    selectedApp.forEach(function (item) {
                        req.push($ApiService.sendEmail({
                            ToId: { 'results': [item.TestPlanOwnerId] },
                            CCId: { 'results': [item.ApprovingManagerId] },
                            Subject: item.Title + " Failover Exercise Requirement Due/Not Completed",
                            Body: "Hello, <p>You are receiving this email because you have an outstanding deliverable for your upcoming " + item.Title + " Failover Exercise. " +
                                "Please go to the <a href='" + ctrl.dashboardLink + "'>Failover Portal</a> and complete the Failover Exercise requirements as soon as possible.</p>" +
                                "<p>Please feel free to contact the EDR Team at <a href='mailto:Disasterrecoverytestteam@cvshealth.com'>Disasterrecoverytestteam@cvshealth.com</a> if you have any questions.</p>" +
                                "Thank you,<br>EDR Team",
                            DelayDate: new Date(new Date(item.TestDate).setDate(new Date(item.TestDate).getDate() + 9)),
                            // DelayDate: new Date(new Date(item.TestDate).getTime() + 9 * 60000).toISOString(),
                            ApplicationId: item.Id,
                        }));
                        req.push($ApiService.sendEmail({
                            ToId: { 'results': [item.TestPlanOwnerId] },
                            CCId: { 'results': [item.ApprovingManagerId] },
                            Subject: item.Title + " Failover Exercise Requirement Due/Not Completed",
                            Body: "Hello, <p>You are receiving this email because you have an outstanding deliverable for your upcoming " + item.Title + " Failover Exercise. " +
                                "Please go to the <a href='" + ctrl.dashboardLink + "'>Failover Portal</a> and complete the Failover Exercise requirements as soon as possible.</p>" +
                                "<p>Please feel free to contact the EDR Team at <a href='mailto:Disasterrecoverytestteam@cvshealth.com'>Disasterrecoverytestteam@cvshealth.com</a> if you have any questions.</p>" +
                                "Thank you,<br>EDR Team",
                            DelayDate: new Date(new Date(item.TestDate).setDate(new Date(item.TestDate).getDate() + 13)),
                            // DelayDate: new Date(new Date(item.TestDate).getTime() + 13 * 60000).toISOString(),
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
        }
    }
})();