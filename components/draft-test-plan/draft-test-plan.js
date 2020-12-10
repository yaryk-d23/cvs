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
        ctrl.errors = {};
        ctrl.draftFile = null;
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
        },];

        if ($routeParams.id) {
            $ApiService.getExcerciseTimelineItems($routeParams.id).then(function (res) {
                setTimeout(function () {
                    $scope.$apply(function () {
                        ctrl.excerciseTimelineItems = res;
                    });
                }, 0);
            });
        }

        ctrl.close = function () {
            $location.path("/dashboard");
        }

        ctrl.submit = function () {
            ctrl.errors = {};
            if (!ctrl.draftFile || !ctrl.draftFile.name) {
                ctrl.errors["draftFile"] = "Upload test plan file";
            }
            if (!ctrl.excerciseTimelineItems || !ctrl.excerciseTimelineItems.length) {
                ctrl.errors["excerciseTimelineItems"] = "Add Excercise timeline item(s)";
            }
            if (Object.keys(ctrl.errors).length) return;
            $Preload.show();
            let req = [];
            ctrl.excerciseTimelineItems.forEach(function (item) {
                if (item.Id) {
                    req.push($ApiService.updateExcerciseTimeline(item));
                }
                else {
                    item.TestPlanItemId = ctrl.item.Id
                    item.ResourcesLink = {
                        '__metadata': { 'type': 'SP.FieldUrlValue' },
                        'Description': item.ResourcesLink,
                        'Url': item.ResourcesLink
                    };
                    req.push($ApiService.createExcerciseTimeline(item));
                }
            });
            Promise.all(req).then(function (res) {
                $ApiService.updateApplicationTestPlan({
                    Id: ctrl.item.Id,
                    Stage: 2
                }).then(function () {
                    setTimeout(function () {
                        $scope.$apply(function () {
                            $location.path("/dashboard");
                            $Preload.hide();
                        });
                    }, 0);
                });
            });

        }

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
                    ctrl.draftFile = files[0];
                });
            }, 0);

        };

        ctrl.resetFileInput = () => {
            let element = document.getElementById("attachment-file");
            element["value"] = "";
            ctrl.draftFile = null;
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
        ctrl.getApprovalStatus = function (status) {
            switch (status) {
                case "Approved":
                    return '<img class="status-icon" src="' + window["APP_FOLDER"] + 'assets/approved.png" />';
                case "Cancelled":
                    return '<img class="status-icon" src="' + window["APP_FOLDER"] + 'assets/cancelled.png" />';
                case "Rejected":
                    return '<img class="status-icon" src="' + window["APP_FOLDER"] + 'assets/rejected.png" />';
                default:
                    return null;
            }
        }

        ctrl.textToHtml = function (text) {
            if (!text) return "";
            return text.replace(/\n/g, '<br/>');
        }
    }
})();