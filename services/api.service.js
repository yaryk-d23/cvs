(function () {
    angular.module('App')
        .factory('$ApiService', function ($http, $q) {
            return {
                getDRApplicationItems: getDRApplicationItems,
                getDRApplicationItemById: getDRApplicationItemById,
                getApplicationTestPlanItems: getApplicationTestPlanItems,
                getCurrentUser: getCurrentUser
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
                        "*,Tier/Id,Tier/Title," +
                        "ApprovingITManager/Id,ApprovingITManager/Title," +
                        "ApprovingITDirector/Id,ApprovingITDirector/Title," +
                        "ITVicePresident/Id,ITVicePresident/Title," +
                        "PlanOwner/Id,PlanOwner/Title"
                    )
                    .expand(
                        "Tier,ApprovingITManager,ApprovingITDirector,ITVicePresident,PlanOwner"
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
                        "*,Tier/Id,Tier/Title," +
                        "ApprovingITManager/Id,ApprovingITManager/Title," +
                        "ApprovingITDirector/Id,ApprovingITDirector/Title," +
                        "ITVicePresident/Id,ITVicePresident/Title," +
                        "PlanOwner/Id,PlanOwner/Title"
                    )
                    .expand(
                        "Tier,ApprovingITManager,ApprovingITDirector,ITVicePresident,PlanOwner"
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
                        "*,EDRReview/Id,EDRReview/Title," +
                        "ITManager/Id,ITManager/Title," +
                        "ITDirector/Id,ITDirector/Title," +
                        "EDRApproval/Id,EDRApproval/Title"
                    )
                    .expand("EDRReview,ITManager,ITDirector,EDRApproval")
                    .get()
                    .then((response) => {
                        return response;
                    });
            }
            function capitalizeFirstLetter(string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            }

        });
})();