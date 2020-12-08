(function () {
    angular.module('App')
        .component('dateRange', {
            templateUrl: window["APP_FOLDER"] + 'common/date-range/date-range.view.html?rnd' + Math.random(),
            bindings: {
                onRangeChange: '&',
                startDate: '<',
                endDate: '<'
            },
            controllerAs: 'ctrl',
            controller: [ctrl]
        });

    function ctrl() {
        var ctrl = this;
        ctrl.onChange = function () {
            ctrl.onRangeChange({ startDate: ctrl.startDate, endDate: ctrl.endDate });
        };

        ctrl.dateOptions = {
            formatYear: 'yyyy',
            startingDay: 1
        };

    }
})();