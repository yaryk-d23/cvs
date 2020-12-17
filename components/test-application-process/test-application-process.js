(function () {
    angular.module('App')
        .component('testApplicationProcess', {
            templateUrl: window["APP_FOLDER"] + 'components/test-application-process/test-application-process.view.html?rnd' + Math.random(),
            bindings: {
                //user: '<'
            },
            controllerAs: 'ctrl',
            controller: ['$scope', '$ApiService', '$Preload', '$q', '$location', '$routeParams', ctrl]
        });

    function ctrl($scope, $ApiService, $Preload, $q, $location, $routeParams) {
        $Preload.show();
        var ctrl = this;
        ctrl.allApplications = [];
        ctrl.item = {};
        ctrl.currentUserPermissions = "";

        ctrl.loadData = function () {
            $ApiService.getDRApplicationItems().then(function (res) {
                if ($routeParams.id) {
                    $ApiService.getApplicationTestPlanItemById($routeParams.id).then(function (item) {
                        $ApiService.getFormAttachments($routeParams.id).then(function (attachments) {
                            setTimeout(function () {
                                $scope.$apply(function () {
                                    ctrl.allApplications = res.filter(function (x) {
                                        return x.ApplicationStatus === "Active" && x.TestPlanOwnerId === window.currentSPUser.Id;
                                    });
                                    ctrl.item = item;
                                    ctrl.item.DueDate = new Date(ctrl.item.DueDate);
                                    ctrl.item.Application = ctrl.allApplications.filter(function (x) {
                                        return x.Id === item.ApplicationId;
                                    })[0];
                                    let TestPlanAttachment = ctrl.item.TestPlanAttachment = attachments.filter(function (x) {
                                        return x.AttachmentType === "Test Plan";
                                    })[0];
                                    if (TestPlanAttachment) {
                                        ctrl.item.TestPlanAttachment = TestPlanAttachment.File;
                                    }
                                    let TestResultsAttachment = ctrl.item.TestResultsAttachment = attachments.filter(function (x) {
                                        return x.AttachmentType === "Tests Results";
                                    })[0];
                                    if (TestResultsAttachment) {
                                        ctrl.item.TestResultsAttachment = TestResultsAttachment.File;
                                    }

                                    let ExcerciseAttachment = ctrl.item.ExcerciseAttachment = attachments.filter(function (x) {
                                        return x.AttachmentType === "Excercise";
                                    });
                                    if (ExcerciseAttachment && ExcerciseAttachment.length) {
                                        ctrl.item.ExcerciseAttachment = ExcerciseAttachment.map(function (item) {
                                            return item.File;
                                        });
                                    }

                                    checkPermissions();
                                    $Preload.hide();
                                });
                            }, 0);

                        });
                    }, function (error) {
                        alert("Invalid Application Test Plan item ID");
                    });
                }
                else {
                    setTimeout(function () {
                        $scope.$apply(function () {
                            ctrl.allApplications = res.filter(function (x) {
                                return x.ApplicationStatus === "Active" && x.TestPlanOwnerId === window.currentSPUser.Id;
                            });
                            $Preload.hide();
                        });
                    }, 0);
                }
            });
        }
        ctrl.loadData();

        function checkPermissions() {
            if (window.currentSPUser.Id === ctrl.item.Application.TestPlanOwnerId ||
                window.currentSPUser.Id === ctrl.item.Application.ApprovingManagerId ||
                window.currentSPUser.Id === ctrl.item.Application.ApprovingDirectorId ||
                checkCurrentUserInGroup("EDR Team")) {
                ctrl.currentUserPermissions = "View";
            }
            switch (ctrl.item.Stage) {
                case 1:
                    if (window.currentSPUser.Id === ctrl.item.Application.TestPlanOwnerId) {
                        ctrl.currentUserPermissions = "Edit";
                    }
                case 2:
                    if (window.currentSPUser.Id === ctrl.item.Application.ApprovingManagerId ||
                        window.currentSPUser.Id === ctrl.item.Application.ApprovingDirectorId ||
                        checkCurrentUserInGroup("EDR Team")) {
                        ctrl.currentUserPermissions = "Edit";
                    }
                case 3:
                    if (window.currentSPUser.Id === ctrl.item.Application.TestPlanOwnerId) {
                        ctrl.currentUserPermissions = "Edit";
                    }
                case 4:
                    if (window.currentSPUser.Id === ctrl.item.Application.ApprovingManagerId ||
                        window.currentSPUser.Id === ctrl.item.Application.ApprovingDirectorId ||
                        checkCurrentUserInGroup("EDR Team")) {
                        ctrl.currentUserPermissions = "Edit";
                    }
            }
            if (!ctrl.currentUserPermissions) {
                ctrl.currentUserPermissions = "Access Denied";
            }
        }

        function checkCurrentUserInGroup(groupTitle) {
            let isMember = false;
            window.currentSPUser.Groups.forEach(function (group) {
                if (group.Title === groupTitle) {
                    isMember = true;
                }
            });
            return isMember;
        }
    }
})();