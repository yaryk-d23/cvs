(function () {
    angular.module("App").factory("$ApiService", function ($http, $q) {
        return {
            getDRApplicationItems: getDRApplicationItems,
            getDRApplicationItemById: getDRApplicationItemById,
            getMyApplicationItems: getMyApplicationItems,
            getApplicationTestPlanItems: getApplicationTestPlanItems,
            getApplicationTestPlanItemById: getApplicationTestPlanItemById,
            getCurrentUser: getCurrentUser,
            createApplication: createApplication,
            searchUserByName: searchUserByName,
            updateApplication: updateApplication,
            createApplicationTestPlan: createApplicationTestPlan,
            updateApplicationTestPlan: updateApplicationTestPlan,
            getExerciseTimelineItems: getExerciseTimelineItems,
            createExerciseTimeline: createExerciseTimeline,
            updateExerciseTimeline: updateExerciseTimeline,
            uploadFile: uploadFile,
            getFormDigestValue: getFormDigestValue,
            getFormAttachments: getFormAttachments,
            sendEmail: sendEmail,
            deleteEmailItems: deleteEmailItems,
            deleteFile: deleteFile,
        };

        function getCurrentUser() {
            return $http
                .get(window["SITE_LOCATION_URL"] + "/_api/web/currentuser?$expand=Groups")
                .then(function (res) {
                    return res.data;
                });
        }

        function getDRApplicationItems() {
            return $pnp.sp.web.lists
                .getByTitle("DR Application")
                .items.select(
                    "*," +
                    "TestPlanOwner/Id,TestPlanOwner/Title," +
                    "ApprovingManager/Id,ApprovingManager/Title," +
                    "ApprovingDirector/Id,ApprovingDirector/Title"
                )
                .expand("TestPlanOwner,ApprovingManager,ApprovingDirector")
                .get()
                .then((response) => {
                    return response;
                });
        }

        function getDRApplicationItemById(id) {
            return $pnp.sp.web.lists
                .getByTitle("DR Application")
                .items.getById(id)
                .select(
                    "*," +
                    "TestPlanOwner/Id,TestPlanOwner/Title," +
                    "ApprovingManager/Id,ApprovingManager/Title," +
                    "ApprovingDirector/Id,ApprovingDirector/Title"
                )
                .expand("TestPlanOwner,ApprovingManager,ApprovingDirector")
                .get()
                .then((response) => {
                    return response;
                });
        }

        function getMyApplicationItems() {
            return $pnp.sp.web.lists
                .getByTitle("DR Application")
                .items.select(
                    "*," +
                    "TestPlanOwner/Id,TestPlanOwner/Title," +
                    "ApprovingManager/Id,ApprovingManager/Title," +
                    "ApprovingDirector/Id,ApprovingDirector/Title"
                )
                .expand("TestPlanOwner,ApprovingManager,ApprovingDirector")
                .filter("Status ne 'Over Due' and TestPlanOwnerId eq " + window.currentSPUser.Id)
                .get()
                .then((response) => {
                    return response;
                });
        }

        function getApplicationTestPlanItems() {
            return $pnp.sp.web.lists
                .getByTitle("Application Test Plan")
                .items.select(
                    "*,TestEDRReviewUser/Id,TestEDRReviewUser/Title," +
                    "TestITManagerUser/Id,TestITManagerUser/Title," +
                    "TestITDirectorUser/Id,TestITDirectorUser/Title," +
                    "PostTestEDRReviewUser/Id,PostTestEDRReviewUser/Title," +
                    "PostTestITManagerUser/Id,PostTestITManagerUser/Title," +
                    "PostTestITDirectorUser/Id,PostTestITDirectorUser/Title"
                )
                .expand(
                    "TestEDRReviewUser,TestITManagerUser,TestITDirectorUser,PostTestEDRReviewUser,PostTestITManagerUser,PostTestITDirectorUser"
                )
                .get()
                .then((response) => {
                    return response;
                });
        }

        function getApplicationTestPlanItemById(id) {
            return $pnp.sp.web.lists
                .getByTitle("Application Test Plan")
                .items.getById(id)
                .select(
                    "*,TestEDRReviewUser/Id,TestEDRReviewUser/Title," +
                    "TestITManagerUser/Id,TestITManagerUser/Title," +
                    "TestITDirectorUser/Id,TestITDirectorUser/Title," +
                    "PostTestEDRReviewUser/Id,PostTestEDRReviewUser/Title," +
                    "PostTestITManagerUser/Id,PostTestITManagerUser/Title," +
                    "PostTestITDirectorUser/Id,PostTestITDirectorUser/Title"
                )
                .expand(
                    "TestEDRReviewUser,TestITManagerUser,TestITDirectorUser,PostTestEDRReviewUser,PostTestITManagerUser,PostTestITDirectorUser"
                )
                .get()
                .then((response) => {
                    return response;
                });
        }

        function createApplicationTestPlan(data) {
            return $pnp.sp.web.lists
                .getByTitle("Application Test Plan")
                .items.add(data);
        }
        function updateApplicationTestPlan(data) {
            return $pnp.sp.web.lists
                .getByTitle("Application Test Plan")
                .items.getById(data.Id)
                .update(data).then(function (item) {
                    return $pnp.sp.web.lists
                        .getByTitle("Application Test Plan")
                        .items.getById(data.Id)
                        .get();
                });
        }

        function createApplication(data) {
            return $pnp.sp.web.lists.getByTitle("DR Application").items.add(data);
        }

        function updateApplication(data) {
            return $pnp.sp.web.lists
                .getByTitle("DR Application")
                .items.getById(data.Id)
                .update(data);
        }

        function createExerciseTimeline(data) {
            return $pnp.sp.web.lists.getByTitle("Exercise Timeline").items.add(data);
        }

        function updateExerciseTimeline(data) {
            return $pnp.sp.web.lists
                .getByTitle("Exercise Timeline")
                .items.getById(data.Id)
                .update(data);
        }

        function getExerciseTimelineItems(testPlanItemId) {
            return $pnp.sp.web.lists
                .getByTitle("Exercise Timeline")
                .items.filter("TestPlanItemId eq " + testPlanItemId)
                .get();
        }

        function searchUserByName(value) {
            return $pnp.sp.utility.searchPrincipals(value, 1, 15, "", 10);
        }

        function getFormDigestValue() {
            return new Promise(function (resolve, reject) {
                $http({
                    url: window["SITE_LOCATION_URL"] + "/_api/contextinfo",
                    method: "POST",
                    headers: {
                        accept: "application/json;odata=verbose",
                        contentType: "text/xml",
                    },
                }).then(
                    function (res) {
                        resolve(res.data.d.GetContextWebInformation.FormDigestValue);
                    },
                    (error) => reject(error)
                );
            });
        }

        function uploadFile(libraryTitle, data, spdata) {
            return new Promise(function (resolve, reject) {
                getFormDigestValue().then(function (formDigestValue) {
                    var addToFileName =
                        new Date().getTime() + "---" + Math.random() + "---";
                    var input_file_name = data.name.split(".");
                    var ext = input_file_name.pop();
                    input_file_name = input_file_name.join(".");
                    // input_file_name = input_file_name.substring(0, 50);
                    input_file_name = input_file_name + "." + ext;

                    var config = {
                        headers: {
                            Accept: "application/json; odata=verbose",
                            "X-RequestDigest": formDigestValue,
                            "Content-Type": undefined,
                        },
                        responseType: "arraybuffer",
                    };
                    var url =
                        window["SITE_LOCATION_URL"] +
                        "/_api/web/lists/GetByTitle('" +
                        libraryTitle +
                        "')/RootFolder/Files/add(overwrite=true, url='" +
                        addToFileName +
                        input_file_name +
                        "')?$select=*,ListItemAllFields/Id&$expand=ListItemAllFields";
                    $http({
                        method: "POST",
                        url: url,
                        processData: false,
                        data: data,
                        headers: config.headers,
                    }).then(function (res) {

                        var id = res.data.d.ListItemAllFields.Id;
                        var createFileRes = res.data.d;
                        var fileName = res.data.d.Name.replace(addToFileName, "");
                        fileName = fileName.split(".");
                        var ext = fileName.pop();
                        fileName = fileName.join(".") + "-" + id + "." + ext;
                        $pnp.sp.web.lists
                            .getByTitle(libraryTitle)
                            .items.getById(id).get().then(function (fileItem) {
                                var itemPayload = {};
                                itemPayload['__metadata'] = { 'type': fileItem['__metadata']['type'] };
                                itemPayload['Title'] = fileName.replace(addToFileName, "");
                                itemPayload['FileLeafRef'] = fileName.replace(addToFileName, "");
                                var itemUrl = fileItem['__metadata']['uri'];
                                $http({
                                    method: "POST",
                                    url: itemUrl,
                                    data: itemPayload,
                                    headers: {
                                        Accept: "application/json;odata=verbose",
                                        "content-type": "application/json;odata=verbose",
                                        "X-RequestDigest": formDigestValue,
                                        "X-HTTP-Method": "MERGE",
                                        "If-Match": "*"
                                    },
                                }).then(function () {
                                    if (spdata) {
                                        $pnp.sp.web.lists
                                            .getByTitle(libraryTitle)
                                            .items.getById(id)
                                            .update(spdata)
                                            .then(function () {
                                                resolve(createFileRes);
                                            });
                                    } else {
                                        resolve(createFileRes);
                                    }
                                });
                            });
                        // var OldServerRelativeUrl = res.data.d.ServerRelativeUrl;
                        // var ServerRelativeUrl = OldServerRelativeUrl.split("/");
                        // var file_name = ServerRelativeUrl.pop();
                        // file_name = file_name.replace(addToFileName, "");
                        // file_name = file_name.split(".");
                        // var ext = file_name.pop();
                        // file_name = file_name.join(".") + "-" + id + "." + ext;
                        // ServerRelativeUrl.push(file_name);
                        // ServerRelativeUrl = ServerRelativeUrl.join("/");
                        // $http({
                        //     method: "POST",
                        //     url:
                        //         window["SITE_LOCATION_URL"] +
                        //         "/_api/web/getfilebyserverrelativeurl('" +
                        //         OldServerRelativeUrl +
                        //         "')/moveto(newurl='" +
                        //         ServerRelativeUrl +
                        //         "',flags=1)",
                        //     headers: {
                        //         Accept: "application/json;odata=verbose",
                        //         "content-type": "application/json;odata=verbose",
                        //         "X-RequestDigest": formDigestValue,
                        //     },
                        // })

                    });
                });
            });
        }

        function getFormAttachments(testPlanItemId) {
            return $pnp.sp.web.lists
                .getByTitle("ApplicationAttachments")
                .items.expand("File")
                .filter("ApplicationTestPlanId eq " + testPlanItemId)
                .get();
        }

        function sendEmail(data) {
            return $pnp.sp.web.lists.getByTitle("EmailLog").items.add(data);
        }

        function deleteEmailItems(appId) {
            return $pnp.sp.web.lists.getByTitle("EmailLog").items.filter('ApplicationId eq ' + appId).get().then(function (res) {
                let req = [];
                res.forEach(function (item) {
                    req.push($pnp.sp.web.lists.getByTitle("EmailLog").items.getById(item.Id).delete());
                });
                return Promise.all(req);
            });
        }

        function deleteFile(url) {
            return $pnp.sp.web.getFolderByServerRelativeUrl(url).getItem().then(item => {
                return item.delete();
            });
        }

        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
    });
})();
