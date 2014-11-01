angular.module("sportsStore")
    .controller("validationCtrl", function($scope){
        $scope.getError = function () {
            for (var i = 0; i < $scope.validation.length; i++) {
                if ($scope.validation[i].error) {
                    return $scope.validation[i].priority;
                }
            }
            return false;
        }
    })
    .directive("editorValidation", function () {
        return {
            restrict: "EA",
            scope: true,
            controller: "validationCtrl",
            link: function ($scope, $elem, $attrs) {
                $scope.$watch("detailsForm.$error", function () {
//                    if(value !== oldValue) {
                    $scope.validation = [
                        {priority: 1, error: $scope.detailsForm.$error.required },
                        {priority: 2, error: $scope.detailsForm.$error.pattern },
                        {priority: 3, error: $scope.detailsForm.$error.hasImage },
                        {priority: 4, error: $scope.detailsForm.$error.primaryImage }
                    ]
                    var priority = $scope.getError();

                    if (priority == 1) {
                        $elem.addClass("alert-danger");
                        $elem.html("Please enter required details")
                    }
                    else if (priority == 2) {
                        $elem.addClass("alert-danger");
                        $elem.html("Whole numbers or decimals only")
                    }
                    else if (priority == 3) {
                        $elem.addClass("alert-danger");
                        $elem.html("Please select at least one image")
                    }
                    else if (priority == 4) {
                        $elem.addClass("alert-danger");
                        $elem.html("Please select a primary image")
                    }
                    else {
                        $elem.removeClass("alert-danger");
                        $elem.addClass("alert-info");
                        $elem.html("You may save/update anytime")
                    }
//                    }
                }, true)
            }
        }
    })
    /*.directive("authenticationValidation", function () {
        return {
            restrict: "EA",
            link: function ($scope, $elem, $attrs) {
                $scope.$watch("authForm.$error", function () {
//                    if(value !== oldValue) {
                    var error = $scope.authForm.$error.pattern;

                    if (error) {
                        $elem.addClass("alert-danger");
                        $elem.html("Username must be alphanumeric characters only")
                    }

                    else {
                        $elem.removeClass("alert-danger");
                        $elem.addClass("alert-info");
                        $elem.html("Enter your username and password and click Log In to authenticate")
                    }
//                    }
                }, true)
            }

        }
    })*/
    .directive("signupValidation", function () {
        return {
            restrict: "EA",
            scope: true,
            controller: "validationCtrl",
            link: function ($scope, $elem, $attrs) {

                $scope.$watch("signForm.$error", function () {
                    $scope.validation = [
                        {priority: 1, error: $scope.signForm.$error.pattern },
                        {priority: 2, error: $scope.signForm.$error.required },
                        {priority: 3, error: $scope.signForm.$error.email }
                    ];
//                    if(value !== oldValue) {
                    var priority = $scope.getError();

                    if (priority == 1) {
                        $elem.addClass("alert-danger");
                        $elem.html("Username must be alphanumeric characters only");
                    }
                    else if (priority == 2) {
                        $elem.addClass("alert-danger");
                        $elem.html("Please fill up required fields");
                    }
                    else if (priority == 3) {
                        $elem.addClass("alert-danger");
                        $elem.html("Please enter correct email format");
                    }
                    else {
                        $elem.removeClass("alert-danger");
                        $elem.addClass("alert-info");
                        $elem.html('Click "Sign Up" button to create your account');
                    }
//                    }
                }, true)
            }

        }
    })