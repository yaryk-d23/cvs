(function () {
    angular.module('App')
        .component('applicationTestPlanDashboard', {
            templateUrl: window["APP_FOLDER"] + 'components/application-test-plan-dashboard/application-test-plan-dashboard.view.html?rnd' + Math.random(),
            bindings: {
                //user: '<'
            },
            controllerAs: 'ctrl',
            controller: ['$scope', '$ApiService', '$Preload', '$q', '$location', ctrl]
        });

    function ctrl($scope, $ApiService, $Preload, $q, $location) {
        $Preload.show();
        var ctrl = this;
        ctrl.api = $ApiService;

        ctrl.items = [];
        ctrl.filteredItems = [];
        ctrl.pageNumber = 1;
        ctrl.itemsPerPage = 10;
        ctrl.filterStartDate = getCurrentMonthFirstDate();
        ctrl.filterEndDate = getCurrentMonthLastDate();

        var getData = async () => {
            let items = await ctrl.api.getApplicationTestPlanItems();
            let applicationIds = [];
            items.forEach((item) => {
                if (applicationIds.indexOf(item.ApplicationId) === -1)
                    applicationIds.push(item.ApplicationId);
            });
            let req = [];
            applicationIds.forEach((i) => {
                req.push(ctrl.api.getDRApplicationItemById(i));
            });
            let applicationItems = await $q.all(req);
            for (let j = 0; j < items.length; j++) {
                let item = angular.copy(items[j]);
                item.Application = applicationItems.filter(
                    (x) => x.ID === item.ApplicationId
                )[0];
                let attachments = await $ApiService.getFormAttachments(item.Id);
                let TestPlanAttachment = attachments.filter(function (x) {
                    return x.AttachmentType === "Test Plan";
                })[0];
                if (TestPlanAttachment) {
                    item.TestPlanAttachment = TestPlanAttachment.File;
                }
                let TestResultsAttachment = attachments.filter(function (x) {
                    return x.AttachmentType === "Tests Results";
                })[0];
                if (TestResultsAttachment) {
                    item.TestResultsAttachment = TestResultsAttachment.File;
                }
                items[j] = item;
            }
            setTimeout(function () {
                $scope.$apply(function () {
                    ctrl.items = items;
                    ctrl.filterData();
                });
            }, 0);

        };
        getData();

        ctrl.getDraftTestPlanReceivedIndicator = function (item) {
            let currDate = new Date().getTime();
            let dueDate = new Date(new Date(item.DueDate).setDate(new Date(item.DueDate).getDate() - 14)).getTime();
            if (!item.TestPlanAttachment && currDate < dueDate) {
                return "<span class=\"statusIndicator inProgressStatus\" ></span>";
            }
            else if (!item.TestPlanAttachment && currDate > dueDate) {
                return "<span class=\"statusIndicator notStartedStatus\" ></span>";
            }
            else if (item.TestPlanAttachment) {
                return "<span class=\"statusIndicator approvedStatus\" ></span>";
            }
        };
        ctrl.getDraftTestPlanManagerApprovalIndicator = function (item) {
            let currDate = new Date().getTime();
            let dueDate = new Date(new Date(item.DueDate).setDate(new Date(item.DueDate).getDate() - 14)).getTime();
            let dueDateM7 = new Date(new Date(item.DueDate).setDate(new Date(item.DueDate).getDate() - 7)).getTime();
            if (item.Stage === 2 && item.TestEDRReview === "Approved" && (!item.TestITManager || !item.TestITDirector) && currDate < dueDate) {
                return "<span class=\"statusIndicator inProgressStatus\" ></span>";
            }
            else if (item.TestEDRReview === "Rejected") {
                return "<span class=\"statusIndicator inProgressStatus\" ></span>";
            }
            else if (item.TestEDRReview === "Rejected" && currDate > dueDate) {
                return "<span class=\"statusIndicator notStartedStatus\" ></span>";
            }
            else if (item.TestEDRReview === "Approved" && (!item.TestITManager || !item.TestITDirector) && currDate < dueDateM7) {
                return "<span class=\"statusIndicator inProgressStatus\" ></span>";
            }
            else if (item.TestEDRReview === "Approved" && (!item.TestITManager || !item.TestITDirector) && currDate > dueDateM7) {
                return "<span class=\"statusIndicator notStartedStatus\" ></span>";
            }
            else if (item.TestEDRReview === "Approved" && item.TestITManager === "Approved" && item.TestITDirector === "Approved") {
                return "<span class=\"statusIndicator approvedStatus\" ></span>";
            }
            else {
                return '<span class="statusIndicator inProgressStatus" ></span>';
            }
        };
        ctrl.getTestsResultsReceivedIndicator = function (item) {
            let currDate = new Date().getTime();
            let dueDate = new Date(new Date(item.DueDate).setDate(new Date(item.DueDate).getDate() + 8)).getTime();
            if (item.Stage === 3 && !item.TestResultsAttachment && currDate < dueDate) {
                return "<span class=\"statusIndicator inProgressStatus\" ></span>";
            }
            else if (item.Stage === 3 && !item.TestResultsAttachment && currDate > dueDate) {
                return '<span class="statusIndicator notStartedStatus" ></span>';
            }
            else if (item.TestResultsAttachment) {
                return "<span class=\"statusIndicator approvedStatus\" ></span>";
            }
            else {
                return '<span class="statusIndicator inProgressStatus" ></span>';
            }
        };
        ctrl.getTestsResultsApprovedIndicator = function (item) {
            let currDate = new Date().getTime();
            let dueDate = new Date(new Date(item.DueDate).setDate(new Date(item.DueDate).getDate() + 3)).getTime();
            let dueDateM8 = new Date(new Date(item.DueDate).setDate(new Date(item.DueDate).getDate() + 8)).getTime();
            let dueDateM7 = new Date(new Date(item.DueDate).setDate(new Date(item.DueDate).getDate() + 7)).getTime();
            if (item.PostTestEDRReview === "Rejected" && currDate < dueDateM8) {
                return "<span class=\"statusIndicator inProgressStatus\" ></span>";
            }
            else if (item.Stage === 4 && !item.PostTestEDRReview && currDate < dueDate) {
                return "<span class=\"statusIndicator inProgressStatus\" ></span>";
            }
            else if (item.Stage === 4 && !item.PostTestEDRReview && currDate > dueDate) {
                return '<span class="statusIndicator notStartedStatus" ></span>';
            }
            else if (item.PostTestEDRReview === "Approved" && (!item.PostTestITManager || !item.PostTestITDirector) && currDate < dueDateM7) {
                return "<span class=\"statusIndicator inProgressStatus\" ></span>";
            }
            else if (item.PostTestEDRReview === "Approved" && (!item.PostTestITManager || !item.PostTestITDirector) && currDate > dueDateM7) {
                return "<span class=\"statusIndicator notStartedStatus\" ></span>";
            }
            else if (item.PostTestEDRReview === "Approved" && item.PostTestITManager === "Approved" && item.PostTestITDirector === "Approved") {
                return "<span class=\"statusIndicator approvedStatus\" ></span>";
            }
            else {
                return '<span class="statusIndicator inProgressStatus" ></span>';
            }
        };

        ctrl.getStatusIndicator = (status) => {
            switch (status) {
                case "In progress":
                    return '<span class="statusIndicator inProgressStatus" ></span>';
                case "Approved":
                    return '<span class="statusIndicator approvedStatus" ></span>';
                case "Over Due":
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
                    new Date(x.DueDate).getTime() >=
                    ctrl.filterStartDate.getTime() &&
                    new Date(x.DueDate).getTime() <= ctrl.filterEndDate.getTime()
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
    }
})();