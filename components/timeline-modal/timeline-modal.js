(function () {
    angular.module('App')
        .controller('timelineModalCtrl', ctrl);

    function ctrl($uibModalInstance, $ApiService, $scope, item) {
        var ctrl = this;
        ctrl.item = angular.copy(item) || {};
        ctrl.dateOptions = {
            formatYear: 'yyyy',
            startingDay: 1
        };
        ctrl.ok = function () {
            if (ctrl.form.$invalid) {
                angular.forEach(ctrl.form.$error, function (field) {
                    angular.forEach(field, function (errorField) {
                        errorField.$setTouched();
                    });
                });
                return;
            }
            $uibModalInstance.close(ctrl.item);
        };
        ctrl.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.uploadFile = function () {
            let element = document.getElementById("ResourcesFile");
            element.addEventListener('change', ctrl.onFileChange);
            element.click();
        };

        ctrl.onFileChange = () => {
            let element = document.getElementById("ResourcesFile");
            let files = element["files"];

            setTimeout(function () {
                $scope.$apply(function () {
                    ctrl.item.ResourcesFile = files[0];
                });
            }, 0);

        };

        ctrl.resetFileInput = () => {
            let element = document.getElementById("ResourcesFile");
            element["value"] = "";
            ctrl.item.ResourcesFile = null;
        };
    }
})();