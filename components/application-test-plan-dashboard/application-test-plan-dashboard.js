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
            items.map((item) => {
                item.Application = applicationItems.filter(
                    (x) => x.ID === item.ApplicationId
                )[0];
                return item;
            });
            setTimeout(function () {
                $scope.$apply(function () {
                    ctrl.items = items;
                    ctrl.filterData();
                });
            }, 0);

        };
        getData();

        ctrl.getDraftTestPlanReceivedIndicator = (
            item
        ) => {
            return "<span class=\"statusIndicator approvedStatus\" ></span>";
        };
        ctrl.getDraftTestPlanManagerApprovalIndicator = (
            item
        ) => {
            return '<span class="statusIndicator approvedStatus" ></span>';
        };
        ctrl.getTestsResultsReceivedIndicator = (
            item
        ) => {
            return '<span class="statusIndicator approvedStatus" ></span>';
        };
        ctrl.getTestsResultsApprovedIndicator = (
            item
        ) => {
            return '<span class="statusIndicator approvedStatus" ></span>';
        };

        ctrl.getStatusIndicator = (status) => {
            switch (status) {
                case "In progress":
                    return '<span class="statusIndicator inProgressStatus" ></span>';
                case "Approved":
                    return '<span class="statusIndicator approvedStatus" ></span>';
                case "Not Started":
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
            let items = this.filterItemsByDateRange(ctrl.items);
            items = this.getItemRange(items);
            ctrl.filteredItems = items;
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
    }
})();