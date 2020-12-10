(function () {
    angular.module('App')
        .factory('$ApiService', function ($http, $q) {
            return {
                getDRApplicationItems: getDRApplicationItems,
                getDRApplicationItemById: getDRApplicationItemById,
                getApplicationTestPlanItems: getApplicationTestPlanItems,
                getApplicationTestPlanItemById: getApplicationTestPlanItemById,
                getCurrentUser: getCurrentUser,
                createApplication: createApplication,
                searchUserByName: searchUserByName,
                updateApplication: updateApplication,
                createApplicationTestPlan: createApplicationTestPlan,
                updateApplicationTestPlan: updateApplicationTestPlan,
                getExcerciseTimelineItems: getExcerciseTimelineItems,
                createExcerciseTimeline: createExcerciseTimeline,
                updateExcerciseTimeline: updateExcerciseTimeline,
            };

            function getCurrentUser(params) {
                return $http.get(window["SITE_LOCATION_URL"] + '/_api/web/currentuser?' + params)
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
                    .expand(
                        "TestPlanOwner,ApprovingManager,ApprovingDirector"
                    )
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
                    .expand(
                        "TestPlanOwner,ApprovingManager,ApprovingDirector"
                    )
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
                    .expand("TestEDRReviewUser,TestITManagerUser,TestITDirectorUser,PostTestEDRReviewUser,PostTestITManagerUser,PostTestITDirectorUser")
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
                    .expand("TestEDRReviewUser,TestITManagerUser,TestITDirectorUser,PostTestEDRReviewUser,PostTestITManagerUser,PostTestITDirectorUser")
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
                    .items.getById(data.Id).update(data);
            }

            function createApplication(data) {
                return $pnp.sp.web.lists
                    .getByTitle("DR Application")
                    .items.add(data);
            }

            function updateApplication(data) {
                return $pnp.sp.web.lists
                    .getByTitle("DR Application")
                    .items.getById(data.Id).update(data);
            }

            function createExcerciseTimeline(data) {
                return $pnp.sp.web.lists
                    .getByTitle("Excercise Timeline")
                    .items.add(data);
            }

            function updateExcerciseTimeline(data) {
                return $pnp.sp.web.lists
                    .getByTitle("Excercise Timeline")
                    .items.getById(data.Id).update(data);
            }

            function getExcerciseTimelineItems(testPlanItemId) {
                return $pnp.sp.web.lists
                    .getByTitle("Excercise Timeline")
                    .items.filter("TestPlanItemId eq " + testPlanItemId).get();
            }

            function searchUserByName(value) {
                return $pnp.sp.utility.searchPrincipals(value,
                    1,
                    15,
                    "",
                    10);
            }

            function capitalizeFirstLetter(string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            }

        });
})();