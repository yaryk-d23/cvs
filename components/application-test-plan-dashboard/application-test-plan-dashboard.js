(function () {
    angular.module("App").component("applicationTestPlanDashboard", {
        templateUrl:
            window["APP_FOLDER"] +
            "components/application-test-plan-dashboard/application-test-plan-dashboard.view.html?rnd" +
            Math.random(),
        bindings: {
            //user: '<'
        },
        controllerAs: "ctrl",
        controller: ["$scope", "$ApiService", "$Preload", "$q", "$location", "$filter", "$uibModal", "CONSTANT", ctrl],
    });

    function ctrl($scope, $ApiService, $Preload, $q, $location, $filter, $uibModal, CONSTANT) {
        $Preload.show();
        var ctrl = this;

        ctrl.items = [];
        ctrl.allDRApplicationItems = [];
        ctrl.parentDRApplicationItems = [];
        ctrl.filteredItems = [];
        ctrl.pageNumber = 1;
        ctrl.itemsPerPage = 5;
        ctrl.filterStartDate = getCurrentMonthFirstDate();
        ctrl.filterEndDate = getCurrentMonthLastDate();
        ctrl.sortColumn = "Application";
        ctrl.sortAscending = true;
        ctrl.filterValue = "";

        ctrl.onChangeFilter = function() {
            ctrl.filterData();
        }

        ctrl.sortData = function (fieldName) {
            ctrl.sortAscending = ctrl.sortColumn === fieldName ? !ctrl.sortAscending : true;
            ctrl.sortColumn = fieldName;
            let data = angular.copy(ctrl.filteredItems);
            data.sort(function (a, b) {
                let val = 0, val1, val2;
                switch (fieldName) {
                    case "DueDate":
                        val1 = a.TestPlan ? new Date(a.TestPlan[fieldName]).getTime() : 0;
                        val2 = b.TestPlan ? new Date(b.TestPlan[fieldName]).getTime() : 0;
                        break;
                    case "TestPlanOwner":
                        val1 = a[fieldName].results.map(function (i) { return i.Title; }).join("; ");
                        val2 = b[fieldName].results.map(function (i) { return i.Title; }).join("; ");
                        break;
                    case "Application":
                        val1 = a.Title;
                        val2 = b.Title;
                        break;
                    default:
                        val1 = a[fieldName] || typeof a[fieldName] === "number" ? a[fieldName] : "";
                        val2 = b[fieldName] || typeof b[fieldName] === "number" ? b[fieldName] : "";
                        break;
                }
                if (val1 < val2) {
                    val = ctrl.sortAscending ? -1 : 1;
                }
                if (val1 > val2) {
                    val = ctrl.sortAscending ? 1 : -1;
                }
                return val;
            });

            setTimeout(function () {
                $scope.$apply(function () {
                    ctrl.filteredItems = data;
                });
            }, 0);

        };

        var getData = async () => {
            let items = await $ApiService.getApplicationTestPlanItems();
            ctrl.allDRApplicationItems = await $ApiService.getDRApplicationItems();
            ctrl.parentDRApplicationItems = ctrl.allDRApplicationItems.filter(
                function (x) {
                    return !x.ParentId;
                }
            );
            ctrl.parentDRApplicationItems = ctrl.parentDRApplicationItems.map(
                function (i) {
                    i.ChildrenItems = ctrl.allDRApplicationItems.filter(function (x) {
                        return x.ParentId === i.Id;
                    });
                    return i;
                }
            );
            let flag = false;
            angular.forEach(window.currentSPUser.Groups, function (group) {
                if (group.Title == "EDR Team") {
                    flag = true;
                }
            });
            let applicationIds = [];
            let applicationTestPlanIds = [];
            items.forEach((item) => {
                if (applicationTestPlanIds.indexOf(item.Id) === -1) {
                    applicationTestPlanIds.push(item.Id);
                }
                if (applicationIds.indexOf(item.ApplicationId) === -1) {
                    applicationIds.push(item.ApplicationId);
                }
            });
            let attachmentsReq = {};
            applicationTestPlanIds.forEach((i) => {
                attachmentsReq[i] = $ApiService.getFormAttachments(i);
            });
            let response = await $q.all({
                attachments: $q.all(attachmentsReq),
            });
            for (let j = 0; j < ctrl.parentDRApplicationItems.length; j++) {
                let item = angular.copy(ctrl.parentDRApplicationItems[j]);
                item.TestPlan = items.filter(
                    (x) => x.ApplicationId === item.Id
                )[0];
                if (item.TestPlan) {
                    let attachments = response.attachments[item.TestPlan.Id];
                    //  await $ApiService.getFormAttachments(item.Id);
                    
                    item.TestPlan.TestPlanAttachment = attachments.filter(function (x) {
                        return x.AttachmentType === "Test Plan";
                    }).map(function (file) { return file.File; });;
                    item.TestPlan.TestResultsAttachment = attachments.filter(function (x) {
                        return x.AttachmentType === "Tests Results";
                    }).map(function (file) { return file.File; });
                }
                ctrl.parentDRApplicationItems[j] = item;
            }

            if (!flag) {
                ctrl.parentDRApplicationItems = ctrl.parentDRApplicationItems.filter(function (item) {
                    return (
                        item.TestPlanOwnerId.results.indexOf(
                            window.currentSPUser.Id
                        ) !== -1 ||
                        item.ApprovingManagerId === window.currentSPUser.Id ||
                        item.ApprovingDirectorId === window.currentSPUser.Id
                    );
                });
            }
            ctrl.parentDRApplicationItems = ctrl.parentDRApplicationItems.filter(function (x) {
                return x.Status !== "Out of Scope";
            });
            items = items.sort(function (a, b) {
                let val = 0,
                val1 = a.Title,
                val2 = b.Title;
                if (val1 < val2) {
                    val = ctrl.sortAscending ? -1 : 1;
                }
                if (val1 > val2) {
                    val = ctrl.sortAscending ? 1 : -1;
                }
                return val;
            });
            setTimeout(function () {
                $scope.$apply(function () {
                    ctrl.items = items;
                    ctrl.filterData();
                });
            }, 0);
        };
        getData();

        ctrl.getDraftTestPlanReceivedIndicator = function (item) {
            if(!item.TestPlan || !item.TestPlan.DueDate) return "";
            let currDate = new Date().getTime();
            let dueDate = new Date(
                new Date(item.TestPlan.DueDate).setDate(new Date(item.TestPlan.DueDate).getDate() - 14)
            ).getTime();
            if ((!item.TestPlan.TestPlanAttachment || !item.TestPlan.TestPlanAttachment.length) && currDate < dueDate) {
                return '<span class="statusIndicator inProgressStatus" ></span>';
            } else if ((!item.TestPlan.TestPlanAttachment || !item.TestPlan.TestPlanAttachment.length) && currDate > dueDate) {
                return '<span class="statusIndicator notStartedStatus" ></span>';
            } else if (item.TestPlan.TestPlanAttachment && item.TestPlan.TestPlanAttachment) {
                return '<span class="statusIndicator approvedStatus" ></span>';
            } else {
                return "";
            }
        };
        ctrl.getDraftTestPlanManagerApprovalIndicator = function (item) {
            if(!item.TestPlan || !item.TestPlan.DueDate) return "";
            let currDate = new Date().getTime();
            let dueDate = new Date(
                new Date(item.TestPlan.DueDate).setDate(new Date(item.TestPlan.DueDate).getDate() - 14)
            ).getTime();
            let dueDateM7 = new Date(
                new Date(item.TestPlan.DueDate).setDate(new Date(item.TestPlan.DueDate).getDate() - 7)
            ).getTime();
            if (
                item.TestPlan.Stage === 2 &&
                item.TestPlan.TestEDRReview === "Approved" &&
                (!item.TestPlan.TestITManager || !item.TestPlan.TestITDirector) &&
                currDate < dueDate
            ) {
                return '<span class="statusIndicator inProgressStatus" ></span>';
            } else if (item.TestPlan.TestEDRReview === "Rejected") {
                return '<span class="statusIndicator inProgressStatus" ></span>';
            } else if (item.TestPlan.TestEDRReview === "Rejected" && currDate > dueDate) {
                return '<span class="statusIndicator notStartedStatus" ></span>';
            } else if (
                item.TestPlan.TestEDRReview === "Approved" &&
                (!item.TestPlan.TestITManager || !item.TestPlan.TestITDirector) &&
                currDate < dueDateM7
            ) {
                return '<span class="statusIndicator inProgressStatus" ></span>';
            } else if (
                item.TestPlan.TestEDRReview === "Approved" &&
                (!item.TestPlan.TestITManager || !item.TestPlan.TestITDirector) &&
                currDate > dueDateM7
            ) {
                return '<span class="statusIndicator notStartedStatus" ></span>';
            } else if (
                item.TestPlan.TestEDRReview === "Approved" &&
                item.TestPlan.TestITManager === "Approved" &&
                item.TestPlan.TestITDirector === "Approved"
            ) {
                return '<span class="statusIndicator approvedStatus" ></span>';
            } else {
                return "";
            }
        };
        ctrl.getTestsResultsReceivedIndicator = function (item) {
            if(!item.TestPlan || !item.TestPlan.DueDate) return "";
            let currDate = new Date().getTime();
            let dueDate = new Date(
                new Date(item.TestPlan.DueDate).setDate(new Date(item.TestPlan.DueDate).getDate() + 8)
            ).getTime();
            if (
                item.TestPlan.Stage === 3 &&
                (!item.TestPlan.TestResultsAttachment || !item.TestPlan.TestResultsAttachment.length) &&
                currDate < dueDate
            ) {
                return '<span class="statusIndicator inProgressStatus" ></span>';
            } else if (
                item.TestPlan.Stage === 3 &&
                (!item.TestPlan.TestResultsAttachment || !item.TestPlan.TestResultsAttachment.length) &&
                currDate > dueDate
            ) {
                return '<span class="statusIndicator notStartedStatus" ></span>';
            } else if (item.TestPlan.TestResultsAttachment && item.TestPlan.TestResultsAttachment.length) {
                return '<span class="statusIndicator approvedStatus" ></span>';
            } else {
                return "";
            }
        };
        ctrl.getTestsResultsApprovedIndicator = function (item) {
            if(!item.TestPlan || !item.TestPlan.DueDate) return "";
            let currDate = new Date().getTime();
            let dueDate = new Date(
                new Date(item.TestPlan.DueDate).setDate(new Date(item.TestPlan.DueDate).getDate() + 3)
            ).getTime();
            let dueDateM8 = new Date(
                new Date(item.TestPlan.DueDate).setDate(new Date(item.TestPlan.DueDate).getDate() + 8)
            ).getTime();
            let dueDateM7 = new Date(
                new Date(item.TestPlan.DueDate).setDate(new Date(item.TestPlan.DueDate).getDate() + 7)
            ).getTime();
            if (item.TestPlan.PostTestEDRReview === "Rejected" && currDate < dueDateM8) {
                return '<span class="statusIndicator inProgressStatus" ></span>';
            } else if (
                item.TestPlan.Stage === 4 &&
                !item.TestPlan.PostTestEDRReview &&
                currDate < dueDate
            ) {
                return '<span class="statusIndicator inProgressStatus" ></span>';
            } else if (
                item.TestPlan.Stage === 4 &&
                !item.TestPlan.PostTestEDRReview &&
                currDate > dueDate
            ) {
                return '<span class="statusIndicator notStartedStatus" ></span>';
            } else if (
                item.TestPlan.PostTestEDRReview === "Approved" &&
                (!item.TestPlan.PostTestITManager || !item.TestPlan.PostTestITDirector) &&
                currDate < dueDateM7
            ) {
                return '<span class="statusIndicator inProgressStatus" ></span>';
            } else if (
                item.TestPlan.PostTestEDRReview === "Approved" &&
                (!item.TestPlan.PostTestITManager || !item.TestPlan.PostTestITDirector) &&
                currDate > dueDateM7
            ) {
                return '<span class="statusIndicator notStartedStatus" ></span>';
            } else if (
                item.TestPlan.PostTestEDRReview === "Approved" &&
                item.TestPlan.PostTestITManager === "Approved" &&
                item.TestPlan.PostTestITDirector === "Approved"
            ) {
                return '<span class="statusIndicator approvedStatus" ></span>';
            } else {
                return "";
            }
        };

        ctrl.getStatusIndicator = (status) => {
            switch (status) {
                case "In progress":
                    return '<span class="statusIndicator inProgressStatus" ></span>';
                case "Completed":
                    return '<span class="statusIndicator approvedStatus" ></span>';
                case "Overdue":
                    return '<span class="statusIndicator notStartedStatus" ></span>';
                default:
                    return null;
            }
        };

        function getCurrentMonthFirstDate() {
            let date = new Date(),
                y = date.getFullYear(),
                m = 0;
            return new Date(y, m, 1);
        }

        function getCurrentMonthLastDate() {
            let date = new Date(),
                y = date.getFullYear(),
                m = 11;
            return new Date(y, m + 1, 0);
        }

        function setChildrenColumnWidth() {
            let childrenRows = $(".app-container .table .children-table tr");
            let childrenColumns;
            childrenRows.each(function (row) {
                childrenColumns = $(childrenRows[row]).find("td");
                childrenColumns.each(function (col) {
                    let width = $(".table th:eq(" + col + ")").outerWidth();
                    $(childrenColumns[col]).css({ width: width, "max-width": width });
                });
            });
        }

        ctrl.filterData = () => {
            $Preload.show();
            let items = this.filterItemsByDateRange(ctrl.parentDRApplicationItems);
            items = this.getItemRange(items);

            items = items.filter(function(x){
                return x.Title.toLowerCase().indexOf(ctrl.filterValue) != -1 || 
                    x.TestPlanOwner.results.map(function (i) { return i.Title; }).join("; ").toLowerCase().indexOf(ctrl.filterValue) != -1 ||
                    (x.TestPlan && x.TestPlan.DueDate && $filter('date')(new Date(x.TestPlan.DueDate), 'MM/dd/yyyy').indexOf(ctrl.filterValue) != -1);
            });
            if(!ctrl.showArchivedItems) {
                items = items.filter(function(x) {
                    return x.ApplicationStatus !== 'Archive';
                });
            }
            ctrl.filteredItems = items.map(function (item) {
                item.isCollapsed = true;
                return item;
            });
            // ctrl.sortData(defaultSortColumn);

            setTimeout(function () {
                setChildrenColumnWidth();
            }, 500);
            $Preload.hide();
        };

        ctrl.filterItemsByDateRange = (items) => {
            return items.filter((x) => {
                return (!x.TestPlan || x.TestPlan.DueDate ||
                    (new Date(x.TestPlan.DueDate).getTime() >= ctrl.filterStartDate.getTime() &&
                    new Date(x.TestPlan.DueDate).getTime() <= ctrl.filterEndDate.getTime())
                );
            });
        };

        ctrl.onDateRangeChange = (startDate, endDate) => {
            ctrl.filterStartDate = startDate;
            ctrl.filterEndDate = endDate;
            ctrl.filterData();
        };

        ctrl.getItemRange = (items) => {
            let pageNumber = ctrl.pageNumber;
            --pageNumber;
            let start = pageNumber * ctrl.itemsPerPage;
            let end = (pageNumber + 1) * ctrl.itemsPerPage;
            let newRange = items.slice(start, end);
            return newRange;
        };

        ctrl.handlePageClick = (page) => {
            ctrl.pageNumber = page.selected;
        };

        ctrl.markApproved = function () {
            $Preload.show();
            let selectedApp = ctrl.filteredItems.filter(function (x) {
                return x.selected;
            });
            let req = [];
            selectedApp.forEach(function (item) {
                req.push($ApiService.deleteEmailItems(item.Id));
            });
            Promise.all(req).then(function () {
                req = [];
                selectedApp.forEach(function (item) {
                    req.push($ApiService.updateApplication({
                        Id: item.Id,
                        Status: "Completed"
                    }));
                    if(item.ChildrenItems && item.ChildrenItems.length){
                        item.ChildrenItems.forEach(function(i) {
                            req.push($ApiService.updateApplication({
                                Id: i.Id,
                                Status: "Completed"
                            }));
                        });
                    }
                });
                Promise.all(req).then(function (_) {
                    Promise.all([
                        $ApiService.getEmailTemplate(CONSTANT.MARK_APPROVED_REMINDER),
                        $ApiService.getEmailTemplate(CONSTANT.DELAY_MARK_APPROVED_REMINDER)
                        ]).then(function (template) {
                            req = [];
                            selectedApp.forEach(function (item) {
                                req.push($ApiService.sendEmail({
                                    ToId: { 'results': item.TestPlanOwnerId.results },
                                    CCId: { 'results': [item.ApprovingManagerId] },
                                    Subject: $ApiService.getHTMLTemplate(template[0].Subject, { Title: item.Title }),
                                    Body: $ApiService.getHTMLTemplate(template[0].Body, { Title: item.Title, dashboardLink: ctrl.dashboardLink }),
                                    // "Hello, <p>You are receiving this email because you have an outstanding deliverable for your upcoming " + item.Title + " Failover Exercise. " +
                                    //     "Please go to the <a href='" + ctrl.dashboardLink + "'>Failover Portal<i style='color:red'>*</i></a> and complete the Failover Exercise requirements as soon as possible.</p>" +
                                    //     "<p>Please feel free to contact the EDR Team at <a href='mailto:Disasterrecoverytestteam@cvshealth.com'>Disasterrecoverytestteam@cvshealth.com</a> if you have any questions.</p>" +
                                    //     "<p><span style=' font-size: 12px;color: red;'>* Supported Browsers:  Google Chrome and Edge</span></p>" +
                                    //     "Thank you,<br>EDR Team",
                                    // DelayDate: new Date(new Date(item.TestDate).setDate(new Date(item.TestDate).getDate() + 9)),
                                    DelayDate: new Date(new Date().getTime() + 5 * 60000).toISOString(),
                                    ApplicationId: item.Id,
                                }));
                                req.push($ApiService.sendEmail({
                                    ToId: { 'results': item.TestPlanOwnerId.results },
                                    CCId: { 'results': [item.ApprovingManagerId] },
                                    Subject: $ApiService.getHTMLTemplate(template[1].Subject, { Title: item.Title }),
                                    Body: $ApiService.getHTMLTemplate(template[1].Body, { Title: item.Title, dashboardLink: ctrl.dashboardLink }), 
                                        // "Hello, <p>You are receiving this email because you have an outstanding deliverable for your upcoming " + item.Title + " Failover Exercise. " +
                                        // "Please go to the <a href='" + ctrl.dashboardLink + "'>Failover Portal<i style='color:red'>*</i></a> and complete the Failover Exercise requirements as soon as possible.</p>" +
                                        // "<p>Please feel free to contact the EDR Team at <a href='mailto:Disasterrecoverytestteam@cvshealth.com'>Disasterrecoverytestteam@cvshealth.com</a> if you have any questions.</p>" +
                                        // "<p><span style=' font-size: 12px;color: red;'>* Supported Browsers:  Google Chrome and Edge</span></p>" +
                                        // "Thank you,<br>EDR Team",
                                    // DelayDate: new Date(new Date(item.TestDate).setDate(new Date(item.TestDate).getDate() + 13)),
                                    DelayDate: new Date(new Date().getTime() + 5 * 60000).toISOString(),
                                    ApplicationId: item.Id,
                                }));
                            });
                            Promise.all(req).then(function (_) {
                                setTimeout(function () {
                                    $scope.$apply(function () {
                                        $Preload.hide();
                                        getData();
                                    });
                                }, 0);
                            });
                        });
                });
            });
        }

        ctrl.checkSelectedItemsLength = function () {
            return ctrl.filteredItems.filter(function (x) {
                return x.selected;
            }).length;
        }

        ctrl.selectItem = function (event, item) {
            event.preventDefault();
            event.stopImmediatePropagation();
            setTimeout(function () {
                $scope.$apply(function () {
                    ctrl.filteredItems = ctrl.filteredItems.map(function(i) {
                        if(i.Id === item.Id) {
                            i.selected = !i.selected;
                        }
                        return i;
                    });
                });
            }, 0);
        }

        ctrl.setIncorrectData = function (event, item) {
            event.preventDefault();
            event.stopImmediatePropagation();
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: window["APP_FOLDER"] + 'common/comments-modal/comments-modal.view.html?rnd' + Math.random(),
                controller: 'commentsModalCtrl',
                controllerAs: 'ctrl',
                resolve: {}
            });

            modalInstance.result.then(function (comment) {
                $Preload.show();
                $ApiService.deleteEmailItems(item.Id).then(function () {
                    $ApiService.getEmailTemplate(CONSTANT.INCORRECT_APP).then(function (template) {
                        $ApiService.sendEmail({
                            ToEmails: "disasterrecoverytestteam@cvshealth.com",
                            ToEmails: "oleksii.pashkevych@cvshealth.com",
                            Subject: $ApiService.getHTMLTemplate(template.Subject, {}),
                            Body: $ApiService.getHTMLTemplate(template.Body, { Title: item.Title, comment: comment.replace(/\n/g, '<br>'), currentSPUser: window.currentSPUser })
                            // "<p>Hello EDR Team,</p>" +
                            //     "<p>You are receiving this email because " + item.Title + " indicated in the Failover Exercise Portal that the Application Ownership is incorrect. " +
                            //     "<p>Comments: <br>" + comment.replace(/\n/g, '<br>') + "</p>" +
                            //     "Please follow up with " + window.currentSPUser.Title +
                            //     " and inform them the information has been corrected and they should access the Failover Exercise Portal to review and approve the updates.</p>" +
                            //     "<p>Thank you!</p>"
                            // item.TestPlanOwner.results.map(function (i) { return i.Title; }).join('; ')
                        }).then(function () {
                            setTimeout(function () {
                                $scope.$apply(function () {
                                    $Preload.hide();
                                });
                            }, 0);
                        });
                    });
                });
            }, function () {
            });
        }
    }
})();
