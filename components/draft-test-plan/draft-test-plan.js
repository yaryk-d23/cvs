(function () {
    angular.module('App')
        .component('draftTestPlan', {
            templateUrl: window["APP_FOLDER"] + 'components/draft-test-plan/draft-test-plan.view.html?rnd' + Math.random(),
            bindings: {
                item: '=',
                currentUserPermissions: "<"
            },
            controllerAs: 'ctrl',
            controller: ['$scope', '$ApiService', '$Preload', '$q', '$location', '$uibModal', '$routeParams', ctrl]
        });

    function ctrl($scope, $ApiService, $Preload, $q, $location, $uibModal, $routeParams) {
        var ctrl = this;
        ctrl.errors = {};
        ctrl.exerciseTimelineItems = [];
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
            Role: "Manager/Tech Owner",
            FieldName: "TestITManager",
            UserFieldName: "TestITManagerUser",
            DateFieldName: "TestITManagerDate",
            CommentFieldName: "TestITManagerComment",
            Name: "",
            Date: null,
            Approval: null
        }, {
            Role: "Director/Sub Portfolio Owner",
            FieldName: "TestITDirector",
            UserFieldName: "TestITDirectorUser",
            DateFieldName: "TestITDirectorDate",
            CommentFieldName: "TestITDirectoComment",
            Name: "",
            Date: null,
            Approval: null
        },];

        if ($routeParams.id) {
            $ApiService.getExerciseTimelineItems($routeParams.id).then(function (res) {
                setTimeout(function () {
                    $scope.$apply(function () {
                        ctrl.exerciseTimelineItems = res.sort(function (a,b) {
                            return a.SortOrder - b.SordOrder;
                        });
                        setExercisesDueDate();
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
            // let req = [
            //     $ApiService.createExerciseTimeline({
            //         Title: "Application Failover Test Plan and Timeline - DRAFT",
            //         Owners: "Application Teams",
            //         Description: "<p>Upload the first draft of the Failover Exercise Test Plan via the " +
            //             "<a href='" + window["APP_PAGE_LOCATION_URL"] + "'>Failover Portal</a>.</p>" +
            //             "<p>EDR Team will review and reject/provide feedback or Approve via the Portal.</p>" +
            //             "<p>1st Time Failover Testing: Application Failover Test Plan and Results Template is located on " +
            //             "<a href='https://collab-sm.corp.cvscaremark.com/sites/DisasterRecovery/Exercises/SitePages/Home.aspx?RootFolder=%2Fsites%2FDisasterRecovery%2FExercises%2FShared%20Documents%2FExercises%2F2021%20EDR%20Exercises%2FFailover&FolderCTID=0x0120008ED08C2B756CCF4496D4F6DDF22E6A21&View=%7B2122DA51%2D3F10%2D43CF%2DAC61%2DE90D82A513EF%7D'>Failover</a>section of the EDR SharePoint site.</p>" +
            //             "<p>Previous Failover Testing: Use last year’s Application Failover Test Plan and Results document and update it for " + new Date().getFullYear() + ".</p>" +
            //             "<p>Located here: <a target='_blank' href='https://collab-sm.corp.cvscaremark.com/sites/DisasterRecovery/Exercises/_layouts/15/start.aspx#/Shared%20Documents/Forms/AllItems.aspx?RootFolder=%2Fsites%2FDisasterRecovery%2FExercises%2FShared%20Documents%2FApplication%20Test%20Plans%2FFailover&FolderCTID=0x0120008ED08C2B756CCF4496D4F6DDF22E6A21&View=%7B5BC6DCA6%2D5BED%2D4FA6%2DBF69%2D9F4DEF9C28E5%7D'></a></p>",
            //         DueDate: new Date(new Date(ctrl.item.DueDate).setDate(new Date(ctrl.item.DueDate).getDate() - 14)).toLocaleDateString('en-us') + " - " +
            //             new Date(ctrl.item.DueDate).toLocaleDateString('en-us'),
            //         TestPlanItemId: ctrl.item.Id,
            //     }),
            //     $ApiService.createExerciseTimeline({
            //         Title: "Submit Request for Change (RFC)",
            //         Owners: "Application Teams",
            //         Description: "Submit RFC for the Failover Exercise",
            //         DueDate: "TBD",
            //         TestPlanItemId: ctrl.item.Id,
            //     }),
            // ];
            // Promise.all(req).then(function (res) {
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
            // });

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
                                + window["APP_PAGE_LOCATION_URL"] + "#/dashboard'>Failover Exercise Portal<i style='color:red'>*</i></a> as soon as possible.</p>" +
                                "<p>Please feel free to contact the EDR Team at <a href='mailto:Disasterrecoverytestteam@cvshealth.com'>Disasterrecoverytestteam@cvshealth.com</a> if you have any questions.</p>" +
                                "<p><span style=' font-size: 12px;color: red;'>* Supported Browsers:  Google Chrome and Edge</span></p>" +
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
                    req.push($ApiService.sendEmail({
                        ToId: { 'results': [ctrl.item.Application.ApprovingManagerId, ctrl.item.Application.ApprovingDirectorId] },
                        CCId: { 'results': ctrl.item.Application.TestPlanOwnerId.results },
                        Subject: ctrl.item.Application.Title + " Failover Test Plan Requires Approval",
                        Body: "Hello, <p>You are receiving this email because the " + ctrl.item.Application.Title + " Failover Test Plan requires Manager/Tech Owner and Director/Sub Portfolio Owner " +
                            "approval for the Failover Exercise scheduled on " + new Date(ctrl.item.DueDate).toLocaleDateString() + ". Please go to the " +
                            "<a href='" + window["APP_PAGE_LOCATION_URL"] + "#/dashboard'>Failover Exercise Portal<i style='color:red'>*</i></a>, review the Test Plan and provide your approval as soon as possible.</p>" +
                            "<p>Please feel free to contact the EDR Team at <a href='mailto:Disasterrecoverytestteam@cvshealth.com'>Disasterrecoverytestteam@cvshealth.com</a> if you have any questions.</p>" +
                            "<p><span style=' font-size: 12px;color: red;'>* Supported Browsers:  Google Chrome and Edge</span></p>" +
                            "Thank you,<br>EDR Team",
                        ApplicationId: ctrl.item.Application.Id,
                    }));
                    req.push($ApiService.sendEmail({
                        ToId: { 'results': [ctrl.item.Application.ApprovingManagerId] },
                        CCId: { 'results': ctrl.item.Application.TestPlanOwnerId.results },
                        // CCEmails: "disasterrecoverytestteam@cvshealth.com",
                        Subject: ctrl.item.Application.Title + " Failover Test Plan Approval Past Due",
                        Body: "Hello, <p>You are receiving this email because you have not approved the " + ctrl.item.Application.Title +
                            " Failover Test Plan for the Failover Exercise scheduled on " + new Date(ctrl.item.DueDate).toLocaleDateString() + ". Please go to the " +
                            "<a href='" + window["APP_PAGE_LOCATION_URL"] + "#/dashboard'>Failover Exercise Portal<i style='color:red'>*</i></a>, review the Test Plan and provide your approval as soon as possible.</p>" +
                            "<p>Please feel free to contact the EDR Team at <a href='mailto:Disasterrecoverytestteam@cvshealth.com'>Disasterrecoverytestteam@cvshealth.com</a> if you have any questions.</p>" +
                            "<p><span style=' font-size: 12px;color: red;'>* Supported Browsers:  Google Chrome and Edge</span></p>" +
                            "Thank you,<br>EDR Team",
                        DelayDate: new Date(new Date(ctrl.item.DueDate).setDate(new Date(ctrl.item.DueDate).getDate() - 7)),
                        // DelayDate: new Date(new Date().getTime() + 10 * 60000).toISOString(),
                        ApplicationId: ctrl.item.Application.Id,
                    }));
                    req.push($ApiService.sendEmail({
                        ToId: { 'results': [ctrl.item.Application.ApprovingDirectorId] },
                        CCId: { 'results': ctrl.item.Application.TestPlanOwnerId.results },
                        // CCEmails: "disasterrecoverytestteam@cvshealth.com",
                        Subject: ctrl.item.Application.Title + " Failover Test Plan Approval Past Due",
                        Body: "Hello, <p>You are receiving this email because you have not approved the " + ctrl.item.Application.Title +
                            " Failover Test Plan for the Failover Exercise scheduled on " + new Date(ctrl.item.DueDate).toLocaleDateString() + ". Please go to the " +
                            "<a href='" + window["APP_PAGE_LOCATION_URL"] + "#/dashboard'>Failover Exercise Portal<i style='color:red'>*</i></a>, review the Test Plan and provide your approval as soon as possible.</p>" +
                            "<p>Please feel free to contact the EDR Team at <a href='mailto:Disasterrecoverytestteam@cvshealth.com'>Disasterrecoverytestteam@cvshealth.com</a> if you have any questions.</p>" +
                            "<p><span style=' font-size: 12px;color: red;'>* Supported Browsers:  Google Chrome and Edge</span></p>" +
                            "Thank you,<br>EDR Team",
                        DelayDate: new Date(new Date(ctrl.item.DueDate).setDate(new Date(ctrl.item.DueDate).getDate() - 7)),
                        // DelayDate: new Date(new Date().getTime() + 10 * 60000).toISOString(),
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
                            req.push($ApiService.createExerciseTimeline({
                                Title: "Application Failover Results and Timeline - DRAFT",
                                SortOrder: 6,
                                Owners: "Application Teams",
                                Description: "<p>Upload the first draft of the Failover Exercise Results via the " +
                                    "<a href='" + window["APP_PAGE_LOCATION_URL"] + "'>Failover Portal</a>.</p>" +
                                    "<p>EDR Team will review and reject/provide feedback or Approve via the Portal</p>",
                                DueDate: new Date(ctrl.item.DueDate).toLocaleDateString('en-us') + " - " +
                                    new Date(new Date(ctrl.item.DueDate).setDate(new Date(ctrl.item.DueDate).getDate() + 7)).toLocaleDateString('en-us'),
                                TestPlanItemId: ctrl.item.Id,
                            }));
                            req.push($ApiService.createExerciseTimeline({
                                Title: "Application Failover Results and Timeline – FINAL Approval Process",
                                SortOrder: 7,
                                Owners: "Application Managers/Tech Owners and Directors/Sub Portfolio Owners",
                                Description: "<p>Upon EDR Approval of the Failover Exercise Results, Approve the Final Application Failover Exercise Results via the " +
                                    "<a href='" + window["APP_PAGE_LOCATION_URL"] + "'>Failover Portal</a>.</p>",
                                DueDate: new Date(ctrl.item.DueDate).toLocaleDateString('en-us') + " - " +
                                    new Date(new Date(ctrl.item.DueDate).setDate(new Date(ctrl.item.DueDate).getDate() + 14)).toLocaleDateString('en-us'),
                                TestPlanItemId: ctrl.item.Id,
                            }));
                            req.push($ApiService.createExerciseTimeline({
                                Title: "DR Plan Review in BCITC",
                                SortOrder: 8,
                                Owners: "Application Teams Infrastructure Teams",
                                Description: "<p>Review DR Plans in BC in the Cloud to ensure it is still current; if nothing has changed, no action is required in BCITC.</p>",
                                DueDate: new Date(ctrl.item.DueDate).toLocaleDateString('en-us') + " - " +
                                    new Date(new Date(ctrl.item.DueDate).setDate(new Date(ctrl.item.DueDate).getDate() + 14)).toLocaleDateString('en-us'),
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
                                    "<a href='" + window["APP_PAGE_LOCATION_URL"] + "#/dashboard'>Failover Exercise Portal<i style='color:red'>*</i></a> within the next week.</p>" +
                                    "<p>Please feel free to contact the EDR Team at <a href='mailto:Disasterrecoverytestteam@cvshealth.com'>Disasterrecoverytestteam@cvshealth.com</a> if you have any questions.</p>" +
                                    "<p><span style=' font-size: 12px;color: red;'>* Supported Browsers:  Google Chrome and Edge</span></p>" +
                                    "Thank you,<br>EDR Team",
                                DelayDate: new Date(new Date(ctrl.item.DueDate).setDate(new Date(ctrl.item.DueDate).getDate() + 1)),
                                // DelayDate: new Date(new Date().getTime() + 10 * 60000).toISOString(),
                                ApplicationId: ctrl.item.Application.Id,
                            }));
                            req.push($ApiService.sendEmail({
                                ToId: { 'results': ctrl.item.Application.TestPlanOwnerId.results },
                                CCId: { 'results': [ctrl.item.Application.ApprovingManagerId] },
                                Subject: "Reminder: " + ctrl.item.Application.Title + " Failover Exercise Requirement Due/Not Completed",
                                Body: "Hello, <p>You are receiving this email because you have an outstanding deliverable for the " + ctrl.item.Application.Title +
                                    " Failover Exercise that was completed on " + new Date(ctrl.item.DueDate).toLocaleDateString() + ". Please go to the " +
                                    "<a href='" + ctrl.dashboardLink + "'>Failover Portal<i style='color:red'>*</i></a> and complete the Failover Exercise requirements as soon as possible.</p>" +
                                    "<p>Please feel free to contact the EDR Team at <a href='mailto:Disasterrecoverytestteam@cvshealth.com'>Disasterrecoverytestteam@cvshealth.com</a> if you have any questions.</p>" +
                                    "<p><span style=' font-size: 12px;color: red;'>* Supported Browsers:  Google Chrome and Edge</span></p>" +
                                    "Thank you,<br>EDR Team",
                                DelayDate: new Date(new Date(ctrl.item.DueDate).setDate(new Date(ctrl.item.DueDate).getDate() + 5)),
                                // DelayDate: new Date(new Date().getTime() + 10 * 60000).toISOString(),
                                ApplicationId: ctrl.item.Application.Id,
                            }));
                            // req.push($ApiService.sendEmail({
                            //     ToId: { 'results': ctrl.item.Application.TestPlanOwnerId.results },
                            //     CCId: { 'results': [ctrl.item.Application.ApprovingManagerId] },
                            //     Subject: "Reminder: " + ctrl.item.Application.Title + " Failover Exercise Requirement Due/Not Completed",
                            //     Body: "Hello, <p>You are receiving this email because you have an outstanding deliverable for the " + ctrl.item.Application.Title +
                            //         " Failover Exercise that was completed on " + new Date(ctrl.item.DueDate).toLocaleDateString() + ". Please go to the " +
                            //         "<a href='" + ctrl.dashboardLink + "'>Failover Portal</a> and complete the Failover Exercise requirements as soon as possible.</p>" +
                            //         "<p>Please feel free to contact the EDR Team at <a href='mailto:Disasterrecoverytestteam@cvshealth.com'>Disasterrecoverytestteam@cvshealth.com</a> if you have any questions.</p>" +
                            //         "Thank you,<br>EDR Team",
                            //     DelayDate: new Date(new Date(ctrl.item.DueDate).setDate(new Date(ctrl.item.DueDate).getDate() + 11)),
                            //     // DelayDate: new Date(new Date(ctrl.item.DueDate).getTime() + 9 * 60000).toISOString(),
                            //     ApplicationId: ctrl.item.Application.Id,
                            //     RepeatDay: "3"
                            // }));

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
                ctrl.exerciseTimelineItems.push(item);
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

        ctrl.checkShowReUploadMsg = function () {
            let flag = false;
            ctrl.approvalStatusItems.forEach(function (item) {
                if (ctrl.item[item.FieldName] === "Rejected") {
                    flag = true;
                }
            });
            if (ctrl.item.Stage !== 1) {
                flag = false;
            }
            return flag;
        }

        ctrl.showCancelBtn = function () {
            let isMember = false;
            window.currentSPUser.Groups.forEach(function (group) {
                if (group.Title === "EDR Team") {
                    isMember = true;
                }
            });
            return isMember;
        }

        ctrl.textToHtml = function (text) {
            if (!text) return "";
            return text.replace(/\n/g, '<br/>');
        }
        function setExercisesDueDate() {
            if (ctrl.exerciseTimelineItems[0]) {
                ctrl.exerciseTimelineItems[0].DueDate = new Date(ctrl.item.Application.TestDate).toLocaleDateString('en-us') + " - "
                    + new Date(new Date(ctrl.item.Application.TestDate).setDate(new Date(ctrl.item.Application.TestDate).getDate() + 7)).toLocaleDateString('en-us');
            }
            if (ctrl.exerciseTimelineItems[1]) {
                ctrl.exerciseTimelineItems[1].DueDate = new Date(ctrl.item.Application.TestDate).toLocaleDateString('en-us') + " - "
                + new Date(new Date(ctrl.item.Application.TestDate).setDate(new Date(ctrl.item.Application.TestDate).getDate() + 14)).toLocaleDateString('en-us');
            }
            if (ctrl.exerciseTimelineItems[2]) {
                ctrl.exerciseTimelineItems[2].DueDate = new Date(ctrl.item.Created).toLocaleDateString('en-us') + " - " + new Date(new Date(ctrl.item.DueDate).setDate(new Date(ctrl.item.DueDate).getDate() - 14)).toLocaleDateString('en-us');
            }
            if (ctrl.exerciseTimelineItems[3]) {
                ctrl.exerciseTimelineItems[3].DueDate = "Follow normal guidelines/lead time for RFC submissions";
            }
            if (ctrl.exerciseTimelineItems[4]) {
                ctrl.exerciseTimelineItems[4].DueDate = new Date(new Date(ctrl.item.DueDate).setDate(new Date(ctrl.item.DueDate).getDate() - 7)).toLocaleDateString('en-us') + " - " +
                new Date(ctrl.item.DueDate).toLocaleDateString('en-us');
            }
            if (ctrl.exerciseTimelineItems[5]) {
                ctrl.exerciseTimelineItems[5].DueDate = new Date(ctrl.item.DueDate).toLocaleDateString('en-us') + " - " +
                new Date(new Date(ctrl.item.DueDate).setDate(new Date(ctrl.item.DueDate).getDate() + 7)).toLocaleDateString('en-us');
            }
            if (ctrl.exerciseTimelineItems[6]) {
                ctrl.exerciseTimelineItems[6].DueDate = new Date(ctrl.item.DueDate).toLocaleDateString('en-us') + " - " +
                new Date(new Date(ctrl.item.DueDate).setDate(new Date(ctrl.item.DueDate).getDate() + 14)).toLocaleDateString('en-us');
            }
            if (ctrl.exerciseTimelineItems[7]) {
                ctrl.exerciseTimelineItems[7].DueDate = new Date(ctrl.item.DueDate).toLocaleDateString('en-us') + " - " +
                new Date(new Date(ctrl.item.DueDate).setDate(new Date(ctrl.item.DueDate).getDate() + 14)).toLocaleDateString('en-us');
            }
        }
    }
})();