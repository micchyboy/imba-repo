var resolve = {
    delay: function ($q, $timeout) {
        console.log("delay");
        var delay = $q.defer();
        $timeout(delay.resolve, 0, false);
        return delay.promise;
    }
};

angular.module("sportsStore", ["customFilters", "ngRoute", "ngAnimate", "angularFileUpload"])
    .config(function ($routeProvider) {
        $routeProvider.when("/:username", {
            templateUrl: "/views/productList.html",
            resolve: resolve
        });
        /*$routeProvider.when("/details", {
         templateUrl: "/views/productDetails.html"
         });*/
        $routeProvider.when("/:username/editor", {
            templateUrl: "/views/editorView.html",
            resolve: resolve
        });
        $routeProvider.when("/:username/create", {
            templateUrl: "/views/editorView.html",
            resolve: resolve
        });
        /*$routeProvider.when("/home", {
            templateUrl: "/views/homePage.html",
            resolve: resolve
        });*/
        /*$routeProvider.otherwise({
            redirectTo: "/productss/:username"
        });*/
    })
    .run(function ($templateCache, $http) {
        $http.get('/views/adminLogin.html', {cache: $templateCache});
    })
//    .constant("dataUrl", "http://localhost:3000/jethro/products")
    .constant("authUrl", "http://localhost:3000/api/login")
    .constant("logOutUrl", "http://localhost:3000/api/logout")
    .constant("signUpUrl", "http://localhost:3000/api/signup")
    .constant("createUrl", "http://localhost:3000/api/create")
    .constant("deleteUrl", "http://localhost:3000/api/delete")
    .constant("deleteImageUrl", "http://localhost:3000/api/delete_image")
    .constant("updateUrl", "http://localhost:3000/api/update")
    .constant("uploadUrl", "http://localhost:3000/api/upload")
    .constant("primaryImageUrl", "http://localhost:3000/api/primary_image")
    /*.constant("dataUrl", "http://imba-app.herokuapp.com/jethro/products")
     .constant("authUrl", "http://imba-app.herokuapp.com/login")
     .constant("logOutUrl", "http://imba-app.herokuapp.com/logout")
     .constant("signUpUrl", "http://imba-app.herokuapp.com/signup")
     .constant("createUrl", "http://imba-app.herokuapp.com/create")
     .constant("deleteUrl", "http://imba-app.herokuapp.com/delete")
     .constant("deleteImageUrl", "http://imba-app.herokuapp.com/delete_image")
     .constant("updateUrl", "http://imba-app.herokuapp.com/update")
     .constant("uploadUrl", "http://imba-app.herokuapp.com/upload")
     .constant("ordersUrl", "http://imba-app.herokuapp.com/orders")
     .constant("primaryImageUrl", "http://imba-app.herokuapp.com/primary_image")*/
    .config(function ($locationProvider) {
        if (window.history && history.pushState) {
            $locationProvider.html5Mode(true);
        }
    })
    .controller("sportsStoreCtrl", function ($scope, $http, $location, $anchorScroll, urls,
                                             $timeout, anchorSmoothScroll, authService, $routeParams, $route) {
        $scope.data = {
        };
        $scope.util = {};
        $scope.util.currentProduct = {};

        $scope.util.mode = 'product';

        $scope.util.sortBy = [
            {criteria: "Time+", value: "-updatedAt"},
            {criteria: "Time-", value: "updatedAt"},
            {criteria: "Price+", value: "price"},
            {criteria: "Price-", value: "-price"}
        ];
        $scope.util.sortBy.default = "-updatedAt";

        /*$scope.$on("$routeChangeSuccess", function () {
         console.log("Route change success! Main");
         var isAuthenticated = authService.getData("isAuthenticated");
         console.log("Is authenticated? " + (isAuthenticated))
         if (!isAuthenticated) {
         console.log("Redirect to login page..")
         $location.path("/home");
         }
         else {
         $scope.data.user = authService.getData("user");
         }
         });*/
        $scope.getProducts = function () {
            $http.get(urls.getDataUrl($routeParams["username"]))
                .success(function (data) {
                    console.log(data.products);
                    $scope.data.products = data.products;
                })
                .error(function (error) {
                    $scope.data.error = error;
                });
        }

        $scope.$on("$routeChangeSuccess", function () {
//            alert("Username is: " + $routeParams["username"]);
            var isAuthenticated = authService.getData("isAuthenticated");
            console.log("Is authenticated? " + (isAuthenticated))
            if (isAuthenticated) {
                $scope.data.user = authService.getData("user");
            }

            $scope.getProducts();
        })


        $scope.logout = function () {
            console.log("Logging out..")
            authService.logOut().then(function (data) {
                authService.removeData("user");
                authService.removeData("isAuthenticated");

                console.log(data);

                $(".logout-success").slideDown();
                $timeout(function () {
                    $(".logout-success").slideUp();
                }, 3000);

                $scope.redirectPage("");
            }, function (error) {
                console.log("Error logging out..");
                $scope.authenticationError = error;
            });
        }


        $scope.redirectPage = function (path) {
//            $scope.util.currentProduct = {};
            $location.path("/" + $scope.data.user.username  + path);
        }

        $scope.reload = function () {
            $route.reload();
        }

        $scope.gotoElement = function (eID) {
            // set the location.hash to the id of
            // the element you wish to scroll to.
            $location.hash('details');

            // call $anchorScroll()
            anchorSmoothScroll.scrollTo(eID);

        };

        $scope.isAuthenticated = function () {
            if (authService.getData("isAuthenticated") == true) {
                return true;
            }
            return false;
        };

        $scope.isUserOwned = function(){
            if (authService.getData("isAuthenticated") == true) {
                return $routeParams["username"] ? $routeParams["username"] == $scope.data.user.username : false;
            }
            return false;
        }

        $scope.isProduct = function () {
            var mode = $scope.util.mode;
            if (mode == "product") {
                return true
            }
            return false;
        }

        $scope.convertToActualSize = function (thumbnail) {
            var thumbPath = "/images/thumbnails";
            return thumbnail.replace(thumbPath, "/images/actual-size");
        }

        $scope.convertToGallerySize = function (thumbnail) {
            var thumbPath = "/images/thumbnails";
            return thumbnail.replace(thumbPath, "/images/gallery");
        }

        $scope.convertToThumbnailSize = function (gallery) {
            var galleryPath = "/images/gallery";
            return gallery.replace(galleryPath, "/images/thumbnails");
        }


        //for sliding content
        var oldLocation = '';
        $scope.$on('$routeChangeStart', function (angularEvent, next) {
            console.log("routeChangeStart");
            var isDownwards = true;
            if (next && next.$$route) {
                var newLocation = next.$$route.originalPath;
                if (oldLocation !== newLocation && oldLocation.indexOf(newLocation) !== -1) {
                    isDownwards = false;
                }

                oldLocation = newLocation;
            }

            $scope.isDownwards = isDownwards;
        });
        //end of sliding content
    })

    .filter("daysBetween", function () {
        return function (value) {
            var date;
            if (angular.isString(value)) {
                date = new Date(value);
            }

            //Get 1 day in milliseconds
            var one_day = 1000 * 60 * 60 * 24;
            //Get 1 hour in millis
            var one_hour = 1000 * 60 * 60;
            //Get 1 minute in millis
            var one_min = 1000 * 60;
            //Get 1 second in millis
            var one_sec = 1000;
            // Convert both dates to milliseconds
            var date1_ms = date.getTime();
            var date2_ms = new Date().getTime();

            // Calculate the difference in milliseconds
            var difference_ms = date2_ms - date1_ms;

            var difference_secs = Math.round(difference_ms / one_sec);
            var difference_mins = Math.round(difference_ms / one_min);
            var difference_hours = Math.round(difference_ms / one_hour);
            var difference_days = Math.round(difference_ms / one_day);
            // Convert back to days and return
            var desc = "";
            if (difference_days < 0) {
                return "Added now";
            }
            else if (difference_days == 0) {
                if (difference_hours == 0) {
                    if (difference_mins == 0) {
                        return "Added now"
                    }
                    var minutesStr = difference_mins == 1 ? "Added 1 minute ago" : "Added " + difference_mins + " minutes ago";
                    return minutesStr;
                }
                var hoursStr = difference_hours == 1 ? "Added 1 hour ago" : "Added " + difference_hours + " hours ago";
                return hoursStr;
            }
            else if (difference_days == 1) {
                return "Added 1 day ago"
            }
            else {
                return "Added " + difference_days + " days ago";
            }
        };
    })
    .directive("credentialsForm", function ($compile, $templateCache) {
//        alert("Entered simple repeater directive..");
        return {
            restrict: "EA",
            link: function (scope, elem, attrs) {
                elem.on("click", function (e) {

                    if (e.target.textContent.trim() == "Log In") {
                        scope.showSignUpForm = false;
                    }
                    else if (e.target.textContent.trim() == "Sign Up") {
                        scope.showSignUpForm = true;
                    }
                    else {
                        return;
                    }

                    var content = $templateCache.get("/views/adminLogin.html");
                    var listElem = angular.element(content[1]);
                    var compileFn = $compile(listElem);
                    compileFn(scope);

                    $('#myModal').modal();
                    $('#myModal').on('shown.bs.modal', function () {
                        $('#myModal .modal-body').html(listElem);
                    });
                    $('#myModal').on('hidden.bs.modal', function () {
                        $('#myModal').off('shown.bs.modal');
                        $('#myModal .modal-body').html('');
                    });
                    scope.$on("authSuccess", function () {
                        $('#myModal').modal('hide');
                    });

                });


            }
        }
    })
    .directive("ngScopeElement", function () {
        var directiveDefinitionObject = {

            restrict: "A",

            compile: function compile(tElement, tAttrs, transclude) {
                return {
                    pre: function preLink(scope, iElement, iAttrs, controller) {
                        scope[iAttrs.ngScopeElement] = iElement;
                    }
                };
            }
        };

        return directiveDefinitionObject;
    })
    .directive("tooltips", function () {

        return {
            scope: {
                tooltips: "@"
            },
            link: function ($scope, $elem, $attrs) {
                $elem.attr("data-toggle", "tooltip");
                $elem.attr("data-original-title", $scope.tooltips);
                $elem.addClass("tool");
                $($elem[0]).tooltip({
                    placement : 'bottom',
                    trigger: 'manual'
                });
                $attrs.$observe('showtip', function() {
                    var showTip = $scope.$eval($attrs["showtip"]);
                    if(showTip) {
                        $($elem[0]).tooltip('show');
                    }
                    else{
                        $($elem[0]).tooltip('hide');
                    }
                });




            }
        }
    });