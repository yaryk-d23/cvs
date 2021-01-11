(function () {
    angular.module('App')
        .component('importApplications', {
            templateUrl: window["APP_FOLDER"] + 'components/import-applications/import-applications.view.html?rnd' + Math.random(),
            bindings: {},
            controllerAs: 'ctrl',
            controller: ['$scope', '$ApiService', '$Preload', '$q', ctrl]
        });

    function ctrl($scope, $ApiService, $Preload, $q) {
        var ctrl = this;
        $Preload.hide();
        ctrl.importFile = null;
        ctrl.importData = [];
        var allApplications = [];
        var allApplicatinsTitle = [];
        ctrl.currYear = "2021";//new Date().getFullYear();
        ctrl.dashboardLink = window["APP_PAGE_LOCATION_URL"] + "#/owners-dashboard";
        ctrl.emailTemplateUrl = window["APP_FOLDER"] + "components/import-applications/email-template.html"

        $ApiService.getDRApplicationItems().then(function (res) {
            allApplications = res;
            allApplicatinsTitle = res.map(function (item) {
                return item.Title;
            });
        });

        ctrl.uploadData = function () {
            $Preload.show();
            let req = [];
            ctrl.importData.map(function (item) {
                let existItem = allApplications.filter(function (i) {
                    return i.Title === item.Application;
                })[0];
                if (existItem) {
                    req.push($ApiService.updateApplication({
                        Id: existItem.Id,
                        // Title: item.Application,
                        TestPlanOwnerId: item.TestPlanOwner && item.TestPlanOwner.length ? { results: item.TestPlanOwner.map(function (x) { return x.Id; }) } : { results: [0] },
                        ApprovingManagerId: item.ApprovingManager && item.ApprovingManager.Id ? item.ApprovingManager.Id : null,
                        ApprovingDirectorId: item.ApprovingDirector && item.ApprovingDirector.Id ? item.ApprovingDirector.Id : null,
                        BusinessUnit: item['Business Unit'],
                        ApplicationStatus: "Active",
                        Status: "Overdue",
                        EmailSent: false
                    }));
                }
                else {
                    req.push($ApiService.createApplication({
                        Title: item.Application,
                        TestPlanOwnerId: item.TestPlanOwner && item.TestPlanOwner.length ? { results: item.TestPlanOwner.map(function (x) { return x.Id; }) } : { results: [0] },
                        ApprovingManagerId: item.ApprovingManager && item.ApprovingManager.Id ? item.ApprovingManager.Id : null,
                        ApprovingDirectorId: item.ApprovingDirector && item.ApprovingDirector.Id ? item.ApprovingDirector.Id : null,
                        BusinessUnit: item['Business Unit'],
                        ApplicationStatus: "Active",
                        Status: "Overdue",
                        EmailSent: false
                    }));
                }
            });
            Promise.all(req).then(function (res) {
                setTimeout(function () {
                    $scope.$apply(function () {
                        $Preload.hide();
                        alert("Import completed!");
                        ctrl.resetFileInput();
                        ctrl.importData = [];
                    });
                }, 0);

            }, function (error) {
                setTimeout(function () {
                    $scope.$apply(function () {
                        console.log(error);
                        $Preload.hide();
                    });
                }, 0);
            });
        }

        ctrl.sendInitialEmails = function () {
            $Preload.show();
            let activeApps = [];
            $ApiService.getDRApplicationItems().then(function (applications) {
                activeApps = applications.filter(function (x) {
                    return x.ApplicationStatus === "Active" && x.TestPlanOwnerId && x.ApprovingManagerId && x.ApprovingDirectorId && !x.EmailSent;
                });
                let req = [];
                activeApps.forEach(function (item) {
                    req.push($ApiService.deleteEmailItems(item.Id));
                    req.push($ApiService.updateApplication({
                        Id: item.Id,
                        TestDate: new Date().toISOString(),
                        Status: "In progress",
                        EmailSent: true
                    }));
                    req.push($ApiService.sendEmail({
                        ToId: { 'results': item.TestPlanOwnerId.results.concat([item.ApprovingManagerId]) },
                        CCId: { 'results': [item.ApprovingDirectorId] },
                        Subject: "ACTION REQUIRED: Live Failover Testing Requirements " + ctrl.currYear,
                        Body: $("#initial-email-template").html(),
                        ApplicationId: item.Id,
                    }));
                    req.push($ApiService.sendEmail({
                        ToId: { 'results': item.TestPlanOwnerId.results },
                        CCId: { 'results': [item.ApprovingManagerId] },
                        Subject: "Reminder: " + item.Title + " Failover Exercise Requirement Due/Not Completed",
                        Body: "Hello, <p>You are receiving this email because you have an outstanding deliverable for your upcoming " + item.Title + " Failover Exercise. " +
                            "Please go to the <a href='" + ctrl.dashboardLink + "'>Failover Portal<i style='color:red'>*</i></a> and complete the Failover Exercise requirements as soon as possible.</p>" +
                            "<p>Please feel free to contact the EDR Team at <a href='mailto:Disasterrecoverytestteam@cvshealth.com'>Disasterrecoverytestteam@cvshealth.com</a> if you have any questions.</p>" +
                            "<p><span style=' font-size: 12px;color: red;'>* Supported Browsers:  Google Chrome and Edge</span></p>"+
                            "Thank you,<br>EDR Team",
                        DelayDate: new Date(new Date().setDate(new Date().getDate() + 5)),
                        // DelayDate: new Date(new Date().getTime() + 10 * 60000).toISOString(),
                        ApplicationId: item.Id,
                    }));
                    req.push($ApiService.sendEmail({
                        ToId: { 'results': item.TestPlanOwnerId.results },
                        CCId: { 'results': [item.ApprovingManagerId] },
                        Subject: "Reminder: " + item.Title + " Failover Exercise Requirement Due/Not Completed",
                        Body: "Hello, <p>You are receiving this email because you have an outstanding deliverable for your upcoming " + item.Title + " Failover Exercise. " +
                            "Please go to the <a href='" + ctrl.dashboardLink + "'>Failover Portal<i style='color:red'>*</i></a> and complete the Failover Exercise requirements as soon as possible.</p>" +
                            "<p>Please feel free to contact the EDR Team at <a href='mailto:Disasterrecoverytestteam@cvshealth.com'>Disasterrecoverytestteam@cvshealth.com</a> if you have any questions.</p>" +
                            "<p><span style=' font-size: 12px;color: red;'>* Supported Browsers:  Google Chrome and Edge</span></p>"+
                            "Thank you,<br>EDR Team",
                        DelayDate: getNextMonday(new Date(new Date().setDate(new Date().getDate() + 6))),
                        // DelayDate: new Date(new Date().getTime() + 10 * 60000).toISOString(),
                        ApplicationId: item.Id,
                        RepeatDay: "3"
                    }));
                });
                Promise.all(req).then(function (res) {
                    setTimeout(function () {
                        $scope.$apply(function () {
                            $Preload.hide();
                            alert("Process started!");
                        });
                    }, 0);

                }, function (error) {
                    setTimeout(function () {
                        $scope.$apply(function () {
                            console.log(error);
                            $Preload.hide();
                        });
                    }, 0);
                });;
            });
        }

        async function validateUserColumn(data) {

            // validate plan owner
            for (let i = 0; i < data.length; i++) {
                if (data[i]['Plan Owner']) {
                    let planOwners = data[i]['Plan Owner'] ? data[i]['Plan Owner'].split(";") : [];
                    data[i].TestPlanOwner = [];
                    for (let j = 0; j < planOwners.length; j++) {
                        let res = await $ApiService.searchUserByName(planOwners[j]);
                        if (res.SearchPrincipalsUsingContextWeb.results.length) {
                            let spUser = await $pnp.sp.web.ensureUser(res.SearchPrincipalsUsingContextWeb.results[0].LoginName);
                            data[i].TestPlanOwner.push(spUser.data);
                        }
                    }
                }
                if (data[i]['Approving IT Manager/Tech Owner']) {
                    let res = await $ApiService.searchUserByName(data[i]['Approving IT Manager/Tech Owner']);
                    if (res.SearchPrincipalsUsingContextWeb.results.length) {
                        let spUser = await $pnp.sp.web.ensureUser(res.SearchPrincipalsUsingContextWeb.results[0].LoginName);
                        data[i].ApprovingManager = spUser.data;
                    }
                }
                if (data[i]['Approving IT Director/Sub Portfolio Owner']) {
                    let res = await $ApiService.searchUserByName(data[i]['Approving IT Director/Sub Portfolio Owner']);
                    if (res.SearchPrincipalsUsingContextWeb.results.length) {
                        let spUser = await $pnp.sp.web.ensureUser(res.SearchPrincipalsUsingContextWeb.results[0].LoginName);
                        data[i].ApprovingDirector = spUser.data;
                    }
                }
            }
            setTimeout(function () {
                $scope.$apply(function () {
                    ctrl.importData = data;
                    $Preload.hide();
                });
            }, 0);
        }


        var ExcelToJSON = function (file) {
            if (!file) return;
            var reader = new FileReader();

            reader.onload = function (e) {
                /* read workbook */
                var bstr = e.target.result;
                var workbook = XLSX.read(bstr, { type: "binary" });
                // var sheetName = "Failover Tracking";
                var sheet = workbook.Sheets[workbook.SheetNames[0]];

                // remove header row"
                // delete_row(sheet, 0);

                // parse sheet to object
                var res = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: false });
                validateUserColumn(res);

            };

            reader.readAsBinaryString(file);
        };

        // utils
        var groupBy = (xs, key) => {
            return xs.reduce((rv, x) => {
                (rv[x[key]] = rv[x[key]] || []).push(x);
                return rv;
            }, {});
        };
        var ec = (r, c) => {
            return XLSX.utils.encode_cell({ r: r, c: c });
        };
        var delete_row = (ws, row_index) => {
            var variable = XLSX.utils.decode_range(ws["!ref"]);
            for (var R = row_index; R < variable.e.r; ++R) {
                for (var C = variable.s.c; C <= variable.e.c; ++C) {
                    ws[ec(R, C)] = ws[ec(R + 1, C)];
                }
            }
            variable.e.r--;
            ws["!ref"] = XLSX.utils.encode_range(variable.s, variable.e);
        };
        ctrl.onClickUploadButton = () => {
            let element = document.getElementById("import-file");
            element.addEventListener('change', ctrl.onFileChange);
            element.click();
        };

        ctrl.onFileChange = () => {
            $Preload.show();
            let element = document.getElementById("import-file");
            let files = element["files"];
            if (files && files.length) {
                setTimeout(function () {
                    $scope.$apply(function () {
                        ctrl.importFile = files[0];
                        ExcelToJSON(ctrl.importFile);
                    });
                }, 0);
            }
            else {
                setTimeout(function () {
                    $scope.$apply(function () {
                        $Preload.hide();
                    });
                }, 0);
            }

        };

        ctrl.resetFileInput = () => {
            let element = document.getElementById("import-file");
            element["value"] = "";
            ctrl.importFile = null;
        };

        function getNextMonday(date) {
            var d = new Date(date);
            d.setDate(d.getDate() + (1 + 7 - d.getDay()) % 7);
            return d;
        }
    }
})();