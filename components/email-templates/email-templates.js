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
        ctrl.categoryOptions = ["Kick-off", "Reminder"];
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
                setTimeout(function () {
                    $scope.$apply(function () {
                        ctrl.allEmailTemplates = res;
                        ctrl.selectedTemplate = null;
                        $Preload.hide();
                    });
                }, 0);
            });
        }
        loadData();

        ctrl.trustHtml = function (html) {
            return $sce.trustAsHtml(html || "");
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

        ctrl.saveTemplate = function () {
            $Preload.show();
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

        ctrl.cancelEdit = function () {
            ctrl.selectedTemplate = null;
        }
    }
})();