(function () {
    angular.module('App')
        .component('postTestResults', {
            templateUrl: window["APP_FOLDER"] + 'components/post-test-results/post-test-results.view.html?rnd' + Math.random(),
            bindings: {
                item: '='
            },
            controllerAs: 'ctrl',
            controller: ['$scope', '$ApiService', '$Preload', '$q', '$location', '$uibModal', ctrl]
        });

    function ctrl($scope, $ApiService, $Preload, $q, $location, $uibModal) {
        var ctrl = this;
        ctrl.errors = {};
        ctrl.curentApproval = null;
        ctrl.dashboardLink = window["APP_PAGE_LOCATION_URL"] + "#/dashboard";
        ctrl.approvalStatusItems = [{
            Role: "EDR Review",
            FieldName: "PostTestEDRReview",
            UserFieldName: "PostTestEDRReviewUser",
            DateFieldName: "PostTestEDRReviewDate",
            CommentFieldName: "PostTestEDRReviewComment",
            Name: "",
            Date: null,
            Approval: null
        }, {
            Role: "Manager/Tech Owner",
            FieldName: "PostTestITManager",
            UserFieldName: "PostTestITManagerUser",
            DateFieldName: "PostTestITManagerDate",
            CommentFieldName: "PostTestITManagerComment",
            Name: "",
            Date: null,
            Approval: null
        }, {
            Role: "Director/Sub Portfolio Owner",
            FieldName: "PostTestITDirector",
            UserFieldName: "PostTestITDirectorUser",
            DateFieldName: "PostTestITDirectorDate",
            CommentFieldName: "PostTestITDirectoComment",
            Name: "",
            Date: null,
            Approval: null
        },];

        setTimeout(function () {
            setCurrentApprover();
        }, 1000);

        ctrl.close = function () {
            $location.path("/dashboard");
        }

        ctrl.submit = function () {
            ctrl.errors = {};
            if (!ctrl.item.TestResultsAttachment || !ctrl.item.TestResultsAttachment.name) {
                ctrl.errors["postFile"] = "Upload Post Result file";
            }
            if (Object.keys(ctrl.errors).length) return;
            $Preload.show();
            $ApiService.deleteEmailItems(ctrl.item.Application.Id).then(function () {
                $ApiService.updateApplicationTestPlan({
                    Id: ctrl.item.Id,
                    Stage: 4,
                    CompletedResults: ctrl.item.CompletedResults,
                    PostTestEDRReview: "",
                    PostTestITManager: "",
                    PostTestITDirector: ""
                }).then(function () {
                    $ApiService.uploadFile("ApplicationAttachments", ctrl.item.TestResultsAttachment, {
                        ApplicationTestPlanId: ctrl.item.Id,
                        AttachmentType: "Tests Results"
                    }).then(function () {
                        // $ApiService.sendEmail({
                        //     ToId: { 'results': [ctrl.item.Application.TestPlanOwnerId] }, //Disasterrecoverytestteam@cvshealth.com
                        //     Subject: "Attached DR Test Results for: " + ctrl.item.Application.Title + " Failover Exercise ",
                        //     Body: "Need email template when plan owner upload post test results: Hello, <p>\"Test Plan Owner\" initial email to Request EDR review of Draft DR Test Results.</p>",
                        //     ApplicationId: ctrl.item.Application.Id,
                        // }).then(function () {
                        setTimeout(function () {
                            $scope.$apply(function () {
                                $location.path("/dashboard");
                                $Preload.hide();
                            });
                        }, 0);
                        // });
                    });
                });
            });

        }

        ctrl.reject = function () {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: window["APP_FOLDER"] + 'common/reject-modal/reject-modal.view.html?rnd' + Math.random(),
                controller: 'rejectModalCtrl',
                controllerAs: 'ctrl',
                resolve: {}
            });
            modalInstance.result.then(function (comment) {
                $Preload.show();
                let item = {
                    Id: ctrl.item.Id,
                    Stage: 3,
                };
                item[ctrl.curentApproval.FieldName] = "Rejected";
                item[ctrl.curentApproval.UserFieldName + "Id"] = window.currentSPUser.Id;
                item[ctrl.curentApproval.DateFieldName] = new Date().toISOString();
                $ApiService.updateApplicationTestPlan(item).then(function () {
                    $ApiService.deleteEmailItems(ctrl.item.Application.Id).then(function () {
                        $ApiService.sendEmail({
                            ToId: { 'results': ctrl.item.Application.TestPlanOwnerId.results },
                            CCId: { 'results': [ctrl.item.Application.ApprovingManagerId] },
                            Subject: ctrl.item.Application.Title + " Failover Exercise Requirements Rejected",
                            Body: "Hello, <p>The results you submitted for the " + ctrl.item.Application.Title + " Failover Exercise has been REJECTED for the following reasons:</p>" +
                                "<p>" + comment.replace(/\n/g, '<br>') + "</p>" +
                                "<p>Please make these updates to the Application Failover Test Plan and re-upload into the <a href='" +
                                window["APP_PAGE_LOCATION_URL"] + "#/dashboard'>Failover Exercise Portal</a> as soon as possible.</p>" +
                                "<p>Please feel free to contact the EDR Team at <a href='mailto:Disasterrecoverytestteam@cvshealth.com'>Disasterrecoverytestteam@cvshealth.com</a> if you have any questions.</p>" +
                                "Thank you,<br>EDR Team",
                            ApplicationId: ctrl.item.Application.Id,
                        }).then(function () {
                            setTimeout(function () {
                                $scope.$apply(function () {
                                    $location.path("/dashboard");
                                    $Preload.hide();
                                });
                            }, 0);
                        });
                    });
                });
            }, function () {
            });

        }
        ctrl.cancel = function () {
            $Preload.show();
            let item = {
                Id: ctrl.item.Id,
            };
            item[ctrl.curentApproval.FieldName] = "Canceled";
            item[ctrl.curentApproval.UserFieldName + "Id"] = window.currentSPUser.Id;
            item[ctrl.curentApproval.DateFieldName] = new Date().toISOString();
            $ApiService.updateApplicationTestPlan(item).then(function () {
                setTimeout(function () {
                    $scope.$apply(function () {
                        $location.path("/dashboard");
                        $Preload.hide();
                    });
                }, 0);
            });
        }
        ctrl.approve = function () {
            $Preload.show();
            let item = {
                Id: ctrl.item.Id,
            };
            item[ctrl.curentApproval.FieldName] = "Approved";
            item[ctrl.curentApproval.UserFieldName + "Id"] = window.currentSPUser.Id;
            item[ctrl.curentApproval.DateFieldName] = new Date().toISOString();
            if (ctrl.curentApproval.FieldName === "PostTestITDirector") {
                item.Stage = 5;
            }
            $ApiService.updateApplicationTestPlan(item).then(function (updatedItem) {
                if (ctrl.curentApproval.FieldName === "PostTestEDRReview") {
                    $ApiService.deleteEmailItems(ctrl.item.Application.Id).then(function () {
                        let req = [];
                        req.push($ApiService.sendEmail({
                            ToId: { 'results': [ctrl.item.Application.ApprovingManagerId, ctrl.item.Application.ApprovingDirectorId] },
                            CCId: { 'results': ctrl.item.Application.TestPlanOwnerId.results },
                            Subject: ctrl.item.Application.Title + " Failover Results Require Approval",
                            Body: "Hello, <p>You are receiving this email because the " + ctrl.item.Application.Title + " Failover Results " +
                                "require Manager/Tech Owner and Director/Sub Portfolio Owner approval for Failover Exercise completed on " + new Date(ctrl.item.DueDate).toLocaleDateString() + ". Please go to the " +
                                "<a href='" + window["APP_PAGE_LOCATION_URL"] + "#/dashboard'>Failover Portal</a>, review the Results and provide your approval as soon as possible.</p>" +
                                "<p>Please feel free to contact the EDR Team at <a href='mailto:Disasterrecoverytestteam@cvshealth.com'>Disasterrecoverytestteam@cvshealth.com</a> if you have any questions.</p>",
                            ApplicationId: ctrl.item.Application.Id,
                        }));
                        req.push($ApiService.sendEmail({
                            ToId: { 'results': [ctrl.item.Application.ApprovingManagerId] },
                            CCId: { 'results': ctrl.item.Application.TestPlanOwnerId.results },
                            // CCEmails: "disasterrecoverytestteam@cvshealth.com",
                            Subject: ctrl.item.Application.Title + " Failover Results Approval Past Due",
                            Body: "Hello, <p>You are receiving this email because you have not approved the " + ctrl.item.Application.Title +
                                " Failover Results for the Failover Exercise completed on " + new Date(ctrl.item.DueDate).toLocaleDateString() + ". Please go to the " +
                                "<a href='" + window["APP_PAGE_LOCATION_URL"] + "#/dashboard'>Failover Portal</a>, to review the Results and provide your approval as soon as possible.</p>" +
                                "<p>Please feel free to contact the EDR Team at <a href='mailto:Disasterrecoverytestteam@cvshealth.com'>Disasterrecoverytestteam@cvshealth.com</a> if you have any questions.</p>" +
                                "Thank you,<br>EDR Team",
                            // DelayDate: new Date(new Date(ctrl.item.DueDate).setDate(new Date(ctrl.item.DueDate).getDate() + 7)),
                            DelayDate: new Date(new Date().getTime() + 10 * 60000).toISOString(),
                            ApplicationId: ctrl.item.Application.Id,
                        }));
                        req.push($ApiService.sendEmail({
                            ToId: { 'results': [ctrl.item.Application.ApprovingDirectorId] },
                            CCId: { 'results': ctrl.item.Application.TestPlanOwnerId.results },
                            // CCEmails: "disasterrecoverytestteam@cvshealth.com",
                            Subject: ctrl.item.Application.Title + " Failover Results Approval Past Due",
                            Body: "Hello, <p>You are receiving this email because you have not approved the " + ctrl.item.Application.Title +
                                " Failover Results for the Failover Exercise completed on " + new Date(ctrl.item.DueDate).toLocaleDateString() + ". Please go to the " +
                                "<a href='" + window["APP_PAGE_LOCATION_URL"] + "#/dashboard'>Failover Portal</a>, review the Test Plan and provide your approval as soon as possible.</p>" +
                                "<p>Please feel free to contact the EDR Team at <a href='mailto:Disasterrecoverytestteam@cvshealth.com'>Disasterrecoverytestteam@cvshealth.com</a> if you have any questions.</p>" +
                                "Thank you,<br>EDR Team",
                            // DelayDate: new Date(new Date(ctrl.item.DueDate).setDate(new Date(ctrl.item.DueDate).getDate() + 7)),
                            DelayDate: new Date(new Date().getTime() + 10 * 60000).toISOString(),
                            ApplicationId: ctrl.item.Application.Id,
                        }));
                        Promise.all(req).then(function () {
                            setTimeout(function () {
                                $scope.$apply(function () {
                                    $location.path("/dashboard");
                                    $Preload.hide();
                                });
                            }, 0);
                        });
                    });
                }
                else if (updatedItem.PostTestITManager === "Approved" && updatedItem.PostTestITDirector === "Approved") {
                    $ApiService.deleteEmailItems(ctrl.item.Application.Id).then(function () {
                        $ApiService.updateApplicationTestPlan({
                            Id: ctrl.item.Id,
                            Stage: 5
                        }).then(function () {
                            let req = [];
                            req.push($ApiService.updateApplication({
                                Id: ctrl.item.Application.Id,
                                Status: "Completed"
                            }));
                            req.push($ApiService.sendEmail({
                                ToId: { 'results': ctrl.item.Application.TestPlanOwnerId.results },
                                Subject: ctrl.item.Application.Title + " Failover Exercise Requirements Complete",
                                Body: "Hello, <p>Thank you! You have now completed all Failover Exercise requirements for " + ctrl.item.Application.Title + ".</p>" +
                                    "Thanks again,<br>EDR Team",
                                ApplicationId: ctrl.item.Application.Id,
                            }));
                            Promise.all(req).then(function () {
                                setTimeout(function () {
                                    $scope.$apply(function () {
                                        $location.path("/dashboard");
                                        $Preload.hide();
                                    });
                                }, 0);
                            });
                        });
                    });
                }
                else {
                    setTimeout(function () {
                        $scope.$apply(function () {
                            $location.path("/dashboard");
                            $Preload.hide();
                        });
                    }, 0);
                }
            });
        }

        function setCurrentApprover() {
            // ctrl.approvalStatusItems.forEach(function (item) {
            //     if (!ctrl.curentApproval && !ctrl.item[item.FieldName]) {
            //         ctrl.curentApproval = item;
            //     }
            // });
            ctrl.approvalStatusItems.forEach(function (item) {
                if ((!ctrl.curentApproval && !ctrl.item.PostTestEDRReview && item.FieldName === "PostTestEDRReview") ||
                    (!ctrl.curentApproval && !ctrl.item.PostTestITManager && item.FieldName === "PostTestITManager" && ctrl.item.Application.ApprovingManagerId === window.currentSPUser.Id) ||
                    (!ctrl.curentApproval && !ctrl.item.PostTestITDirector && item.FieldName === "PostTestITDirector" && ctrl.item.Application.ApprovingDirectorId === window.currentSPUser.Id)) {
                    ctrl.curentApproval = item;
                }
            });
        }

        ctrl.checkShowApproverControl = function () {
            let show = true;
            ctrl.approvalStatusItems.forEach(function (item) {
                if (ctrl.item[item.FieldName] === "Rejected" || ctrl.item[item.FieldName] === "Canceled") {
                    show = false;
                }
            });
            if (ctrl.item.PostTestITDirector === 'Approved') {
                show = false;
            }
            return show;
        }
        ctrl.checkApprovalStatus = function (item) {
            return ctrl.getApprovalStatus(ctrl.item[item.FieldName]);
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
            let element = document.getElementById("post-attachment-file");
            element.addEventListener('change', ctrl.onFileChange);
            element.click();
        };

        ctrl.onFileChange = () => {
            let element = document.getElementById("post-attachment-file");
            let files = element["files"];

            setTimeout(function () {
                $scope.$apply(function () {
                    ctrl.item.TestResultsAttachment = files[0];
                });
            }, 0);

        };

        ctrl.resetFileInput = () => {
            if (ctrl.item.TestResultsAttachment.ServerRelativeUrl) {
                $ApiService.deleteFile(ctrl.item.TestResultsAttachment.ServerRelativeUrl).then(function () {
                    setTimeout(function () {
                        $scope.$apply(function () {
                            let element = document.getElementById("post-attachment-file");
                            element["value"] = "";
                            ctrl.item.TestResultsAttachment = null;
                        });
                    }, 0);

                });
            }
            else {
                let element = document.getElementById("post-attachment-file");
                element["value"] = "";
                ctrl.item.TestResultsAttachment = null;
            }
        };

        ctrl.getApprovalStatus = function (status) {
            switch (status) {
                case "Approved":
                    return '<img class="status-icon" src="' + window["APP_FOLDER"] + 'assets/approved.png" />';
                case "Canceled":
                    return '<img class="status-icon" src="' + window["APP_FOLDER"] + 'assets/cancelled.png" />';
                case "Rejected":
                    return '<img class="status-icon" src="' + window["APP_FOLDER"] + 'assets/rejected.png" />';
                default:
                    return null;
            }
        }
    }
})();