var app = angular.module('App', [
    "ngAnimate",
    "ngRoute",
    "ngSanitize",
    "ngTouch",
    "ui.bootstrap",
    'ui.select',
    'preloader',
    'popUp',
]);
app.run(function ($rootScope, $location, $Preload, $ApiService) {
    $Preload.show();
    $pnp.setup({
        spBaseUrl: window["SITE_LOCATION_URL"],
        sp: {
            headers: {
                "Accept": "application/json; odata=verbose"
            }
        }
    });
    $ApiService.getCurrentUser().then(function (res) {
        window.currentSPUser = res;
    });
});
app.controller('AppCtrl', ['$location', function ($location) {
    var ctrl = this;
    ctrl.location = $location;
    ctrl.navLinks = [
        {
            title: "Dashboard",
            link: "/dashboard",
        }, {
            title: "Import Applications",
            link: "/import-applications",
        }, {
            title: "Owner Dashboard",
            link: "/owners-dashboard",
        },
    ];
    ctrl.isAdmin = function () {
        if (!window.currentSPUser) return;
        let flag = false;
        angular.forEach(window.currentSPUser.Groups, function (group) {
            if (group.Title == 'EDR Team') {
                flag = true;
            }
        });
        return flag;
    }
    ctrl.isActivePath = function (path) {
        return $location.path() == path;
    }
}]);
app.config(function ($routeProvider, $locationProvider, $provide, $httpProvider) {
    $provide.factory('httpInterceptor', function ($q, $injector) {
        return {
            responseError: function (rejection) {
                if (!rejection.config.headers.noautomessage) {
                    var scope = {
                        pageURL: window.location.href,
                        rejection: rejection
                    }

                    if (scope.rejection.data.error == undefined) {
                        scope.rejection.data.error = scope.rejection.data['odata.error'];
                    }

                    var msg = [];
                    if (scope.rejection.data.error) {
                        msg.push("<b>Code:</b> " + scope.rejection.data.error.code);
                        msg.push("<b>Message:</b> " + scope.rejection.data.error.message.value);
                    } else {
                        msg.push(angular.toJson(scope.rejection.data));
                    }
                    msg.push("");
                    msg.push("<b>Request URL:</b> " + " " + scope.rejection.config.method + " " + scope.rejection.config.url);
                    $injector.get('$popUp').msg("<div style='font-family: monospace; white-space: pre-line;'>" + msg.join("<br>") + "</div>", "Server Error");
                    $injector.get('$Preload').hide('__all__');
                    // $injector.get('$Progress').hide();

                    // $injector.get('$SendEmail').Send("ServerError", undefined, scope)
                }
                return $q.reject(rejection);
            }
        };
    });
    $httpProvider.interceptors.push('httpInterceptor');
    $locationProvider.hashPrefix('');
    var isAdmins = async function ($location, $q, $ApiService) {
        var deferred = $q.defer();
        var currentUser = await $ApiService.getCurrentUser();
        var flag = false;
        angular.forEach(currentUser.Groups, function (group) {
            if (group.Title == 'EDR Team') {
                flag = true;
                deferred.resolve();
            }
        });
        if (!flag) {
            deferred.reject();
            $location.url('/dashboard');
        }

        return deferred.promise;
    }
    $routeProvider
        .when('/dashboard', {
            template: '<application-test-plan-dashboard></application-test-plan-dashboard>'
        })
        .when('/process-form', {
            template: '<test-application-process></test-application-process>'
        })
        .when('/process-form/:id', {
            template: '<test-application-process></test-application-process>'
        })
        .when('/import-applications', {
            template: '<import-applications></import-applications>',
            resolve: {
                loggedIn: isAdmins
            }
        })
        .when('/owners-dashboard', {
            template: '<application-ownership-dashboard></application-ownership-dashboard>'
        })
        .otherwise('/dashboard');
});
app.directive('fixFocusOnTouch', function () {
    return {
        restrict: 'A',
        controller: function ($element) {
            /*
            Usually, event handlers binding are made in the link function.
            But we need this handler to be executed first, so we add it in the controller function instead.
             */
            var inputElement = $element[0].querySelector('input.ui-select-search');
            angular.element(inputElement).bind('touchend', function (event) {
                event.stopImmediatePropagation();
            });
        }
    }
});
app.filter('propsFilter', function () {
    return function (items, props) {
        var out = [];

        if (angular.isArray(items)) {
            var keys = Object.keys(props);

            items.forEach(function (item) {
                var itemMatches = false;

                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    };
})
