/***
GLobal Directives
***/

// Route State Load Spinner(used on page or content load)
MetronicApp.directive('ngSpinnerBar', ['$rootScope',
    function($rootScope) {
        return {
            link: function(scope, element, attrs) {
                // by defult hide the spinner bar
                element.addClass('hide'); // hide spinner bar by default

                // display the spinner bar whenever the route changes(the content part started loading)
                $rootScope.$on('$stateChangeStart', function() {
                    element.removeClass('hide'); // show spinner bar
                    Layout.closeMainMenu();
                });

                // hide the spinner bar on rounte change success(after the content loaded)
                $rootScope.$on('$stateChangeSuccess', function() {
                    element.addClass('hide'); // hide spinner bar
                    $('body').removeClass('page-on-load'); // remove page loading indicator
                    Layout.setMainMenuActiveLink('match'); // activate selected link in the sidebar menu

                    // auto scorll to page top
                    setTimeout(function () {
                        App.scrollTop(); // scroll to the top on content load
                    }, $rootScope.settings.layout.pageAutoScrollOnLoad);                    
                });

                // handle errors
                $rootScope.$on('$stateNotFound', function() {
                    element.addClass('hide'); // hide spinner bar
                });

                // handle errors
                $rootScope.$on('$stateChangeError', function() {
                    element.addClass('hide'); // hide spinner bar
                });
            }
        };
    }
])

// Handle global LINK click
MetronicApp.directive('a',
    function() {
        return {
            restrict: 'E',
            link: function(scope, elem, attrs) {
                if (attrs.ngClick || attrs.href === '' || attrs.href === '#') {
                    elem.on('click', function(e) {
                        e.preventDefault(); // prevent link click for above criteria
                    });
                }
            }
        };
    });

// Handle Dropdown Hover Plugin Integration
MetronicApp.directive('dropdownMenuHover', function () {
  return {
    link: function (scope, elem) {
      elem.dropdownHover();
    }
  };  
});

MetronicApp.directive('star', function () {
    return {
        restrict: 'AE',
        replace: true,
        templateUrl: 'src/tpl/star.html',
        scope: {
            current: '=',
            max: '=',
            clickCb: '&'
        },
        controller: ['$scope',function ($scope) {
            console.log($scope.current)
            console.log($scope.max)
            $scope.minusStarVal = function (index) {
                $scope.current = index + 1;
                $scope.clickCb({
                    data: $scope.current
                });
            };
            $scope.range = function(n) {
                return new Array(n);
            };
            $scope.addStarVal = function(index){
                $scope.current += index + 1;
                $scope.clickCb({
                    data: $scope.current
                });
            };
        }]
    }
});

MetronicApp.directive('scrollUp', function () {
    return {
        scope: {
            scrollUp: '&',
            upperVal: '='
        },
        link: function (scope, elem) {
            var lastOffsetTop = 0;
            var upperVal = scope.upperVal || 100;
            $(elem).on('scroll', (function(){
                var lastTime = +new Date();
                return function(e){
                    var now = +new Date();
                    if(now - lastTime > 200) {
                        lastTime = now;
                        var currentScrollTop = $(elem).scrollTop();
                        if(currentScrollTop < lastOffsetTop) {
                            //向上滚动
                            if(currentScrollTop < upperVal) {
                                scope.scrollUp();
                            }
                        }
                    }
                    lastOffsetTop = $(this).scrollTop();
                }
            })())
        }
    };
});