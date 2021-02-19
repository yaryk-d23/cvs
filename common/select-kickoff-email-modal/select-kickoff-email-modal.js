(function () {
    angular.module('App')
        .controller('selectKickoffEmailModalCtrl', ctrl);

    function ctrl($uibModalInstance, $ApiService, $scope, CONSTANT) {
        var ctrl = this;
        ctrl.temeplates = [];
        $ApiService.getAllEmailTemplates().then(function(res){
            setTimeout(function () {
                $scope.$apply(function () {
                    ctrl.temeplates = res.filter(function(x){
                        return x.Category === "Kick-off";
                    });
                    ctrl.selectedTemplate = ctrl.temeplates[0];
                });
            }, 0);
        });
        ctrl.ok = function () {
            $uibModalInstance.close(ctrl.selectedTemplate);
        };
        ctrl.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

    }
})();