(function () {
    angular.module('App')
        .controller('selectKickoffEmailModalCtrl', ctrl);

    function ctrl($uibModalInstance, $ApiService, $scope, CONSTANT) {
        var ctrl = this;
        ctrl.temeplates = CONSTANT.KickoffEmailTemplates;
        ctrl.selectedTemplate = ctrl.temeplates[0];
        ctrl.ok = function () {
            $uibModalInstance.close(ctrl.selectedTemplate);
        };
        ctrl.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

    }
})();