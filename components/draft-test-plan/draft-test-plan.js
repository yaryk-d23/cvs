(function () {
    angular.module('App')
        .component('draftTestPlan', {
            templateUrl: window["APP_FOLDER"] + 'components/draft-test-plan/draft-test-plan.view.html?rnd' + Math.random(),
            bindings: {
                item: '='
            },
            controllerAs: 'ctrl',
            controller: ['$scope', '$ApiService', '$Preload', '$q', '$location', '$uibModal', '$routeParams', ctrl]
        });

    function ctrl($scope, $ApiService, $Preload, $q, $location, $uibModal, $routeParams) {
        var ctrl = this;
        ctrl.api = $ApiService;
        ctrl.draftFiles = null;
        ctrl.excerciseTimelineItems = [];
        ctrl.approvalStatusItems = [{
            Role: "EDR Review",
            Name: "Alex Pashkevych",
            Date: null,
            Approval: null
        }, {
            Role: "IT Manager",
            Name: "Alex Pashkevych",
            Date: null,
            Approval: null
        }, {
            Role: "IT Director",
            Name: "Alex Pashkevych",
            Date: null,
            Approval: null
        }, {
            Role: "EDR Approval",
            Name: "Alex Pashkevych",
            Date: null,
            Approval: null
        },];


        ctrl.formatBytes = (a, b = 2) => {
            if (0 === a) return "0 bytes";
            const c = 0 > b ? 0 : b,
                d = Math.floor(Math.log(a) / Math.log(1024));
            return (
                parseFloat((a / Math.pow(1024, d)).toFixed(c)) +
                ["bytes", "kb", "mb", "gb"][d]
            );
        };

        ctrl.onClickUploadButton = () => {
            let element = document.getElementById("attachment-file");
            element.addEventListener('change', ctrl.onFileChange);
            element.click();
        };

        ctrl.onFileChange = () => {
            let element = document.getElementById("attachment-file");
            let files = element["files"];

            setTimeout(function () {
                $scope.$apply(function () {
                    ctrl.draftFiles = files;
                });
            }, 0);

        };

        ctrl.resetFileInput = () => {
            let element = document.getElementById("attachment-file");
            element["value"] = "";
            ctrl.draftFiles = null;
        };

        ctrl.openTimelineModal = function (item) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: window["APP_FOLDER"] + 'components/timeline-modal/timeline-modal.view.html?rnd' + Math.random(),
                controller: 'timelineModalCtrl',
                controllerAs: 'ctrl',
                resolve: {
                    item: function () {
                        return item || null;
                    }
                }
            });

            modalInstance.result.then(function (item) {
                ctrl.excerciseTimelineItems.push(item);
            }, function () {
            });
        }
        ctrl.getApprovalStatus = function (item) {
            switch (item.Status) {
                case "Approved":
                    return '<div class="approved"><div class="status-container approved-icon"><i class="glyphicon glyphicon-ok"></i></div></div>';
                case "Cancelled":
                    return '<div class="cancelled"><div class="status-container cancelled-icon"><i class="glyphicon glyphicon-ok"></i></div></div>';
                case "Rejected":
                    return '<div class="rejected"><div class="status-container rejected-icon"><i class="glyphicon glyphicon-ok"></i></div></div>';
                default:
                    return null;
            }
        }
    }
})();