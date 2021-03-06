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
                                        return x.ApplicationStatus === "Active" && x.Status === "Completed" && x.TestPlanOwnerId &&
                                            (x.TestPlanOwnerId.results.indexOf(window.currentSPUser.Id) !== -1 ||
                                                x.ApprovingManagerId === window.currentSPUser.Id ||
                                                x.ApprovingDirectorId === window.currentSPUser.Id)
                                            && x.TestDate;
                                    });
                                    ctrl.item = item;
                                    ctrl.item.DueDate = new Date(ctrl.item.DueDate);
                                    ctrl.item.Application = res.filter(function (x) {
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

                                    let ExerciseAttachment = ctrl.item.ExerciseAttachment = attachments.filter(function (x) {
                                        return x.AttachmentType === "Exercise";
                                    });
                                    if (ExerciseAttachment && ExerciseAttachment.length) {
                                        ctrl.item.ExerciseAttachment = ExerciseAttachment.map(function (item) {
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
                                return x.ApplicationStatus === "Active" && x.Status === "Completed" && x.TestPlanOwnerId &&
                                    (x.TestPlanOwnerId.results.indexOf(window.currentSPUser.Id) !== -1 ||
                                        x.ApprovingManagerId === window.currentSPUser.Id ||
                                        x.ApprovingDirectorId === window.currentSPUser.Id)
                                    && x.TestDate;
                            });
                            $Preload.hide();
                        });
                    }, 0);
                }
            });
        }
        ctrl.loadData();

        function checkPermissions() {
            if (ctrl.item.Application.TestPlanOwnerId.results.indexOf(window.currentSPUser.Id) !== -1 ||
                window.currentSPUser.Id === ctrl.item.Application.ApprovingManagerId ||
                window.currentSPUser.Id === ctrl.item.Application.ApprovingDirectorId ||
                checkCurrentUserInGroup("EDR Team")) {
                ctrl.currentUserPermissions = "View";
            }

            if (ctrl.item.Stage === 1 && ctrl.item.Application.TestPlanOwnerId.results.indexOf(window.currentSPUser.Id) !== -1) {
                ctrl.currentUserPermissions = "Edit";
            }

            if (ctrl.item.Stage === 2) {
                        if(!ctrl.item.TestEDRReview && checkCurrentUserInGroup("EDR Team")){
                            ctrl.currentUserPermissions = "Edit";
                        }
                        else if(ctrl.item.TestEDRReview && !ctrl.item.TestITManager && window.currentSPUser.Id === ctrl.item.Application.ApprovingManagerId){
                            ctrl.currentUserPermissions = "Edit";
                        }
                        else if(ctrl.item.TestEDRReview && !ctrl.item.TestITDirector && window.currentSPUser.Id === ctrl.item.Application.ApprovingDirectorId){
                            ctrl.currentUserPermissions = "Edit";
                        }
                
            }

            if (ctrl.item.Stage === 3 && ctrl.item.Application.TestPlanOwnerId.results.indexOf(window.currentSPUser.Id) !== -1) {
                ctrl.currentUserPermissions = "Edit";
            }

            if (ctrl.item.Stage === 4) {
                    if(!ctrl.item.PostTestEDRReview && checkCurrentUserInGroup("EDR Team")){
                        ctrl.currentUserPermissions = "Edit";
                    }
                    else if(ctrl.item.PostTestEDRReview && !ctrl.item.PostTestITManager && window.currentSPUser.Id === ctrl.item.Application.ApprovingManagerId){
                        ctrl.currentUserPermissions = "Edit";
                    }
                    else if(ctrl.item.PostTestEDRReview && !ctrl.item.PostTestITDirector && window.currentSPUser.Id === ctrl.item.Application.ApprovingDirectorId){
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