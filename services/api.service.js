(function () {
    angular.module("App").factory("$ApiService", ['$http', '$q', '$injector', function ($http, $q, $injector) {
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
            utcToLocalTime: utcToLocalTime
        };

        function utcToLocalTime(utcDate) {
            return $pnp.sp.web.regionalSettings.timeZone.utcToLocalTime(utcDate);
        }

        function getCurrentUser() {
            return $http
                .get(window["SITE_LOCATION_URL"] + "/_api/web/currentuser?$expand=Groups")
                .then(function (res) {
                    return res.data;
                }, onError);
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
                .filter("Status ne 'Out of Scope'")
                .top(50000)
                .get()
                .then((response) => {
                    let req = {};
                    for(let i=0;i<response.length;i++){
                        if(response[i].TestDate) {
                            req[response[i].Id] = utcToLocalTime(response[i].TestDate);
                        }
                    }
                    return $q.all(req).then(function(dates){
                        Object.keys(dates).forEach(function(id) {
                            for(let i=0;i<response.length;i++){
                                if(response[i].Id == id) {
                                    response[i].TestDate = dates[id];
                                }
                            }
                        });
                        return response;
                    });
                }, onError);
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
                    if(response.TestDate) {
                        return utcToLocalTime(response.TestDate).then(function(date){
                            response.TestDate = date;
                            return response;
                        });
                    }
                    else return response;
                }, onError);
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
                .filter("Status ne 'Overdue' and Status ne 'Out of Scope' and ("+
                "TestPlanOwnerId eq " + (window.currentSPUser ? window.currentSPUser.Id : _spPageContextInfo.userId)+" or "+
                "ApprovingManagerId eq " + (window.currentSPUser ? window.currentSPUser.Id : _spPageContextInfo.userId)+" or "+
                "ApprovingDirectorId eq " + (window.currentSPUser ? window.currentSPUser.Id : _spPageContextInfo.userId)+
                ")")
                .top(50000)
                .get()
                .then((response) => {
                    let req = {};
                    for(let i=0;i<response.length;i++){
                        if(response[i].TestDate) {
                            req[response[i].Id] = utcToLocalTime(response[i].TestDate);
                        }
                    }
                    return $q.all(req).then(function(dates){
                        Object.keys(dates).forEach(function(id) {
                            for(let i=0;i<response.length;i++){
                                if(response[i].Id == id) {
                                    response[i].TestDate = dates[id];
                                }
                            }
                        });
                        return response;
                    });
                }, onError);
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
                .top(50000)
                .get()
                .then((response) => {
                    let req = {};
                    for(let i=0;i<response.length;i++){
                        if(response[i].DueDate) {
                            req[response[i].Id] = $q.all({
                                Created: utcToLocalTime(response[i].Created), 
                                DueDate: utcToLocalTime(response[i].DueDate)
                            });
                        }
                    }
                    return $q.all(req).then(function(dates){
                        Object.keys(dates).forEach(function(id) {
                            for(let i=0;i<response.length;i++){
                                if(response[i].Id == id) {
                                    response[i].Created = dates[id].Created;
                                    response[i].DueDate = dates[id].DueDate;
                                }
                            }
                        });
                        return response;
                    });
                    
                }, onError);
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
                    return $q.all({
                        Created: utcToLocalTime(response.Created), 
                        DueDate: utcToLocalTime(response.DueDate)
                    }).then(function(res){
                        response.Created = res.Created;
                        response.DueDate = res.DueDate;
                        return response;
                    });
                }, onError);
        }

        function createApplicationTestPlan(data) {
            return $pnp.sp.web.lists
                .getByTitle("Application Test Plan")
                .items.add(data).then((response) => {
                    return response;
                }, onError);
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
                }, onError);
        }

        function createApplication(data) {
            return $pnp.sp.web.lists.getByTitle("DR Application").items.add(data).then((response) => {
                return response;
            }, onError);
        }

        function updateApplication(data) {
            return $pnp.sp.web.lists
                .getByTitle("DR Application")
                .items.getById(data.Id)
                .update(data).then((response) => {
                    return response;
                }, onError);
        }

        function createExerciseTimeline(data) {
            return $pnp.sp.web.lists.getByTitle("Exercise Timeline").items.add(data).then((response) => {
                return response;
            }, onError);
        }

        function updateExerciseTimeline(data) {
            return $pnp.sp.web.lists
                .getByTitle("Exercise Timeline")
                .items.getById(data.Id)
                .update(data).then((response) => {
                    return response;
                }, onError);
        }

        function getExerciseTimelineItems(testPlanItemId) {
            return $pnp.sp.web.lists
                .getByTitle("Exercise Timeline")
                .items.filter("TestPlanItemId eq " + testPlanItemId)
                .orderBy('SortOrder')
                .get().then((response) => {
                    return response;
                }, onError);
        }

        function searchUserByName(value) {
            return $pnp.sp.utility.searchPrincipals(value, 1, 15, "", 10).then((response) => {
                return response;
            }, onError);
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
                                            }, onError);
                                    } else {
                                        resolve(createFileRes);
                                    }
                                }, onError);
                            }, onError);
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

                    }, onError);
                });
            });
        }

        function getFormAttachments(testPlanItemId) {
            return $pnp.sp.web.lists
                .getByTitle("ApplicationAttachments")
                .items.expand("File")
                .filter("ApplicationTestPlanId eq " + testPlanItemId)
                .get().then((response) => {
                    return response;
                }, onError);
        }

        function sendEmail(data) {
            return $pnp.sp.web.lists.getByTitle("EmailLog").items.add(data).then((response) => {
                return response;
            }, onError);
        }

        function deleteEmailItems(appId) {
            return $pnp.sp.web.lists.getByTitle("EmailLog").items.filter('ApplicationId eq ' + appId).get().then(function (res) {
                let req = [];
                res.forEach(function (item) {
                    req.push($pnp.sp.web.lists.getByTitle("EmailLog").items.getById(item.Id).update({ Stop: true }));
                });
                return Promise.all(req);
            });
        }

        function deleteFile(url) {
            return $pnp.sp.web.getFolderByServerRelativeUrl(url).getItem().then(item => {
                return item.delete().then((response) => {
                    return response;
                }, onError);
            }, onError);
        }

        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        function onError(error) {
            $injector.get('$popUp').msg("<div style='font-family: monospace; white-space: pre-line;'>" + JSON.stringify(error) + "</div>", "Server Error");
            setTimeout(function () {
                $injector.get('$Preload').hide();
            }, 0);
        }
    }]);
})();
