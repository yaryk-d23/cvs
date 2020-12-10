(function () {
    angular.module('App')
        .component('postTestResults', {
            templateUrl: window["APP_FOLDER"] + 'components/post-test-results/post-test-results.view.html?rnd' + Math.random(),
            bindings: {
                item: '='
            },
            controllerAs: 'ctrl',
            controller: ['$scope', '$ApiService', '$Preload', '$q', '$location', ctrl]
        });

    function ctrl($scope, $ApiService, $Preload, $q, $location) {
        var ctrl = this;
        ctrl.api = $ApiService;
        ctrl.postFiles = null;
        ctrl.approvalStatusItems = [{
            Role: "EDR Review",
            Name: "Alex Pashkevych",
            Date: null,
            Approval: null
        }, {
            Role: "IT Manager",
            Name: "Alex Pashkevych",
            Date: null,
            Approval: null
        }, {
            Role: "IT Director",
            Name: "Alex Pashkevych",
            Date: null,
            Approval: null
        },];

        ctrl.formatBytes = (a, b = 2) => {
            if (0 === a) return "0 bytes";
            const c = 0 > b ? 0 : b,
                d = Math.floor(Math.log(a) / Math.log(1024));
            return (
                parseFloat((a / Math.pow(1024, d)).toFixed(c)) +
                ["bytes", "kb", "mb", "gb"][d]
            );
        };

        ctrl.onClickUploadButton = () => {
            let element = document.getElementById("post-attachment-file");
            element.addEventListener('change', ctrl.onFileChange);
            element.click();
        };

        ctrl.onFileChange = () => {
            let element = document.getElementById("post-attachment-file");
            let files = element["files"];

            setTimeout(function () {
                $scope.$apply(function () {
                    ctrl.postFiles = files;
                });
            }, 0);

        };

        ctrl.resetFileInput = () => {
            let element = document.getElementById("post-attachment-file");
            element["value"] = "";
            ctrl.postFiles = null;
        };

        ctrl.getApprovalStatus = function (status) {
            switch (status) {
                case "Approved":
                    return '<img class="status-icon" src="' + window["APP_FOLDER"] + 'assets/approved.png" />';
                case "Cancelled":
                    return '<img class="status-icon" src="' + window["APP_FOLDER"] + 'assets/cancelled.png" />';
                case "Rejected":
                    return '<img class="status-icon" src="' + window["APP_FOLDER"] + 'assets/rejected.png" />';
                default:
                    return null;
            }
        }
    }
})();