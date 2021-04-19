(function () {
    angular.module('App')
        .component('archiveApplication', {
            template: '<button type="button" class="btn btn-success" ng-click="ctrl.onArchive()">Archive applications</button>',
            bindings: {
                onChange: '&',
            },
            controllerAs: 'ctrl',
            controller: ['$ApiService', '$q', '$Preload', '$scope', '$http', ctrl]
        });

    function ctrl($ApiService, $q, $Preload, $scope, $http) {
        var ctrl = this;
        
        ctrl.onArchive = async () => {
            if(!confirm("Are you sure?")) return;
            $Preload.show();
            let allData = await $q.all({
                apps: $ApiService.getDRApplicationItems(),
                testPlans: $ApiService.getApplicationTestPlanItems(),
                attachments: $ApiService.getAllFormAttachments(),
            });
            let apps = allData.apps;
            let testPlans = allData.testPlans;
            let attachments = allData.attachments;
            // archive dr applications
            let req = {};
            apps.forEach(item => {
                req[item.Id] = $ApiService.createArchiveApplication({
                    Title: item.Title,
                    TestPlanOwnerId: item.TestPlanOwner && item.TestPlanOwner.results && item.TestPlanOwner.results.length ? { results: item.TestPlanOwner.results.map(function (x) { return x.Id; }) } : { results: [0] },
                    ApprovingManagerId: item.ApprovingManager && item.ApprovingManager.Id ? item.ApprovingManager.Id : null,
                    ApprovingDirectorId: item.ApprovingDirector && item.ApprovingDirector.Id ? item.ApprovingDirector.Id : null,
                    BusinessUnit: item.BusinessUnit,
                    ApplicationStatus: item.ApplicationStatus,
                    Status: item.Status,
                    EmailSent: item.EmailSent,
                    Tier: item.Tier,
                    TestDate: item.TestDate,
                    TestMonth: item.TestMonth,
                    Category: item.Category,
                    ArchivedById: item.ArchivedById ? item.ArchivedById : null,
                    ArchivedComments: item.ArchivedComments ? item.ArchivedComments : null,
                    ArchivedDate: item.ArchivedDate ? item.ArchivedDate : null,
                });
            });
            let appsRes = await $q.all(req);
            req = {};
            apps.forEach(item => {
                if(!!item.ParentId) {
                    let archiveApp = appsRes[item.Id];
                    let archiveParentApp = appsRes[item.ParentId];
                    req[item.Id] = $ApiService.updateArchiveApplication({
                        Id: archiveApp.Id,
                        ParentId: archiveParentApp.Id
                    });
                }
            });
            await $q.all(req);

            //archive test plat items
            req = {};
            testPlans.forEach(item => {
                req[item.Id] = $ApiService.createArchiveApplicationTestPlan({
                    Title: item.Title,
                    DueDate: item.DueDate,
                    CompletedResults: item.CompletedResults,
                    TestEDRReview: item.TestEDRReview,
                    TestITManager: item.TestITManager,
                    TestITDirector: item.TestITDirector,
                    TestEDRReviewUserId: item.TestEDRReviewUser && item.TestEDRReviewUser.Id ? item.TestEDRReviewUser.Id : null,
                    TestITManagerUserId: item.TestITManagerUser && item.TestITManagerUser.Id ? item.TestITManagerUser.Id : null,
                    TestITDirectorUserId: item.TestITDirectorUser && item.TestITDirectorUser.Id ? item.TestITDirectorUser.Id : null,
                    TestEDRReviewDate: item.TestEDRReviewDate,
                    TestITManagerDate: item.TestITManagerDate,
                    TestITDirectorDate: item.TestITDirectorDate,
                    PostTestEDRReview: item.PostTestEDRReview,
                    PostTestITManager: item.PostTestITManager,
                    PostTestITDirector: item.PostTestITDirector,
                    PostTestEDRReviewUserId: item.PostTestEDRReviewUser && item.PostTestEDRReviewUser.Id ? item.PostTestEDRReviewUser.Id : null,
                    PostTestITManagerUserId: item.PostTestITManagerUser && item.PostTestITManagerUser.Id ? item.PostTestITManagerUser.Id : null,
                    PostTestITDirectorUserId: item.PostTestITDirectorUser && item.PostTestITDirectorUser.Id ? item.PostTestITDirectorUser.Id : null,
                    PostTestEDRReviewDate: item.PostTestEDRReviewDate,
                    PostTestITManagerDate: item.PostTestITManagerDate,
                    PostTestITDirectorDate: item.PostTestITDirectorDate,
                    Stage: item.Stage,
                    TestEDRReviewComment: item.TestEDRReviewComment,
                    TestITManagerComment: item.TestITManagerComment,
                    TestITDirectoComment: item.TestITDirectoComment,
                    PostTestEDRReviewComment: item.PostTestEDRReviewComment,
                    PostTestITManagerComment: item.PostTestITManagerComment,
                    PostTestITDirectoComment: item.PostTestITDirectoComment,
                    ApplicationId: appsRes[item.ApplicationId].Id,
                    ApplicationStatus: item.ApplicationStatus,
                });
            });
            let testPlansRes = await $q.all(req);

            // archive attachments
            req = {};
            attachments.forEach(item => {
                let oldUrl = item.File.ServerRelativeUrl;
                let newUrl = item.File.ServerRelativeUrl.replace('ApplicationAttachments','ArchiveApplicationAttachments');
                // req[item.Id] = $ApiService.copyFile(oldUrl, newUrl);
                req[item.Id] = $ApiService.copyFile("Archive Application Attachments", {
                    name: item.File.Name,
                    fileBinary: item.fileBinary,
                }, {
                    ApplicationTestPlanId: item.ApplicationTestPlan && item.ApplicationTestPlan.Title ? testPlansRes[item.ApplicationTestPlanId].Id : null,
                    AttachmentType: item.AttachmentType,
                })
            });
            await $q.all(req);
            // req = {};
            // let names = attachments.map(function(x){ return "Title eq '" + x.File.Name + "'";});
            // let archiveFiles = await $ApiService.getAllArchiveFormAttachments(names);
            // archiveFiles.forEach(function(item){
            //     let oldFile = attachments.filter(function(x){
            //         return x.File.Name === item.File.Name;
            //     })[0];
            //     if(oldFile.ApplicationTestPlan && oldFile.ApplicationTestPlan.Title) {
            //         req[item.Id] = $ApiService.updateArchiveFileProps({
            //             Id: item.Id,
            //             ApplicationTestPlanId: testPlansRes[oldFile.ApplicationTestPlanId].Id,
            //         });
            //     }
            // });
            // await $q.all(req);

            // move all data to trash
            req = [];
            apps.forEach(item => {
                req.push($ApiService.moveItemToTrash('DR Application', item.Id));
            });
            testPlans.forEach(item => {
                req.push($ApiService.moveItemToTrash('Application Test Plan', item.Id));
            });
            attachments.forEach(item => {
                req.push($ApiService.moveItemToTrash('ApplicationAttachments', item.Id));
            });
            await $q.all(req);
            setTimeout(function () {
                $scope.$apply(function () {
                    $Preload.hide();
                    ctrl.onChange();
                });
            }, 0);
        }
    }
})();