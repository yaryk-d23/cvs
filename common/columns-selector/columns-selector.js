(function () {
    angular.module('App')
        .component('columnsSelector', {
            template: '<div class="form-group form-inline">'+
                '<label>Select columns:</label>'+
                '<ui-select name="ColumnsSelector" ng-model="ctrl.item.Application" theme="bootstrap"  close-on-select="true">'+
                '<ui-select-match placeholder="Select...">{{$select.selected.Title}}</ui-select-match>'+
                '<ui-select-choices repeat="app as app in ctrl.allApplications | filter: {ParentId: null}">'+
                  '<div ng-bind-html="app.Title | highlight: $select.search"></div>'+
                  '<div style="margin-left: 20px;white-space: normal;"><span><small>{{ctrl.getChidrenItems(app)}}</small></span>/div>'+
                '</ui-select-choices>'+
                '</ui-select>'+
                '</div>',
            bindings: {
                onChange: '&',
                selectedColumns: '<'
            },
            controllerAs: 'ctrl',
            controller: [ctrl]
        });

    function ctrl() {
        var ctrl = this;
        ctrl.onChange = function () {
            ctrl.onRangeChange({ selectedColumns: ctrl.startDate, endDate: ctrl.endDate });
        };

        ctrl.dateOptions = {
            formatYear: 'yyyy',
            startingDay: 1
        };

    }
})();