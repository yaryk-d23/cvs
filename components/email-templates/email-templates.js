(function () {
    angular.module('App')
        .component('emailTemplates', {
            templateUrl: window["APP_FOLDER"] + 'components/email-templates/email-templates.view.html?rnd' + Math.random(),
            bindings: {},
            controllerAs: 'ctrl',
            controller: ['$scope', '$ApiService', '$Preload', '$q', '$uibModal', '$sce', ctrl]
        });

    function ctrl($scope, $ApiService, $Preload, $q, $uibModal, $sce) {
        var ctrl = this;
        $Preload.hide();
        ctrl.allEmailTemplates = [];
        ctrl.selectedTemplate = null;
        ctrl.categoryOptions = [];
        ctrl.options = {
            height: 400,
            menubar: "edit format table",
            plugins: "link table textcolor",
            toolbar:
                "undo redo | bold italic | fontselect fontsizeselect formatselect | alignleft aligncenter alignright | forecolor backcolor",
            color_picker_callback: function (callback, value) {
                console.log(value);
                callback('#FF00FF');
            }
        };

        function loadData() {
            $ApiService.getAllEmailTemplates().then(function (res) {
                $ApiService.getListColumn("EmailTemplates", "Category").then(function (column) {
                    setTimeout(function () {
                        $scope.$apply(function () {
                            ctrl.allEmailTemplates = res;
                            ctrl.categoryOptions = column.Choices.results;
                            ctrl.selectedTemplate = null;
                            $Preload.hide();
                        });
                    }, 0);
                });
            });
        }
        loadData();

        ctrl.trustHtml = function (html) {
            return $sce.trustAsHtml(html || "");
        }

        ctrl.addNewTemplate = function () {
            $Preload.show();
            ctrl.selectedTemplate = {};
            setTimeout(function () {
                $scope.$apply(function () {
                    $Preload.hide();
                });
            }, 1500);
        }

        ctrl.editTemplate = function (template) {
            $Preload.show();
            ctrl.selectedTemplate = angular.copy(template);
            // ctrl.selectedTemplate.Body = ctrl.trustHtml(ctrl.selectedTemplate.Body);
            setTimeout(function () {
                $scope.$apply(function () {
                    $Preload.hide();
                });
            }, 1500);
        }

        ctrl.deleteEmailTemplate = function (template) {
            $Preload.show();
            $ApiService.deleteEmailTemplate(template).then(function () {
                loadData();
            });
        }

        ctrl.saveTemplate = function () {
            if (ctrl.form.$invalid) {
                angular.forEach(ctrl.form.$error, function (field) {
                    angular.forEach(field, function (errorField) {
                        errorField.$setTouched();
                    });
                });
                return;
            }
            $Preload.show();
            if (ctrl.selectedTemplate.Id) {
                $ApiService.updateEmailTemplate({
                    Id: ctrl.selectedTemplate.Id,
                    Subject: ctrl.selectedTemplate.Subject,
                    Body: ctrl.selectedTemplate.Body.replace(/\n|\t/g, ' '),
                    Name: ctrl.selectedTemplate.Name,
                    Category: ctrl.selectedTemplate.Category
                }).then(function (_) {
                    loadData();
                });
            }
            else {
                $ApiService.createEmailTemplate({
                    Title: ctrl.selectedTemplate.Name,
                    Subject: ctrl.selectedTemplate.Subject,
                    Body: ctrl.selectedTemplate.Body.replace(/\n|\t/g, ' '),
                    Name: ctrl.selectedTemplate.Name,
                    Category: ctrl.selectedTemplate.Category
                }).then(function (_) {
                    loadData();
                });
            }
        }

        ctrl.cancelEdit = function () {
            ctrl.selectedTemplate = null;
        }
    }
})();