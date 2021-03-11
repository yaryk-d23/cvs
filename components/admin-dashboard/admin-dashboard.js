(function () {
    angular.module("App").component("adminDashboard", {
        templateUrl:
            window["APP_FOLDER"] +
            "components/admin-dashboard/admin-dashboard.view.html?rnd" +
            Math.random(),
        bindings: {
            //user: '<'
        },
        controllerAs: "ctrl",
        controller: ["$scope", "$ApiService", "$Preload", "$q", "$location", "$filter", ctrl],
    });

    function ctrl($scope, $ApiService, $Preload, $q, $location, $filter) {
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
        ctrl.columns = [{
            label: "Application",
            id: "Application",
        }, {
            label: "Test Plan Owner/POC",
            id: "TestPlanOwner",
        }, {
            label: "Test Date",
            id: "DueDate",
        }, {
            label: "Draft Plan Received",
            id: "DraftPlanReceived",
        }, {
            label: "Test Plan Approved",
            id: "TestPlanApproved",
        }, {
            label: "Draft Results Received",
            id: "DraftResultsReceived",
        }, {
            label: "Results Approved",
            id: "ResultsApproved",
        }, {
            label: "Ownership Accepted",
            id: "OwnershipAccepted",
        }, {
            label: "Test Date Submitted",
            id: "TestDateSubmitted",
        },];

        // set default selected columns
        let selectedColumns = getColumnsFromStorage();
        ctrl.selectedColumns = selectedColumns && selectedColumns.length ? selectedColumns : [{
            label: "Application",
            id: "Application",
        }, {
            label: "Test Plan Owner/POC",
            id: "TestPlanOwner",
        }, {
            label: "Test Date",
            id: "DueDate",
        }, {
            label: "Ownership Accepted",
            id: "OwnershipAccepted",
        }, {
            label: "Test Date Submitted",
            id: "TestDateSubmitted",
        },];
        ctrl.columnSelectorsettings = {
            scrollableHeight: '300px',
            scrollable: true,
            enableSearch: true
        };

        $scope.$watch('ctrl.selectedColumns', function () {
            saveColumnsToStorage(ctrl.selectedColumns);
            setTimeout(function () {
                setChildrenColumnWidth();
            }, 300);
        }, true);

        function saveColumnsToStorage(columns) {
            localStorage.setItem(
                "adminDashboardColumns",
                JSON.stringify(columns)
            );
        }

        function getColumnsFromStorage() {
            let columns = JSON.parse(localStorage.getItem("adminDashboardColumns"));
            return columns && columns.length ? columns : [];
        }

        ctrl.isSelected = function (colName) {
            return !!ctrl.selectedColumns.filter(function (col) { return col.id === colName }).length;
        }

        ctrl.onChangeFilter = function () {
            ctrl.filterData();
        }

        ctrl.exportToExcel = function () {
            let props = ctrl.selectedColumns.map(function (i) {
                return i.id;
            });
            let colNames = {};
            ctrl.selectedColumns.forEach(function (i) {
                colNames[i.id] = ctrl.columns.filter(function(x){return x.id === i.id;})[0].label;
            });
            let data = [];
            ctrl.filteredItems.forEach(function (item) {
                let colorIndicator = "";
                let exportItem = {};
                props.forEach(function (prop) {
                    switch (prop) {
                        case 'Application':
                            exportItem[prop] = item.Title;
                            break;
                        case 'TestPlanOwner':
                            exportItem[prop] = item.TestPlanOwner && item.TestPlanOwner.results ? item.TestPlanOwner.results.map(function (i) { return i.Title; }).join("; ") : "";
                            break;
                        case 'DueDate':
                            exportItem[prop] = item.TestPlan && item.TestPlan.DueDate ? dayjs(new Date(item.TestPlan.DueDate)).format('MM/DD/YYYY') : "";
                            break;
                        case 'OwnershipAccepted':
                            colorIndicator = ctrl.getOwnershipAcceptedIndicator(item);
                            exportItem[prop] = getStatusTextIndicator(colorIndicator);
                            break;
                        case 'TestDateSubmitted':
                            colorIndicator = ctrl.getTestdateSubmittedIndicator(item);
                            exportItem[prop] = getStatusTextIndicator(colorIndicator);
                            break;
                        case 'DraftPlanReceived':
                            colorIndicator = ctrl.getDraftTestPlanReceivedIndicator(item);
                            exportItem[prop] = getStatusTextIndicator(colorIndicator);
                            break;
                        case 'TestPlanApproved':
                            colorIndicator = ctrl.getDraftTestPlanManagerApprovalIndicator(item);
                            exportItem[prop] = getStatusTextIndicator(colorIndicator);
                            break;
                        case 'getTestsResultsReceivedIndicator':
                            colorIndicator = ctrl.getOwnershipAcceptedIndicator(item);
                            exportItem[prop] = getStatusTextIndicator(colorIndicator);
                            break;
                        case 'ResultsApproved':
                            colorIndicator = ctrl.getTestsResultsApprovedIndicator(item);
                            exportItem[prop] = getStatusTextIndicator(colorIndicator);
                            break;
                        default:
                            exportItem[prop] = item[prop] || "";
                            break;
                    }
                });
                data.push(exportItem);
            });
            let ws = XLSX2.utils.json_to_sheet([colNames], { skipHeader: true });
            XLSX2.utils.sheet_add_json(ws, data, { header: props, skipHeader: true, origin: 'A2' })


            Object.keys(ws).forEach(function (key) {
                if (key !== "!ref") {
                    // first line, header
                    if (!ws[key].s) ws[key].s = {};
                    if (key.replace(/[^0-9]/ig, '') === '1') {
                        ws[key].s = {
                            fill: {
                                fgColor: { rgb: 'FFC00000' }
                            },
                            font: {
                                name: 'Calibri',
                                sz: 12,
                                bold: true,
                                color: { rgb: 'FFFFFFFF' }
                            },
                        };
                    }
                    else {
                        ws[key].s.font = {
                            name: 'Calibri'
                        };
                    }
                    ws[key].s.border = {
                        bottom: {
                            style: 'thin',
                            color: 'FF000000'
                        },
                        left: {
                            style: 'thin',
                            color: 'FF000000'
                        },
                        right: {
                            style: 'thin',
                            color: 'FF000000'
                        }
                    };
                    if(ws[key].v === 'Completed' || ws[key].v === 'In Progress' || ws[key].v === 'Overdue') {
                        ws[key].s.fill = {
                            fgColor: { rgb: getColorForIndicator(ws[key].v) }
                        }
                        ws[key].s.font.color = { rgb: 'FFFFFFFF' }
                    }
                }
                // ws[key].s = {
                //     border: {
                //         bottom: {
                //             style: 'thin',
                //             color: 'FF000000'
                //         },
                //         left: {
                //             style: 'thin',
                //             color: 'FF000000'
                //         },
                //         right: {
                //             style: 'thin',
                //             color: 'FF000000'
                //         }
                //     }
                // };

            });
            if (!ws["!cols"]) ws["!cols"] = [];
            ctrl.selectedColumns.forEach(function (col) {
                if (col.id === "DueDate") {
                    ws["!cols"].push({
                        wpx: 100,
                        alignment: { wrapText: true }
                    });
                }
                else {
                    ws["!cols"].push({
                        wpx: 150,
                        alignment: { wrapText: true }
                    });
                }
            });

            let url = sheet2blob(ws);
            if (typeof url == 'object' && url instanceof Blob) {
                url = URL.createObjectURL(url);
            }
            var aLink = document.createElement('a');
            aLink.href = url;
            aLink.download = "DRApplication.xlsx";
            var event;
            if (window.MouseEvent) event = new MouseEvent('click');
            else {
                event = document.createEvent('MouseEvents');
                event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            }
            aLink.dispatchEvent(event);

            // /* add to workbook */
            // let wb = XLSX.utils.book_new();

            // let wbOut = XLSXStyle.write(wb, { bookType: "xlsx", bookSST: false, type: 'binary' });
            // XLSXStyle.writeFile(wb, "sheetjs.xlsx");
            // saveAs(new Blob([s2ab(wbOut)], { type: '' }), "sheetjs.xlsx");

            // XLSX.utils.book_append_sheet(wb, ws, "People");

            // /* generate an XLSX file */
            // XLSX.writeFile(wb, "sheetjs.xlsx");

        }

        function getStatusTextIndicator(colorIndicator) {
            if(colorIndicator && colorIndicator.indexOf('approvedStatus') !== -1) return 'Completed';
            if(colorIndicator && colorIndicator.indexOf('inProgressStatus') !== -1) return 'In Progress';
            if(colorIndicator && colorIndicator.indexOf('notStartedStatus') !== -1) return 'Overdue';
            else return '';
        }

        function getColorForIndicator(status) {
            switch(status) {
                case 'Completed': return 'FF2ECA79';
                case 'In Progress': return 'FFFF9D00';
                case 'Overdue': return 'FFDE0000';
            }
        }

        ctrl.sortData = function (fieldName) {
            ctrl.sortAscending = ctrl.sortColumn === fieldName ? !ctrl.sortAscending : true;
            ctrl.sortColumn = fieldName;
            let data = angular.copy(ctrl.filteredItems);
            data.sort(function (a, b) {
                let val = 0, val1, val2;
                switch (fieldName) {
                    case "DueDate":
                        val1 = a.TestPlan && a.TestPlan[fieldName] ? new Date(a.TestPlan[fieldName]).getTime() : "";
                        val2 = b.TestPlan && b.TestPlan[fieldName] ? new Date(b.TestPlan[fieldName]).getTime() : "";
                        break;
                    case "TestPlanOwner":
                        val1 = a[fieldName] && a[fieldName].results ? a[fieldName].results.map(function (i) { return i.Title; }).join("; ") : "";
                        val2 = b[fieldName] && b[fieldName].results ? b[fieldName].results.map(function (i) { return i.Title; }).join("; ") : "";
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
                    setTimeout(function () {
                        setChildrenColumnWidth();
                    }, 500);
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
                    let TestPlanAttachment = attachments.filter(function (x) {
                        return x.AttachmentType === "Test Plan";
                    })[0];
                    if (TestPlanAttachment) {
                        item.TestPlanAttachment = TestPlanAttachment.File;
                    }
                    let TestResultsAttachment = attachments.filter(function (x) {
                        return x.AttachmentType === "Tests Results";
                    })[0];
                    if (TestResultsAttachment) {
                        item.TestResultsAttachment = TestResultsAttachment.File;
                    }
                }
                ctrl.parentDRApplicationItems[j] = item;
            }

            ctrl.parentDRApplicationItems = ctrl.parentDRApplicationItems.sort(function (a, b) {
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

        ctrl.getOwnershipAcceptedIndicator = function (item) {
            if (item.Status === "In Progress") {
                return '<span class="statusIndicator inProgressStatus" ></span>';
            }
            else if (item.Status === "Completed") {
                return '<span class="statusIndicator approvedStatus" ></span>';
            }
            else return '<span class="statusIndicator notStartedStatus" ></span>';
        }

        ctrl.getTestdateSubmittedIndicator = function (item) {
            if (item.TestPlan && item.TestPlan.DueDate) {
                return '<span class="statusIndicator approvedStatus" ></span>';
            }
            else {
                return '<span class="statusIndicator notStartedStatus" ></span>';
            }
        }

        ctrl.getDraftTestPlanReceivedIndicator = function (item) {
            if (!item.TestPlan) return;
            let currDate = new Date().getTime();
            let dueDate = new Date(
                new Date(item.TestPlan.DueDate).setDate(new Date(item.TestPlan.DueDate).getDate() - 14)
            ).getTime();
            if (!item.TestPlan.TestPlanAttachment && currDate < dueDate) {
                return '<span class="statusIndicator inProgressStatus" ></span>';
            } else if (!item.TestPlan.TestPlanAttachment && currDate > dueDate) {
                return '<span class="statusIndicator notStartedStatus" ></span>';
            } else if (item.TestPlan.TestPlanAttachment) {
                return '<span class="statusIndicator approvedStatus" ></span>';
            } else {
                return "";
            }
        };
        ctrl.getDraftTestPlanManagerApprovalIndicator = function (item) {
            if (!item.TestPlan) return;
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
            if (!item.TestPlan) return;
            let currDate = new Date().getTime();
            let dueDate = new Date(
                new Date(item.TestPlan.DueDate).setDate(new Date(item.TestPlan.DueDate).getDate() + 8)
            ).getTime();
            if (
                item.TestPlan.Stage === 3 &&
                !item.TestPlan.TestResultsAttachment &&
                currDate < dueDate
            ) {
                return '<span class="statusIndicator inProgressStatus" ></span>';
            } else if (
                item.TestPlan.Stage === 3 &&
                !item.TestPlan.TestResultsAttachment &&
                currDate > dueDate
            ) {
                return '<span class="statusIndicator notStartedStatus" ></span>';
            } else if (item.TestPlan.TestResultsAttachment) {
                return '<span class="statusIndicator approvedStatus" ></span>';
            } else {
                return "";
            }
        };
        ctrl.getTestsResultsApprovedIndicator = function (item) {
            if (!item.TestPlan) return;
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
                case "Approved":
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

            items = items.filter(function (x) {
                return x.Title.toLowerCase().indexOf(ctrl.filterValue) != -1 ||
                    x.TestPlanOwner.results.map(function (i) { return i.Title; }).join("; ").toLowerCase().indexOf(ctrl.filterValue) != -1 ||
                    (x.TestPlan && x.TestPlan.DueDate && $filter('date')(new Date(x.TestPlan.DueDate), 'MM/dd/yyyy').indexOf(ctrl.filterValue) != -1);
            });

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
                return (
                    new Date(x.TestDate).getTime() >= ctrl.filterStartDate.getTime() &&
                    new Date(x.TestDate).getTime() <= ctrl.filterEndDate.getTime()
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
    }
})();
