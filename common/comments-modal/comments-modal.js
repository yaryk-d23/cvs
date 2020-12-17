(function () {
    angular.module('App')
        .controller('commentsModalCtrl', ctrl);

    function ctrl($uibModalInstance, $ApiService, $scope) {
        var ctrl = this;
        ctrl.comments = "";
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