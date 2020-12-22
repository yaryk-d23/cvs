angular.module('popUp', [
    'ui.bootstrap',

    'popup/msg.html'
])

.provider('$popUp', function() {
this.$get = ['$uibModal', function($uibModal) {
  return {
    msg: function(msg, title, callback) {
        var size = "sm";
        var tmp = document.createElement("DIV");
        tmp.innerHTML = msg;
        tmp = tmp.textContent || tmp.innerText || ""

        if(tmp.length > 100) size = "xs";
        var modalInstance = $uibModal.open({
            animation: true,
            appendTo: angular.element(document.querySelectorAll('.app-container')),
            templateUrl: "popup/msg.html",
            controller: 'popupModalMsgInstanceCtrl',
            size: size,
            resolve: {
                msg: function () {
                    return msg;
                },
                title: function(){
                    return title
                }
            }
        }).closed.then(function(){
            if (typeof callback === "function") { 
                callback();
            }
        });
    }
  };
}];
})


.controller('popupModalMsgInstanceCtrl', function ($scope, $uibModalInstance, $sce, msg, title) {
var messages = {
    '_server_error': "Server Error"
}
if(messages[msg] != undefined){
    msg = messages[msg];
}
$scope.msg = $sce.trustAsHtml(msg);
$scope.title = $sce.trustAsHtml(title);
$scope.close = function () {
    $uibModalInstance.dismiss('cancel');
};
});


angular.module("popup/msg.html", []).run(["$templateCache", function($templateCache) {
$templateCache.put("popup/msg.html",
  '<div class="modal-header" ng-show="title">' +
'    <h4 class="modal-title" ng-bind-html="title"></h4>' +
'</div>' +
'<div class="modal-body" ng-bind-html="msg">\n' +
'</div>\n' +
'<div class="modal-footer">\n' +
'	<button type="button" class="button" ng-click="close()">OK</button>\n' +
'</div>\n' +
"");
}]);