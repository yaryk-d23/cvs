(function () {
    angular.module('App')
        .component('ownerDashboardContainer', {
            templateUrl: window["APP_FOLDER"] + 'components/owner-dashboard-container/owner-dashboard-container.view.html?rnd' + Math.random(),
            bindings: {
                //user: '<'
            },
            controllerAs: 'ctrl',
            controller: [ ctrl]
        });

    function ctrl() {
        var ctrl = this;
    }
})();