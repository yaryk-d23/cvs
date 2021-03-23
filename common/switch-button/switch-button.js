(function () {
    angular.module('App')
        .component('switchButton', {
            template: '<label class="switch">' +
                    '<input type="checkbox" ng-model="ctrl.selected" ng-change="ctrl.onChangeValue()">' +
                    '<span class="slider round"></span>' +
                '</label>',
            bindings: {
                onChange: '&',
                defaultValue: '<',
            },
            controllerAs: 'ctrl',
            controller: [ctrl]
        });

    function ctrl() {
        var ctrl = this;
        ctrl.selected = ctrl.defaultValue;
        ctrl.onChangeValue = function () {
            ctrl.onChange({ value: ctrl.selected});
        };
    }
})();