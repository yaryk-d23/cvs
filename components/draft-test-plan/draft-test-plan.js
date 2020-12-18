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
        ctrl.errors = {};
        ctrl.excerciseTimelineItems = [];
        ctrl.curentApproval = null;
        ctrl.dashboardLink = window["APP_PAGE_LOCATION_URL"] + "#/dashboard";
        ctrl.approvalStatusItems = [{
            Role: "EDR Review",
            FieldName: "TestEDRReview",
            UserFieldName: "TestEDRReviewUser",
            DateFieldName: "TestEDRReviewDate",
            CommentFieldName: "TestEDRReviewComment",
            Name: "",
            Date: null,
            Approval: null
        }, {
            Role: "IT Manager",
            FieldName: "TestITManager",
            UserFieldName: "TestITManagerUser",
            DateFieldName: "TestITManagerDate",
            CommentFieldName: "TestITManagerComment",
            Name: "",
            Date: null,
            Approval: null
        }, {
            Role: "IT Director",
            FieldName: "TestITDirector",
            UserFieldName: "TestITDirectorUser",
            DateFieldName: "TestITDirectorDate",
            CommentFieldName: "TestITDirectoComment",
            Name: "",
            Date: null,
            Approval: null
        },];

        if ($routeParams.id) {
            $ApiService.getExcerciseTimelineItems($routeParams.id).then(function (res) {
                setTimeout(function () {
                    $scope.$apply(function () {
                        ctrl.excerciseTimelineItems = res;
                        setCurrentApprover();
                    });
                }, 0);
            });
        }

        ctrl.close = function () {
            $location.path("/dashboard");
        }

        ctrl.submit = function () {
            ctrl.errors = {};
            if (!ctrl.item.TestPlanAttachment || !ctrl.item.TestPlanAttachment.name) {
                ctrl.errors["draftFile"] = "Upload test plan file";
            }
            if (Object.keys(ctrl.errors).length) return;
            $Preload.show();
            let req = [
                $ApiService.createExcerciseTimeline({
                    Title: "Application Failover Test Plan and Timeline - DRAFT",
                    Owners: "Application Teams",
                    Description: "<p>Upload the first draft of the Failover Exercise Test Plan via the " +
                        "<a href='" + window["APP_PAGE_LOCATION_URL"] + "'>Failover Portal</a>.</p>" +
                        "<p>EDR Team will review and reject/provide feedback or Approve via the Portal.</p>" +
                        "<p>1st Time Failover Testing: Application Failover Test Plan and Results Template is located on <a href='" + window["APP_PAGE_LOCATION_URL"] + "'>this link</a>.</p>" +
                        "<p>Previous Failover Testing: Use last year’s Application Failover Test Plan and Results document and update it for 2021.</p>" +
                        "<p>Located here: <a target='_blank' href='https://collab-sm.corp.cvscaremark.com/sites/DisasterRecovery/Exercises/_layouts/15/start.aspx#/Shared%20Documents/Forms/AllItems.aspx?RootFolder=%2Fsites%2FDisasterRecovery%2FExercises%2FShared%20Documents%2FApplication%20Test%20Plans%2FFailover&FolderCTID=0x0120008ED08C2B756CCF4496D4F6DDF22E6A21&View=%7B5BC6DCA6%2D5BED%2D4FA6%2DBF69%2D9F4DEF9C28E5%7D'></a></p>",
                    DueDate: new Date(new Date(ctrl.item.DueDate).setDate(new Date(ctrl.item.DueDate).getDate() - 14)).toLocaleDateString('en-us') + " - " +
                        new Date(ctrl.item.DueDate).toLocaleDateString('en-us'),
                    TestPlanItemId: ctrl.item.Id,
                }),
                $ApiService.createExcerciseTimeline({
                    Title: "Submit Request for Change (RFC)",
                    Owners: "Application Teams",
                    Description: "Submit RFC for the Failover Exercise",
                    DueDate: "TBD",
                    TestPlanItemId: ctrl.item.Id,
                }),
            ];
            Promise.all(req).then(function (res) {
                $ApiService.deleteEmailItems(ctrl.item.Application.Id).then(function () {
                    $ApiService.updateApplicationTestPlan({
                        Id: ctrl.item.Id,
                        Stage: 2,
                        TestEDRReview: "",
                        TestITManager: "",
                        TestITDirector: ""
                    }).then(function () {
                        $ApiService.uploadFile("ApplicationAttachments", ctrl.item.TestPlanAttachment, {
                            ApplicationTestPlanId: ctrl.item.Id,
                            AttachmentType: "Test Plan"
                        }).then(function () {
                            // $ApiService.sendEmail({
                            //     ToId: { 'results': [ctrl.item.Application.TestPlanOwnerId] }, //Disasterrecoverytestteam@cvshealth.com
                            //     Subject: "Add draft Test Plan for: " + ctrl.item.Application.Title + " Failover Exercise ",
                            //     Body: "Hello, <Submit>Need email template when add draft test plan</Submit>",
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
                    Stage: 1
                };
                item[ctrl.curentApproval.FieldName] = "Rejected";
                item[ctrl.curentApproval.UserFieldName + "Id"] = window.currentSPUser.Id;
                item[ctrl.curentApproval.DateFieldName] = new Date().toISOString();
                item[ctrl.curentApproval.CommentFieldName] = comment;
                $ApiService.updateApplicationTestPlan(item).then(function () {
                    $ApiService.deleteEmailItems(ctrl.item.Application.Id).then(function () {
                        $ApiService.sendEmail({
                            ToId: { 'results': ctrl.item.Application.TestPlanOwnerId.results },
                            CCId: { 'results': [ctrl.item.Application.ApprovingManagerId] },
                            Subject: ctrl.item.Application.Title + " Failover Exercise Requirements Rejected",
                            Body: "Hello, <p>The Test Plan you submitted for the " + ctrl.item.Application.Title + " Failover Exercise has been REJECTED for the following reasons:</p>" +
                                "<p>" + comment.replace(/\n/g, '<br>') + "</p>" +
                                "<p>Please make these updates to the Application Failover Test Plan and re-upload into the <a href='"
                                + window["APP_PAGE_LOCATION_URL"] + "#/dashboard'>Failover Exercise Portal</a> as soon as possible.</p>" +
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
            // if (ctrl.curentApproval.FieldName === "TestITDirector") {
            //     item.Stage = 3;
            // }

            $ApiService.updateApplicationTestPlan(item).then(function (updatedItem) {
                if (ctrl.curentApproval.FieldName === "TestEDRReview") {
                    let req = [];
                    req.push($ApiService.createExcerciseTimeline({
                        Title: "Application Failover Test Plan and Timeline – FINAL Approval Process",
                        Owners: "Application Managers and Directors",
                        Description: "<p>Upon EDR Approval of the Failover Exercise Test Plan, Approve the Final Application Failover Exercise Test Plan via the " +
                            "<a href='" + window["APP_PAGE_LOCATION_URL"] + "'>Failover Portal</a>.</p>" +
                            "<p>The final test plan MUST include the RFC and timeline (IQ/OQ)</p>",
                        DueDate: new Date(new Date(ctrl.item.DueDate).setDate(new Date(ctrl.item.DueDate).getDate() - 7)).toLocaleDateString('en-us') + " - " +
                            new Date(ctrl.item.DueDate).toLocaleDateString('en-us'),
                        TestPlanItemId: ctrl.item.Id,
                    }));
                    req.push($ApiService.sendEmail({
                        ToId: { 'results': [ctrl.item.Application.ApprovingManagerId, ctrl.item.Application.ApprovingDirectorId] },
                        CCId: { 'results': ctrl.item.Application.TestPlanOwnerId.results },
                        Subject: ctrl.item.Application.Title + " Failover Test Plan Requires Approval",
                        Body: "Hello, <p>You are receiving this email because the " + ctrl.item.Application.Title + " Failover Test Plan requires Manager and Director " +
                            "approval for the Failover Exercise scheduled on " + new Date(ctrl.item.DueDate).toLocaleDateString() + ". Please go to the " +
                            "<a href='" + window["APP_PAGE_LOCATION_URL"] + "#/dashboard'>Failover Exercise Portal</a>, review the Test Plan and provide your approval as soon as possible.</p>" +
                            "<p>Please feel free to contact the EDR Team at <a href='mailto:Disasterrecoverytestteam@cvshealth.com'>Disasterrecoverytestteam@cvshealth.com</a> if you have any questions.</p>",
                        ApplicationId: ctrl.item.Application.Id,
                    }));
                    req.push($ApiService.sendEmail({
                        ToId: { 'results': [ctrl.item.Application.ApprovingManagerId] },
                        CCId: { 'results': ctrl.item.Application.TestPlanOwnerId.results },
                        CCEmails: "disasterrecoverytestteam@cvshealth.com",
                        Subject: ctrl.item.Application.Title + " Failover Test Plan Approval Past Due",
                        Body: "Hello, <p>You are receiving this email because you have not approved the " + ctrl.item.Application.Title +
                            " Failover Test Plan for the Failover Exercise scheduled on " + new Date(ctrl.item.DueDate).toLocaleDateString() + ". Please go to the " +
                            "<a href='" + window["APP_PAGE_LOCATION_URL"] + "#/dashboard'>Failover Exercise Portal</a>, review the Test Plan and provide your approval as soon as possible.</p>" +
                            "<p>Please feel free to contact the EDR Team at <a href='mailto:Disasterrecoverytestteam@cvshealth.com'>Disasterrecoverytestteam@cvshealth.com</a> if you have any questions.</p>" +
                            "Thank you,<br>EDR Team",
                        DelayDate: new Date(new Date(ctrl.item.DueDate).setDate(new Date(ctrl.item.DueDate).getDate() - 7)),
                        // DelayDate: new Date(new Date(ctrl.item.DueDate).getTime() + 9 * 60000).toISOString(),
                        ApplicationId: ctrl.item.Application.Id,
                    }));
                    req.push($ApiService.sendEmail({
                        ToId: { 'results': [ctrl.item.Application.ApprovingDirectorId] },
                        CCId: { 'results': ctrl.item.Application.TestPlanOwnerId.results },
                        CCEmails: "disasterrecoverytestteam@cvshealth.com",
                        Subject: ctrl.item.Application.Title + " Failover Test Plan Approval Past Due",
                        Body: "Hello, <p>You are receiving this email because you have not approved the " + ctrl.item.Application.Title +
                            " Failover Test Plan for the Failover Exercise scheduled on " + new Date(ctrl.item.DueDate).toLocaleDateString() + ". Please go to the " +
                            "<a href='" + window["APP_PAGE_LOCATION_URL"] + "#/dashboard'>Failover Exercise Portal</a>, review the Test Plan and provide your approval as soon as possible.</p>" +
                            "<p>Please feel free to contact the EDR Team at <a href='mailto:Disasterrecoverytestteam@cvshealth.com'>Disasterrecoverytestteam@cvshealth.com</a> if you have any questions.</p>" +
                            "Thank you,<br>EDR Team",
                        DelayDate: new Date(new Date(ctrl.item.DueDate).setDate(new Date(ctrl.item.DueDate).getDate() - 7)),
                        // DelayDate: new Date(new Date(ctrl.item.DueDate).getTime() + 9 * 60000).toISOString(),
                        ApplicationId: ctrl.item.Application.Id,
                    }));
                    $ApiService.deleteEmailItems(ctrl.item.Application.Id).then(function () {
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
                else if (updatedItem.TestITManager === "Approved" && updatedItem.TestITDirector === "Approved") {
                    $ApiService.deleteEmailItems(ctrl.item.Application.Id).then(function () {
                        $ApiService.updateApplicationTestPlan({
                            Id: ctrl.item.Id,
                            Stage: 3
                        }).then(function () {
                            let req = [];
                            req.push($ApiService.createExcerciseTimeline({
                                Title: "Application Failover Results and Timeline - DRAFT",
                                Owners: "Application Managers and Directors",
                                Description: "<p>Upload the first draft of the Failover Exercise Results via the " +
                                    "<a href='" + window["APP_PAGE_LOCATION_URL"] + "'>Failover Portal</a>.</p>" +
                                    "<p>EDR Team will review and reject/provide feedback or Approve via the Portal</p>",
                                DueDate: new Date(ctrl.item.DueDate).toLocaleDateString('en-us') + " - " +
                                    new Date(new Date(ctrl.item.DueDate).setDate(new Date(ctrl.item.DueDate).getDate() + 7)).toLocaleDateString('en-us'),
                                TestPlanItemId: ctrl.item.Id,
                            }));
                            req.push($ApiService.sendEmail({
                                ToId: { 'results': ctrl.item.Application.TestPlanOwnerId.results },
                                CCId: { 'results': [ctrl.item.Application.ApprovingManagerId] },
                                Subject: ctrl.item.Application.Title + " Failover Exercise Requirements Complete",
                                Body: "Hello, <p>Thank you! You have now completed all the requirements for the " + ctrl.item.Application.Title +
                                    " Failover Exercise scheduled on " + new Date(ctrl.item.DueDate).toLocaleDateString() +
                                    ". Please remember that the Failover Exercise Results are due the week after the exercise.</p>" +
                                    "Thanks again,<br>EDR Team",
                                ApplicationId: ctrl.item.Application.Id,
                            }));
                            req.push($ApiService.sendEmail({
                                ToId: { 'results': ctrl.item.Application.TestPlanOwnerId.results },
                                CCId: { 'results': [ctrl.item.Application.ApprovingManagerId] },
                                Subject: ctrl.item.Application.Title + " Failover Exercise Requirements Due",
                                Body: "Hello, <p>Congratulations for completing the " + ctrl.item.Application.Title +
                                    " Failover Exercise on " + new Date(ctrl.item.DueDate).toLocaleDateString() + ". Please complete the Application Failover Results and Timeline and upload into the " +
                                    "<a href='" + window["APP_PAGE_LOCATION_URL"] + "#/dashboard'>Failover Exercise Portal</a> within the next week.</p>" +
                                    "<p>Please feel free to contact the EDR Team at <a href='mailto:Disasterrecoverytestteam@cvshealth.com'>Disasterrecoverytestteam@cvshealth.com</a> if you have any questions.</p>" +
                                    "Thank you,<br>EDR Team",
                                ApplicationId: ctrl.item.Application.Id,
                            }));
                            req.push($ApiService.sendEmail({
                                ToId: { 'results': ctrl.item.Application.TestPlanOwnerId.results },
                                CCId: { 'results': [ctrl.item.Application.ApprovingManagerId] },
                                Subject: "Reminder: " + ctrl.item.Application.Title + " Failover Exercise Requirement Due/Not Completed",
                                Body: "Hello, <p>You are receiving this email because you have an outstanding deliverable for the " + ctrl.item.Application.Title +
                                    " Failover Exercise that was completed on " + new Date(ctrl.item.DueDate).toLocaleDateString() + ". Please go to the " +
                                    "<a href='" + ctrl.dashboardLink + "'>Failover Portal</a> and complete the Failover Exercise requirements as soon as possible.</p>" +
                                    "<p>Please feel free to contact the EDR Team at <a href='mailto:Disasterrecoverytestteam@cvshealth.com'>Disasterrecoverytestteam@cvshealth.com</a> if you have any questions.</p>" +
                                    "Thank you,<br>EDR Team",
                                DelayDate: new Date(new Date(ctrl.item.DueDate).setDate(new Date(ctrl.item.DueDate).getDate() + 8)),
                                // DelayDate: new Date(new Date(ctrl.item.DueDate).getTime() + 9 * 60000).toISOString(),
                                ApplicationId: ctrl.item.Application.Id,
                            }));
                            req.push($ApiService.sendEmail({
                                ToId: { 'results': ctrl.item.Application.TestPlanOwnerId.results },
                                CCId: { 'results': [ctrl.item.Application.ApprovingManagerId] },
                                Subject: "Reminder: " + ctrl.item.Application.Title + " Failover Exercise Requirement Due/Not Completed",
                                Body: "Hello, <p>You are receiving this email because you have an outstanding deliverable for the " + ctrl.item.Application.Title +
                                    " Failover Exercise that was completed on " + new Date(ctrl.item.DueDate).toLocaleDateString() + ". Please go to the " +
                                    "<a href='" + ctrl.dashboardLink + "'>Failover Portal</a> and complete the Failover Exercise requirements as soon as possible.</p>" +
                                    "<p>Please feel free to contact the EDR Team at <a href='mailto:Disasterrecoverytestteam@cvshealth.com'>Disasterrecoverytestteam@cvshealth.com</a> if you have any questions.</p>" +
                                    "Thank you,<br>EDR Team",
                                DelayDate: new Date(new Date(ctrl.item.DueDate).setDate(new Date(ctrl.item.DueDate).getDate() + 11)),
                                // DelayDate: new Date(new Date(ctrl.item.DueDate).getTime() + 9 * 60000).toISOString(),
                                ApplicationId: ctrl.item.Application.Id,
                                RepeatDay: "3"
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
            ctrl.approvalStatusItems.forEach(function (item) {
                if ((!ctrl.curentApproval && !ctrl.item.TestEDRReview && item.FieldName === "TestEDRReview") ||
                    (!ctrl.curentApproval && !ctrl.item.TestITManager && item.FieldName === "TestITManager" && ctrl.item.Application.ApprovingManagerId === window.currentSPUser.Id) ||
                    (!ctrl.curentApproval && !ctrl.item.TestITDirector && item.FieldName === "TestITDirector" && ctrl.item.Application.ApprovingDirectorId === window.currentSPUser.Id)) {
                    ctrl.curentApproval = item;
                }
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
                    ctrl.item.TestPlanAttachment = files[0];
                });
            }, 0);

        };

        ctrl.resetFileInput = () => {
            if (ctrl.item.TestPlanAttachment.ServerRelativeUrl) {
                $ApiService.deleteFile(ctrl.item.TestPlanAttachment.ServerRelativeUrl).then(function () {
                    setTimeout(function () {
                        $scope.$apply(function () {
                            let element = document.getElementById("attachment-file");
                            element["value"] = "";
                            ctrl.item.TestPlanAttachment = null;
                        });
                    }, 0);

                });
            }
            else {
                let element = document.getElementById("attachment-file");
                element["value"] = "";
                ctrl.item.TestPlanAttachment = null;
            }
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
        ctrl.checkShowApproverControl = function () {
            let show = true;
            ctrl.approvalStatusItems.forEach(function (item) {
                if (ctrl.item[item.FieldName] === "Rejected" || ctrl.item[item.FieldName] === "Canceled") {
                    show = false;
                }
            });
            if (ctrl.item.TestITDirector === 'Approved' && ctrl.item.TestITManager === 'Approved') {
                show = false;
            }
            return show;
        }
        ctrl.checkApprovalStatus = function (item) {
            return ctrl.getApprovalStatus(ctrl.item[item.FieldName]);
        }
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

        ctrl.textToHtml = function (text) {
            if (!text) return "";
            return text.replace(/\n/g, '<br/>');
        }
    }
})();