(function () {
    angular.module('App')
        .factory('$EmailService', function ($http, $q) {
            var emailSettings = {
                properties: {
                    To: { 'results': [] },
                    Subject: '',
                    Body: '',
                    '__metadata': {
                        'type': 'SP.Utilities.EmailProperties'
                    },
                    "AdditionalHeaders":
                    {
                        "__metadata":
                            { "type": "Collection(SP.KeyValue)" },
                        "results":
                            [
                                {
                                    "__metadata": {
                                        "type": 'SP.KeyValue'
                                    },
                                    "Key": "content-type",
                                    "Value": 'text/html',
                                    "ValueType": "Edm.String"
                                }
                            ]
                    }
                }
            };
            return {
                sendAssignorEmail: sendAssignorEmail,
                sendAssigneeEmail: sendAssigneeEmail,
                sendRejectedEmail: sendRejectedEmail,
                sendCombineEmail: sendCombineEmail,
                sendReviewerEmail: sendReviewerEmail,
                sendFinalReviewerRejectEmail: sendFinalReviewerRejectEmail,
            };


            function sendAssignorEmail(sections) {
                var req = [];
                sections.forEach(function (item) {
                    var email = angular.copy(emailSettings);
                    email.properties.To.results = [item.Assignee.EMail || item.Assignee.Email];
                    email.properties.From = window.currentSPUser.Email;
                    email.properties.Subject = "Assigned New Section";
                    email.properties.Body = "<div>" +
                        '<p>Hi,</p>' +
                        '<p>A business cycle memo is being updated in SharePoint. You have been assigned to update a section(s). Please click ' +
                        '<a target="_blank" href="' + window.APP_PAGE_LOCATION_URL + '#/update-section/' + item.BCMID + '">here</a>' +
                        ' to review and update.</p>' +
                        '<p>Best, <br/><br/>' +
                        (window.currentSPUser.Title + ', Auditor<br/>') +


                        '</p>' +
                        "</div>";
                    req.push(sendEmail(email));
                });

                return new Promise(function (resolve, reject) {
                    $q.all(req).then(function (res) {
                        resolve(res);
                    });
                });

            }

            function sendAssigneeEmail(section) {
                var email = angular.copy(emailSettings);
                email.properties.To.results = [section.Author.EMail];
                email.properties.From = window.currentSPUser.Email;
                email.properties.Subject = "Updated Section";
                email.properties.Body = "<div>" +
                    '<p>Hi,</p>' +
                    '<p>A business cycle memo section has been updated in SharePoint and is awaiting your approval. Please click ' +
                    '<a target="_blank" href="' + window.APP_PAGE_LOCATION_URL + '#/approve-section/' + section.Id + '">here</a>' +
                    ' to review and approve.</p>' +
                    '<p>Best, <br/><br/>' +
                    (window.currentSPUser.Title + ', BCM Writer<br/>') +


                    '</p>' +
                    "</div>";

                return new Promise(function (resolve, reject) {
                    sendEmail(email).then(function (res) {
                        resolve(res);
                    });
                });

            }


            function sendRejectedEmail(section) {
                var email = angular.copy(emailSettings);
                email.properties.To.results = [section.Assignee.EMail];
                email.properties.From = window.currentSPUser.Email;
                email.properties.Subject = "Reject Section";
                email.properties.Body = "<div>" +
                    '<p>Hi,</p>' +
                    '<p>A business cycle memo section requires edits in SharePoint. Please click ' +
                    '<a target="_blank" href="' + window.APP_PAGE_LOCATION_URL + '#/update-section/' + section.BCMID + '">here</a>' +
                    ' to edit/update and re-submit.</p>' +
                    '<p>Best, <br/><br/>' +
                    (window.currentSPUser.Title + ', BCMs<br/>') +


                    '</p>' +
                    "</div>";

                return new Promise(function (resolve, reject) {
                    sendEmail(email).then(function (res) {
                        resolve(res);
                    });
                });

            }

            function sendCombineEmail(sections) {
                var email = angular.copy(emailSettings);
                email.properties.To.results = [window.currentSPUser.Email];
                email.properties.From = window.currentSPUser.Email;
                email.properties.Subject = "Combined Sections";
                email.properties.Body = "<div>" +
                    '<p>Hi,</p>' +
                    '<p>A business cycle memo section has been updated in SharePoint and is awaiting your approval. Please click ' +
                    '<a target="_blank" href="' + window.APP_PAGE_LOCATION_URL + '#/final-approve-sections/' + sections[0].BCMID + '">here</a>' +
                    ' to review and approve.</p>' +
                    '<p>Best, <br/><br/>' +
                    (window.currentSPUser.Title + ', BCM<br/>') +


                    '</p>' +
                    "</div>";

                return new Promise(function (resolve, reject) {
                    sendEmail(email).then(function (res) {
                        resolve(res);
                    });
                });

            }

            function sendReviewerEmail(sections) {
                var email = angular.copy(emailSettings);
                email.properties.To.results = [window.currentSPUser.Email];
                email.properties.From = window.currentSPUser.Email;
                email.properties.Subject = "Final Approved Sections";
                email.properties.Body = "<div>" +
                    '<p>Hi,</p>' +
                    '<p>A business cycle memo section has been updated in SharePoint and is awaiting your approval. Please click ' +
                    '<a target="_blank" href="' + window.APP_PAGE_LOCATION_URL + '#/publish-sections/' + sections[0].BCMID + '">here</a>' +
                    ' to review and approve.</p>' +
                    '<p>Best, <br/><br/>' +
                    (window.currentSPUser.Title + ', BCM<br/>') +


                    '</p>' +
                    "</div>";

                return new Promise(function (resolve, reject) {
                    sendEmail(email).then(function (res) {
                        resolve(res);
                    });
                });

            }

            function sendFinalReviewerRejectEmail(sections) {
                var email = angular.copy(emailSettings);
                email.properties.To.results = [window.currentSPUser.Email];
                email.properties.From = window.currentSPUser.Email;
                email.properties.Subject = "Final Reviewer Reject Sections";
                email.properties.Body = "<div>" +
                    '<p>Hi,</p>' +
                    '<p>A business cycle memo section requires edits in SharePoint. Please click ' +
                    '<a target="_blank" href="' + window.APP_PAGE_LOCATION_URL + '#/combine-sections/' + sections[0].BCMID + '">here</a>' +
                    ' to edit/update and re-submit</p>' +
                    '<p>Best, <br/><br/>' +
                    (window.currentSPUser.Title + ', Associate Director<br/>') +


                    '</p>' +
                    "</div>";

                return new Promise(function (resolve, reject) {
                    sendEmail(email).then(function (res) {
                        resolve(res);
                    });
                });

            }

            function sendEmail(data) {
                return new Promise(function (resolve, reject) {
                    getFormDigestValue().then(function (formDigestValue) {
                        $http({
                            url: window["SITE_LOCATION_URL"] +
                                '/_api/SP.Utilities.Utility.SendEmail',
                            method: 'POST',
                            headers: {
                                "accept": "application/json;odata=verbose",
                                "content-type": "application/json;odata=verbose",
                                "X-RequestDigest": formDigestValue
                            },
                            data: data
                        }).then(function (res) {
                            resolve(res.data.d);
                        }, error => reject(error));
                    });
                });
            }

            function getFormDigestValue() {
                return new Promise(function (resolve, reject) {
                    $http({
                        url: window["SITE_LOCATION_URL"] + '/_api/contextinfo',
                        method: 'POST',
                        headers: {
                            "accept": "application/json;odata=verbose",
                            "contentType": "text/xml"
                        },
                    }).then(function (res) {
                        resolve(res.data.d.GetContextWebInformation.FormDigestValue);
                    }, error => reject(error));
                });
            }

        });
})();