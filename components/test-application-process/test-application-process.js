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
        ctrl.allTestPlanItems = [];
        ctrl.item = {};
        ctrl.currentUserPermissions = "";

        ctrl.loadData = function () {
            $q.all({
                applications: $ApiService.getDRApplicationItems(),
                testPlanItems: $ApiService.getApplicationTestPlanItems()
            }).then(function (res) {
                ctrl.allTestPlanItems = res.testPlanItems;
                if ($routeParams.id) {
                    $ApiService.getApplicationTestPlanItemById($routeParams.id).then(function (item) {
                        $ApiService.getFormAttachments($routeParams.id).then(function (attachments) {
                            setTimeout(function () {
                                $scope.$apply(function () {
                                    ctrl.allApplications = res.applications.filter(function (x) {
                                        return x.ApplicationStatus === "Active" && x.Status === "Completed" && x.TestPlanOwnerId &&
                                            (x.TestPlanOwnerId.results.indexOf(window.currentSPUser.Id) !== -1 ||
                                                x.ApprovingManagerId === window.currentSPUser.Id ||
                                                x.ApprovingDirectorId === window.currentSPUser.Id)
                                            && x.TestDate;
                                    });
                                    ctrl.item = item;
                                    ctrl.item.DueDate = new Date(ctrl.item.DueDate);
                                    ctrl.item.Application = res.applications.filter(function (x) {
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
                            ctrl.allApplications = res.applications.filter(function (x) {
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
                if (!ctrl.item.TestEDRReview && checkCurrentUserInGroup("EDR Team")) {
                    ctrl.currentUserPermissions = "Edit";
                }
                else if (ctrl.item.TestEDRReview && !ctrl.item.TestITManager && window.currentSPUser.Id === ctrl.item.Application.ApprovingManagerId) {
                    ctrl.currentUserPermissions = "Edit";
                }
                else if (ctrl.item.TestEDRReview && !ctrl.item.TestITDirector && window.currentSPUser.Id === ctrl.item.Application.ApprovingDirectorId) {
                    ctrl.currentUserPermissions = "Edit";
                }

            }

            if (ctrl.item.Stage === 3 && ctrl.item.Application.TestPlanOwnerId.results.indexOf(window.currentSPUser.Id) !== -1) {
                ctrl.currentUserPermissions = "Edit";
            }

            if (ctrl.item.Stage === 4) {
                if (!ctrl.item.PostTestEDRReview && checkCurrentUserInGroup("EDR Team")) {
                    ctrl.currentUserPermissions = "Edit";
                }
                else if (ctrl.item.PostTestEDRReview && !ctrl.item.PostTestITManager && window.currentSPUser.Id === ctrl.item.Application.ApprovingManagerId) {
                    ctrl.currentUserPermissions = "Edit";
                }
                else if (ctrl.item.PostTestEDRReview && !ctrl.item.PostTestITDirector && window.currentSPUser.Id === ctrl.item.Application.ApprovingDirectorId) {
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

        ctrl.checkShowRejectMsg = function () {
            return ctrl.item.TestEDRReview === "Rejected" || 
            ctrl.item.TestITDirector === "Rejected" || 
            ctrl.item.TestITManager === "Rejected" || 
            ctrl.item.PostTestEDRReview === "Rejected" || 
            ctrl.item.PostTestITDirector === "Rejected" || 
            ctrl.item.PostTestITManager === "Rejected";
        }

        ctrl.getRejectUser = function() {
            if(ctrl.item.TestEDRReview === "Rejected") {
                return ctrl.item.TestEDRReviewUser.Title;
            }
            if(ctrl.item.TestITDirector === "Rejected") {
                return ctrl.item.TestITDirectorUser.Title;
            }
            if(ctrl.item.TestITManager === "Rejected") {
                return ctrl.item.TestITManagerUser.Title;
            }
            if(ctrl.item.PostTestEDRReview === "Rejected") {
                return ctrl.item.PostTestEDRReviewUser.Title;
            }
            if(ctrl.item.PostTestITDirector === "Rejected") {
                return ctrl.item.PostTestITDirectorUser.Title;
            }
            if(ctrl.item.PostTestITManager === "Rejected") {
                return ctrl.item.PostTestITManagerUser.Title;
            }
        }

        ctrl.getRejectComments = function() {
            if(ctrl.item.TestEDRReview === "Rejected") {
                return ctrl.item.TestEDRReviewComment ? ctrl.item.TestEDRReviewComment.replace(/\n/g, '<br/>') : "";
            }
            if(ctrl.item.TestITDirector === "Rejected") {
                return ctrl.item.TestITDirectoComment ? ctrl.item.TestITDirectoComment.replace(/\n/g, '<br/>') : "";
            }
            if(ctrl.item.TestITManager === "Rejected") {
                return ctrl.item.TestITManagerComment ? ctrl.item.TestITManagerComment.replace(/\n/g, '<br/>') : "";
            }
            if(ctrl.item.PostTestEDRReview === "Rejected") {
                return ctrl.item.PostTestEDRReviewComment ? ctrl.item.PostTestEDRReviewComment.replace(/\n/g, '<br/>') : "";
            }
            if(ctrl.item.PostTestITDirector === "Rejected") {
                return ctrl.item.PostTestITDirectoComment ? ctrl.item.PostTestITDirectoComment.replace(/\n/g, '<br/>') : "";
            }
            if(ctrl.item.PostTestITManager === "Rejected") {
                return ctrl.item.PostTestITManagerComment ? ctrl.item.PostTestITManagerComment.replace(/\n/g, '<br/>') : "";
            }
        }
    }
})();