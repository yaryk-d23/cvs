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
                        Tier: item.Tier,
                        TestPlanOwnerId: item.TestPlanOwner && item.TestPlanOwner.Id ? item.TestPlanOwner.Id : null,
                        BusinessUnit: item['Business Unit'],
                    }));
                }
                else {
                    req.push($ApiService.createApplication({
                        Title: item.Application,
                        Tier: item.Tier,
                        TestPlanOwnerId: item.TestPlanOwner && item.TestPlanOwner.Id ? item.TestPlanOwner.Id : null,
                        BusinessUnit: item['Business Unit'],
                    }));
                }
            });
            Promise.all(req).then(function (res) {
                setTimeout(function () {
                    $scope.$apply(function () {
                        $Preload.hide();
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

        async function validateUserColumn(data) {

            // validate plan owner
            for (let i = 0; i < data.length; i++) {
                if (data[i]['Plan Owner']) {
                    let res = await $ApiService.searchUserByName(data[i]['Plan Owner']);
                    if (res.SearchPrincipalsUsingContextWeb.results.length) {
                        let spUser = await $pnp.sp.web.ensureUser(res.SearchPrincipalsUsingContextWeb.results[0].Email);
                        data[i].TestPlanOwner = spUser.data;
                    }
                }
            }
            setTimeout(function () {
                $scope.$apply(function () {
                    ctrl.importData = data;
                    console.log(ctrl.importData);
                    $Preload.hide();
                });
            }, 0);
        }


        var ExcelToJSON = function (file) {
            var reader = new FileReader();

            reader.onload = function (e) {
                /* read workbook */
                var bstr = e.target.result;
                var workbook = XLSX.read(bstr, { type: "binary" });
                var sheetName = "Failover Tracking";
                var sheet = workbook.Sheets[workbook.SheetNames.filter(function (x) { return x === sheetName })[0]];

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

            setTimeout(function () {
                $scope.$apply(function () {
                    ctrl.importFile = files[0];
                    ExcelToJSON(ctrl.importFile);
                });
            }, 0);

        };

        ctrl.resetFileInput = () => {
            let element = document.getElementById("import-file");
            element["value"] = "";
            ctrl.importFile = null;
        };
    }
})();