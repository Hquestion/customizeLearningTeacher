/***
Metronic AngularJS App Main Script
***/

/* Metronic App */
var MetronicApp = angular.module("MetronicApp", [
    "ui.router", 
    "ui.bootstrap", 
    "oc.lazyLoad",  
    "ngSanitize",
    "ngCookies",
    'ng-sweet-alert',
    'frapontillo.bootstrap-switch'
]); 

/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
MetronicApp.config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
        // global configs go here
    });
}]);

/********************************************
 BEGIN: BREAKING CHANGE in AngularJS v1.3.x:
*********************************************/
/**
`$controller` will no longer look for controllers on `window`.
The old behavior of looking on `window` for controllers was originally intended
for use in examples, demos, and toy apps. We found that allowing global controller
functions encouraged poor practices, so we resolved to disable this behavior by
default.

To migrate, register your controllers with modules rather than exposing them
as globals:

Before:

```javascript
function MyController() {
  // ...
}
```

After:

```javascript
angular.module('myApp', []).controller('MyController', [function() {
  // ...
}]);

Although it's not recommended, you can re-enable the old behavior like this:

```javascript
angular.module('myModule').config(['$controllerProvider', function($controllerProvider) {
  // this option might be handy for migrating old apps, but please don't use it
  // in new ones!
  $controllerProvider.allowGlobals();
}]);
**/

//AngularJS v1.3.x workaround for old style controller declarition in HTML
MetronicApp.config(['$controllerProvider', function($controllerProvider) {
  // this option might be handy for migrating old apps, but please don't use it
  // in new ones!
  $controllerProvider.allowGlobals();
}]);

/********************************************
 END: BREAKING CHANGE in AngularJS v1.3.x:
*********************************************/

/* Setup global settings */
MetronicApp.factory('settings', ['$rootScope', function($rootScope) {
    // supported languages
    var settings = {
        layout: {
            pageSidebarClosed: false, // sidebar menu state
            pageContentWhite: true, // set page content layout
            pageBodySolid: false, // solid body color state
            pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
        },
        assetsPath: 'assets',
        globalPath: 'assets/global',
        layoutPath: 'assets/layouts/layout3',
    };

    $rootScope.settings = settings;

    return settings;
}]);

/* Setup App Main Controller */
MetronicApp.controller('AppController', ['$scope', '$rootScope', function($scope, $rootScope) {
    $scope.$on('$viewContentLoaded', function() {
        App.initComponents(); // init core components
        //Layout.init(); //  Init entire layout(header, footer, sidebar, etc) on page load if the partials included in server side instead of loading with ng-include directive 
    });
}]);

/***
Layout Partials.
By default the partials are loaded through AngularJS ng-include directive. In case they loaded in server side(e.g: PHP include function) then below partial 
initialization can be disabled and Layout.init() should be called on page load complete as explained above.
***/

/* Setup Layout Part - Header */
MetronicApp.controller('HeaderController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initHeader(); // init header
    });
}]);

/* Setup Layout Part - Footer */
MetronicApp.controller('FooterController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initFooter(); // init footer
    });
}]);

/* Setup Rounting For All Pages */
MetronicApp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    // Redirect any unmatched url
    $urlRouterProvider.otherwise("/study-center.html");
    
    $stateProvider

        // Dashboard
        .state('dashboard', {
            url: "/dashboard.html",
            templateUrl: "src/views/dashboard.html",
            data: {pageTitle: 'Admin Dashboard Template'},
            controller: "DashboardController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/morris/morris.css',
                            'assets/global/plugins/morris/morris.min.js',
                            'assets/global/plugins/morris/raphael-min.js',
                            'assets/global/plugins/jquery.sparkline.min.js',

                            'assets/pages/scripts/dashboard.min.js',
                            'src/js/controllers/DashboardController.js',
                        ] 
                    });
                }]
            }
        })

        // AngularJS plugins
        .state('fileupload', {
            url: "/file_upload.html",
            templateUrl: "src/views/file_upload.html",
            data: {pageTitle: 'AngularJS File Upload'},
            controller: "GeneralPageController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'angularFileUpload',
                        files: [
                            'assets/global/plugins/angularjs/plugins/angular-file-upload/angular-file-upload.min.js',
                        ] 
                    }, {
                        name: 'MetronicApp',
                        files: [
                            'src/js/controllers/GeneralPageController.js'
                        ]
                    }]);
                }]
            }
        })

        // UI Select
        .state('uiselect', {
            url: "/ui_select.html",
            templateUrl: "src/views/ui_select.html",
            data: {pageTitle: 'AngularJS Ui Select'},
            controller: "UISelectController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'ui.select',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/angularjs/plugins/ui-select/select.min.css',
                            'assets/global/plugins/angularjs/plugins/ui-select/select.min.js'
                        ] 
                    }, {
                        name: 'MetronicApp',
                        files: [
                            'src/js/controllers/UISelectController.js'
                        ] 
                    }]);
                }]
            }
        })

        // UI Bootstrap
        .state('uibootstrap', {
            url: "/ui_bootstrap.html",
            templateUrl: "src/views/ui_bootstrap.html",
            data: {pageTitle: 'AngularJS UI Bootstrap'},
            controller: "GeneralPageController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            'src/js/controllers/GeneralPageController.js'
                        ] 
                    }]);
                }] 
            }
        })

        // Tree View
        .state('tree', {
            url: "/tree",
            templateUrl: "src/views/tree.html",
            data: {pageTitle: 'jQuery Tree View'},
            controller: "GeneralPageController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/jstree/dist/themes/default/style.min.css',

                            'assets/global/plugins/jstree/dist/jstree.min.js',
                            'assets/pages/scripts/ui-tree.min.js',
                            'src/js/controllers/GeneralPageController.js'
                        ] 
                    }]);
                }] 
            }
        })     

        // Form Tools
        .state('formtools', {
            url: "/form-tools",
            templateUrl: "src/views/form_tools.html",
            data: {pageTitle: 'Form Tools'},
            controller: "GeneralPageController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                            'assets/global/plugins/bootstrap-switch/css/bootstrap-switch.min.css',
                            // 'assets/global/plugins/bootstrap-markdown/css/bootstrap-markdown.min.css',
                            'assets/global/plugins/typeahead/typeahead.css',

                            'assets/global/plugins/fuelux/js/spinner.min.js',
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                            'assets/global/plugins/jquery-inputmask/jquery.inputmask.bundle.min.js',
                            'assets/global/plugins/jquery.input-ip-address-control-1.0.min.js',
                            'assets/global/plugins/bootstrap-pwstrength/pwstrength-bootstrap.min.js',
                            'assets/global/plugins/bootstrap-switch/js/bootstrap-switch.min.js',
                            'assets/global/plugins/bootstrap-maxlength/bootstrap-maxlength.min.js',
                            'assets/global/plugins/bootstrap-touchspin/bootstrap.touchspin.js',
                            'assets/global/plugins/typeahead/handlebars.min.js',
                            'assets/global/plugins/typeahead/typeahead.bundle.min.js',
                            'assets/pages/scripts/components-form-tools-2.min.js',

                            'src/js/controllers/GeneralPageController.js'
                        ] 
                    }]);
                }] 
            }
        })        

        // Date & Time Pickers
        .state('pickers', {
            url: "/pickers",
            templateUrl: "src/views/pickers.html",
            data: {pageTitle: 'Date & Time Pickers'},
            controller: "GeneralPageController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/clockface/css/clockface.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-colorpicker/css/colorpicker.css',
                            'assets/global/plugins/bootstrap-daterangepicker/daterangepicker-bs3.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',

                            'assets/global/plugins/bootstrap-datepicker/src/js/bootstrap-datepicker.min.js',
                            'assets/global/plugins/bootstrap-timepicker/src/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/clockface/src/js/clockface.js',
                            'assets/global/plugins/moment.min.js',
                            'assets/global/plugins/bootstrap-daterangepicker/daterangepicker.js',
                            'assets/global/plugins/bootstrap-colorpicker/src/js/bootstrap-colorpicker.js',
                            'assets/global/plugins/bootstrap-datetimepicker/src/js/bootstrap-datetimepicker.min.js',

                            'assets/pages/scripts/components-date-time-pickers.min.js',

                            'src/js/controllers/GeneralPageController.js'
                        ] 
                    }]);
                }] 
            }
        })

        // Custom Dropdowns
        .state('dropdowns', {
            url: "/dropdowns",
            templateUrl: "src/views/dropdowns.html",
            data: {pageTitle: 'Custom Dropdowns'},
            controller: "GeneralPageController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',

                            'assets/global/plugins/bootstrap-select/src/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/src/js/select2.full.min.js',

                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',

                            'src/js/controllers/GeneralPageController.js'
                        ] 
                    }]);
                }] 
            }
        }) 

        // Advanced Datatables
        .state('datatablesAdvanced', {
            url: "/datatables/managed.html",
            templateUrl: "src/views/datatables/managed.html",
            data: {pageTitle: 'Advanced Datatables'},
            controller: "GeneralPageController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [                             
                            'assets/global/plugins/datatables/datatables.min.css', 
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',

                            'assets/global/plugins/datatables/datatables.all.min.js',

                            'assets/pages/scripts/table-datatables-managed.min.js',

                            'src/js/controllers/GeneralPageController.js'
                        ]
                    });
                }]
            }
        })

        // Ajax Datetables
        .state('datatablesAjax', {
            url: "/datatables/ajax.html",
            templateUrl: "src/views/datatables/ajax.html",
            data: {pageTitle: 'Ajax Datatables'},
            controller: "GeneralPageController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/datatables/datatables.min.css', 
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',

                            'assets/global/plugins/datatables/datatables.all.min.js',
                            'assets/global/plugins/bootstrap-datepicker/src/js/bootstrap-datepicker.min.js',
                            'assets/global/scripts/datatable.min.js',

                            'src/js/scripts/table-ajax.js',
                            'src/js/controllers/GeneralPageController.js'
                        ]
                    });
                }]
            }
        })

        // User Profile
        .state("profile", {
            url: "/profile",
            templateUrl: "src/views/profile/main.html",
            data: {pageTitle: 'User Profile'},
            controller: "UserProfileController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',  
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                            'assets/pages/css/profile.css',
                            
                            'assets/global/plugins/jquery.sparkline.min.js',
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',

                            'assets/pages/scripts/profile.min.js',

                            'src/js/controllers/UserProfileController.js'
                        ]                    
                    });
                }]
            }
        })

        // User Profile Dashboard
        .state("profile.dashboard", {
            url: "/dashboard",
            templateUrl: "src/views/profile/dashboard.html",
            data: {pageTitle: 'User Profile'}
        })

        // User Profile Account
        .state("profile.account", {
            url: "/account",
            templateUrl: "src/views/profile/account.html",
            data: {pageTitle: 'User Account'}
        })

        // User Profile Help
        .state("profile.help", {
            url: "/help",
            templateUrl: "src/views/profile/help.html",
            data: {pageTitle: 'User Help'}      
        })

        // Todo
        .state('todo', {
            url: "/todo",
            templateUrl: "src/views/todo.html",
            data: {pageTitle: 'Todo'},
            controller: "TodoController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({ 
                        name: 'MetronicApp',  
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/apps/css/todo-2.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',

                            'assets/global/plugins/select2/src/js/select2.full.min.js',
                            
                            'assets/global/plugins/bootstrap-datepicker/src/js/bootstrap-datepicker.min.js',

                            'assets/apps/scripts/todo-2.min.js',

                            'src/js/controllers/TodoController.js'  
                        ]                    
                    });
                }]
            }
        })
        .state('setting', {
            url: "/setting.html",
            templateUrl: "src/views/setting.html",
            data: {pageTitle: '系统设置'},
            controller: "SettingController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/apps/css/todo-2.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/apps/css/setting.css',

                            'assets/global/plugins/select2/js/select2.full.min.js',

                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',

                            'src/js/controllers/SettingController.js'
                        ]
                    });
                }]
            }
        })
        .state('study-center', {
            url: "/study-center.html",
            templateUrl: "src/views/study-center/index.html",
            data: {pageTitle: '学习中心'},
            controller: "StudyCenterController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/apps/css/todo-2.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',

                            'assets/global/plugins/select2/js/select2.full.min.js',

                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',

                            'src/js/controllers/StudyCenterController.js'
                        ]
                    });
                }]
            }
        })
        .state('course-manage', {
            url: "/course-manage.html",
            templateUrl: "src/views/course-manage/course-manage.html",
            data: {pageTitle: '课程管理'},
            controller: "CourseController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-switch/css/bootstrap-switch.min.css',
                            'assets/apps/css/angular.datepicker.css',
                            'assets/global/plugins/ckeditor/ckeditor.js',
                            'assets/apps/css/course-manage.css',
                            'assets/global/plugins/bootstrap-switch/js/bootstrap-switch.min.js',
                            'assets/apps/scripts/angular.datepicker.min.js',
                            'src/js/controllers/CourseController.js'
                        ]
                    });
                }]
            }
        })
}]);

/* Init global settings and run the app */
MetronicApp.run(["$rootScope", "settings", "$state", "$cookieStore", "$cookies", function($rootScope, settings, $state, $cookieStore, $cookies) {
    $rootScope.$state = $state; // state to be accessed from view
    $rootScope.$settings = settings; // state to be accessed from view
    if(!$cookies.get('userId')) {
        window.location.href = 'login.html';
    } else {
        $rootScope.userInfo = JSON.parse(localStorage.getItem('userInfo'));
    }
}]);