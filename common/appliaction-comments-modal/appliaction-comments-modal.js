(function () {
    angular.module('App')
        .controller('appliactionCommentsModalCtrl', ctrl);

    function ctrl(item, $uibModalInstance) {
        var ctrl = this;
        ctrl.item = item;
        ctrl.comments = ctrl.item.Comments;
        ctrl.ok = function () {
            if (ctrl.form.$invalid) {
                angular.forEach(ctrl.form.$error, function (field) {
                    angular.forEach(field, function (errorField) {
                        errorField.$setTouched();
                    });
                });
                return;
            }
            $uibModalInstance.close(ctrl.comments);
        };
        ctrl.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

    }
})();