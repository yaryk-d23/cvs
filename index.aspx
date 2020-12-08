<html>
 <head></head>
 <body>
 <div class="app-container" id="dr-process-automation" ng-app="App" ng-controller="AppCtrl as ctrl">
    <div ng-view></div>
 </div>
<script>
  window["SITE_LOCATION_URL"] = "https://chironitcom.sharepoint.com/sites/Demo/cvs/"; 
  window["APP_FOLDER"] = "https://chironitcom.sharepoint.com/sites/Demo/cvs/SiteAssets/DRProcessAutomationSolution/";   
  window["APP_PAGE_LOCATION_URL"] = "https://chironitcom.sharepoint.com/sites/Demo/cvs/SitePages/DRProcessAutomation.aspx"; 

  var modules = [
      //modules
      "modules/angular/angular.min.js",
      "modules/angular/angular-route.min.js",
      "modules/angular/angular-animate.min.js",
      "modules/angular/angular-sanitize.min.js",
      "modules/angular/angular-touch.min.js",
      "modules/pnp.js",
      "modules/jquery-1.12.4.min.js",
      "modules/bootstrap/js/bootstrap.min.js",
      "modules/bootstrap/js/ui-bootstrap-tpls-2.5.0.min.js",
      "modules/ui-select/select.js",
      
    ];
var scripts = [

      //app
      "app.js",
      "services/api.service.js",
      "services/email.service.js",
      "services/preloader.js",
      "services/fileSelect.js",
      <%-- components --%>
      "components/application-test-plan-dashboard/application-test-plan-dashboard.js",
      "components/test-application-process/test-application-process.js",
      "components/process-info/process-info.js",
      "components/draft-test-plan/draft-test-plan.js",
      "components/post-test-results/post-test-results.js",
      "components/timeline-modal/timeline-modal.js",
      <%-- common --%>
      "common/date-range/date-range.js",
    ];
  var styles = [
      "modules/bootstrap/css/bootstrap.min.css",
      "modules/ui-select/select.css",
      "style.css",
      "components/application-test-plan-dashboard/application-test-plan-dashboard.style.css",
      "common/date-range/date-range.style.css",
      "components/test-application-process/test-application-process.style.css",
      "components/process-info/process-info.style.css",
      "components/draft-test-plan/draft-test-plan.style.css",
      "components/post-test-results/post-test-results.style.css",
      "components/timeline-modal/timeline-modal.style.css",
    ];

  for (var i = 0; i < styles.length; i++) {
    document.write(
      '<link rel="stylesheet" type="text/css" href="' +
        window["APP_FOLDER"] +
        styles[i] +
        "?rnd=" +
        new Date().getTime() * new Date().getTime() +
        '">'
    );
  }

  for (var i = 0; i < modules.length; i++) {
    document.write(
      '<script language="javascript" type="text/javascript" src="' +
        window["APP_FOLDER"] +
        modules[i] +
        '"><\/script>'
    );
  }

  for (var i = 0; i < scripts.length; i++) {
    document.write(
      '<script language="javascript" type="text/javascript" src="' +
        window["APP_FOLDER"] +
        scripts[i] +
        "?rnd=" +
        new Date().getTime() * new Date().getTime() +
        '"><\/script>'
    );
  }
</script>
<body>
</html>
