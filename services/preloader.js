angular.module('preloader', [])

    .run(function ($compile, $rootScope) {
        var element = angular.element('<preloader ng-app="Preloader"></preloader>');
        var el = $compile(element)($rootScope);
        angular.element(document.body).append(el);

    })

    .factory('$Preload', function () {
        var factory = {
            visible: [],
            show: function (name) {
                if (name === undefined) {
                    name = "";
                }
                var index = this.visible.indexOf(name);
                if (index < 0) {
                    this.visible.push(name);
                }
            },
            hide: function (name) {
                if (name == "__all__") {
                    this.visible = [];
                }
                if (name === undefined) {
                    name = "";
                }
                var index = this.visible.indexOf(name);
                if (index >= 0) {
                    this.visible.splice(index, 1);
                }
            }
        }

        return factory;
    })

    .controller('preloaderCtrl', function ($scope, $Preload) {
        $scope.visible = [];
        $scope.$watch(function () { return $Preload.visible }, function (newVal, oldVal) {
            $scope.visible = $Preload.visible;
        });
    })

    .directive('preloader', function ($Preload) {
        'use strict';

        return {
            restrict: "E",
            replace: true,
            template:
                '<div class="pr-conteiner preloader" ng-show="visible.length" ng-controller="preloaderCtrl" ng-cloak>' +
                '<div class="pr-bg"></div>' +
                '<div class="pr-img"><i class="fa fa-spinner fa-pulse fa-4x padding-bottom"></i></div>' +
                '</div>'
        };
    });