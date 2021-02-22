(function () {
    angular.module('App')
        .controller('selectKickoffEmailModalCtrl', ctrl);

    function ctrl($uibModalInstance, $ApiService, $scope, $q) {
        var ctrl = this;
        ctrl.temeplates = [];
        ctrl.selectedCategory = "";
        $q.all({
            appCategories: $ApiService.getDRApplicationItems(),
            allEmailTemplates: $ApiService.getAllEmailTemplates()
        }).then(function (res) {
            setTimeout(function () {
                $scope.$apply(function () {
                    ctrl.categoryOptions = res.appCategories.filter(function (x) {
                        return x.ApplicationStatus === "Active" && x.TestPlanOwnerId && x.ApprovingManagerId && x.ApprovingDirectorId && !x.EmailSent && !x.ParentId;
                    }).map(function (i) {
                        return i.Category;
                    }).unique();
                    ctrl.selectedCategory = ctrl.categoryOptions ? ctrl.categoryOptions[0] : "";
                    ctrl.temeplates = res.allEmailTemplates.filter(function (x) {
                        return x.Category === "Kick-off";
                    });
                    ctrl.selectedTemplate = ctrl.temeplates[0];
                });
            }, 0);
        });
        ctrl.ok = function () {
            if (ctrl.form.$invalid) {
                angular.forEach(ctrl.form.$error, function (field) {
                    angular.forEach(field, function (errorField) {
                        errorField.$setTouched();
                    });
                });
                return;
            }
            $uibModalInstance.close({ selectedTemplate: ctrl.selectedTemplate, selectedCategory: ctrl.selectedCategory });
        };
        ctrl.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

    }
})();