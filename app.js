var app = angular.module('App', [
    "ngAnimate",
    "ngRoute",
    "ngSanitize",
    "ngTouch",
    "ui.bootstrap",
    'ui.select',
    'preloader',
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
    // $(window.parent).on('hashchange', function () {
    //     console.log('hashchange');
    //     getParentParams();
    // });
    getParentParams();
    $rootScope.$on('$locationChangeSuccess', function (angularEvent, newUrl, oldUrl) {
        // if (newUrl.indexOf('#') !== -1 && window.parent.location.hash !== ("#" + newUrl.split('#')[1])) {
        window.parent.location.hash = decodeURIComponent("#" + newUrl.split('#')[1]);
        // }
    });
    function getParentParams() {
        var hash = window.parent.location.hash.replace('#', '');
        hash = hash.split('?')[0];
        $location.path(decodeURIComponent(hash));
        // setTimeout(function () {
        //     $rootScope.$apply(function () {
        //         $location.path(window.parent.location.hash.replace('#', ''));
        //     });
        // }, 0);
    }
    function fixLayOut() {
        $(window.parent.document).find('.b_a_3b589226').css({
            'height': $('html').height() + 'px',
            'padding-bottom': '0'
        });
    }
    window.parent.addEventListener('resize', fixLayOut);
    let resizeEvent = new Event('resize');
    window.parent.dispatchEvent(resizeEvent);
});
app.controller('AppCtrl', [function () {
    var vm = this;
}]);
app.config(function ($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix('');

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
