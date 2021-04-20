var CONSTANT = {
    KICK_OFF_EMAIL: "ACTION REQUIRED: Live Failover Testing Requirements",
    REMINDER_START_PROCESS: "Reminder: Failover Exercise Requirement Due/Not Completed",
    DELAY_REMINDER_START_PROCESS: "Delay Reminder: Failover Exercise Requirement Due/Not Completed",
    INCORRECT_APP: "Failover Exercise Notification – Incorrect Application Ownership",
    MARK_APPROVED_REMINDER: "Mark Approved Reminder: Failover Exercise Requirement Due/Not Completed",
    DELAY_MARK_APPROVED_REMINDER: "Delay Mark Approved Reminder: Failover Exercise Requirement Due/Not Completed",
    DRAFT_REJECT: "Draft Failover Exercise Requirements Rejected",
    DRAFT_REQUIRES_APPROVAL: "Draft Failover Test Plan Requires Approval",
    DRAFT_REMINDER_APPROVAL_PAST_DUE: "Reminder: Failover Test Plan Approval Past Due",
    DRAFT_DELAY_REMINDER_APPROVAL_PAST_DUE: "Delay Reminder: Failover Test Plan Approval Past Due",
    DRAFT_REQUIREMENTS_COMPLETE: "Failover Exercise Requirements Complete",
    DRAFT_REQUIREMENTS_DUE: "Failover Exercise Requirements Due",
    DRAFT_REQUIREMENTS_DUE_NOT_COMPLETED: "Failover Exercise Requirements Due/Not Completed",
    TEST_REJECT: "Test Failover Exercise Requirements Rejected",
    TEST_REQUIRES_APPROVAL: "Test Failover Results Require Approval",
    TEST_REMINDER_APPROVAL_PAST_DUE: "Reminder: Failover Results Approval Past Due",
    TEST_DELAY_REMINDER_APPROVAL_PAST_DUE: "Delay Reminder: Failover Results Approval Past Due",
    TEST_COMPLETE: "Test Failover Exercise Requirements Complete",
    PROCESS_INFO: "Reminder: Failover Exercise",
    PROCESS_INFO_DUE: "Process Info Reminder: Failover Exercise Requirement Due",
    PROCESS_INFO_PAST_DUE: "Process Info Reminder: Failover Exercise Requirement Past Due",

    KickoffEmailTemplates: ["KICK_OFF_EMAIL", "KICK_OFF_EMAIL_1"],
    EXERCISE_ITEMS: [{
        Title: "Identify any changes to Application ownership",
        SortOrder: 1,
        Owners: "Application Teams",
        Description: "Application Ownership / POC changes must be acknowledged and updated via the " +
            "<a href='" + window["APP_PAGE_LOCATION_URL"] + "#/owners-dashboard'>Failover Exercise Portal</a>.",

    },{
        Title: "Identify and submit " + new Date().getFullYear() + " Failover Exercise date",
        SortOrder: 2,
        Owners: "Application Teams",
        Description: "Test dates must be identified and submitted via the " +
            "<a href='" + window["APP_PAGE_LOCATION_URL"] + "#/owners-dashboard'>Failover Exercise Portal</a>.",

    },{
        Title: "Application Failover Test Plan and Timeline - DRAFT",
        SortOrder: 3,
        Owners: "Application Teams",
        Description: "<p>Upload the first draft of the Failover Exercise Test Plan via the " +
            "<a href='" + window["APP_PAGE_LOCATION_URL"] + "'>Failover Portal</a>.</p>" +
            "<p>EDR Team will review and reject/provide feedback or Approve via the Portal.</p>" +
            "<p>1st Time Failover Testing: Application Failover Test Plan and Results Template is located on " +
            "<a href='https://collab-sm.corp.cvscaremark.com/sites/DisasterRecovery/Exercises/SitePages/Home.aspx?RootFolder=%2Fsites%2FDisasterRecovery%2FExercises%2FShared%20Documents%2FExercises%2F2021%20EDR%20Exercises%2FFailover&FolderCTID=0x0120008ED08C2B756CCF4496D4F6DDF22E6A21&View=%7B2122DA51%2D3F10%2D43CF%2DAC61%2DE90D82A513EF%7D'>Failover</a> section of the EDR SharePoint site.</p>" +
            "<p>Previous Failover Testing: Use last year’s Application Failover Test Plan and Results document and update it for " + new Date().getFullYear() + ".</p>" +
            "<p>Located here: <a target='_blank' href='https://collab-sm.corp.cvscaremark.com/sites/DisasterRecovery/Exercises/_layouts/15/start.aspx#/Shared%20Documents/Forms/AllItems.aspx?RootFolder=%2Fsites%2FDisasterRecovery%2FExercises%2FShared%20Documents%2FApplication%20Test%20Plans%2FFailover&FolderCTID=0x0120008ED08C2B756CCF4496D4F6DDF22E6A21&View=%7B5BC6DCA6%2D5BED%2D4FA6%2DBF69%2D9F4DEF9C28E5%7D'>Failover Test Plans</a>.</p>",
    },{
        Title: "Submit Request for Change (RFC)",
        SortOrder: 4,
        Owners: "Application Teams",
        Description: "Submit RFC for the Failover Exercise",
    },{
        Title: "Application Failover Test Plan and Timeline – FINAL Approval Process",
        SortOrder: 5,
        Owners: "Application Managers/Tech Owners and Directors/Sub Portfolio Owners",
        Description: "<p>Upon EDR Approval of the Failover Exercise Test Plan, Approve the Final Application Failover Exercise Test Plan via the " +
            "<a href='" + window["APP_PAGE_LOCATION_URL"] + "'>Failover Portal</a>.</p>" +
            "<p>The final test plan MUST include the RFC and timeline (IQ/OQ)</p>",
    },{
        Title: "Application Failover Results and Timeline - DRAFT",
        SortOrder: 6,
        Owners: "Application Teams",
        Description: "<p>Upload the first draft of the Failover Exercise Results via the " +
            "<a href='" + window["APP_PAGE_LOCATION_URL"] + "'>Failover Portal</a>.</p>" +
            "<p>EDR Team will review and reject/provide feedback or Approve via the Portal</p>",
    },{
        Title: "Application Failover Results and Timeline – FINAL Approval Process",
        SortOrder: 7,
        Owners: "Application Managers/Tech Owners and Directors/Sub Portfolio Owners",
        Description: "<p>Upon EDR Approval of the Failover Exercise Results, Approve the Final Application Failover Exercise Results via the " +
            "<a href='" + window["APP_PAGE_LOCATION_URL"] + "'>Failover Portal</a>.</p>",
    },{
        Title: "DR Plan Review in BCITC",
        SortOrder: 8,
        Owners: "Application Teams Infrastructure Teams",
        Description: "<p>Review DR Plans in BC in the Cloud to ensure it is still current; if nothing has changed, no action is required in BCITC.</p>",
    }]
};

angular.module('constants', [])
.constant('CONSTANT', CONSTANT)