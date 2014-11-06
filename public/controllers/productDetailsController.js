angular.module("sportsStore")
    .controller("productDetailsCtrl", function ($scope, $interval) {

        $scope.$on("$destroy", function () {
            if ($scope.photoInterval.interval) {
                $scope.photoInterval.end();
            }
        });
        $scope.$watch("util.currentProduct.thumbnailImages", function () {
            $scope.currentProductImages = $scope.util.currentProduct.thumbnailImages.slice();
            if ($scope.photoInterval.interval) {
                $scope.photoInterval.end();
            }
            if ($scope.currentProductImages.length > 1) {
                $scope.photoInterval.start();
            }

            if($scope.util.currentProduct.primaryImage) {
                $scope.currentImage = $scope.convertToGallerySize($scope.util.currentProduct.primaryImage);
            }
        });

//        $scope.currentProductImages = $scope.util.currentProduct.thumbnailImages;
//
//        $scope.currentImage = $scope.convertToGallerySize($scope.currentProductImages[0]);

        $scope.isCurrentImage = function (image) {
            return $scope.convertToGallerySize(image) == $scope.currentImage;
        }

        $scope.photoInterval = {
            start: function () {
                /*$scope.selectThumbnail = function (image) {
                 $scope.currentImage = $scope.convertToGallerySize(image);
                 }*/

                $scope.selectUp = function () {
                    shiftArrayLeft($scope.currentProductImages);

                }

                $scope.selectDown = function () {
                    shiftArrayRight($scope.currentProductImages);
                }


                var i = 0;
                $scope.photoInterval.interval = $interval(function () {
                    shiftArrayRight($scope.currentProductImages);
                    $scope.currentImage = $scope.convertToGallerySize($scope.currentProductImages[i]);

                }, 4000);
            },

            end: function () {
                $interval.cancel($scope.photoInterval.interval);
            }
        }


        function shiftArrayRight(arr) {
            var item = arr.shift();
            arr[arr.length] = item;
        }


        function shiftArrayLeft(arr) {
            var item = arr.pop();
            arr.unshift(item)
        }

        $scope.$watch("util.currentProduct", function () {
            $scope.endLoadingImage();

            (function (data, multiples) {
                var temp = angular.copy(data);
                var result = [];
                var times = Math.ceil(temp.length / multiples);
                for (var i = 0; i < times; i++) {
                    var a = temp.splice(0, multiples);
                    result.push(a);
                }

                $scope.filteredDetails = result;
            })($scope.util.currentProduct.details, 2);
        })
        /* $scope.filterDetails = function(data, multiples) {

         return $scope.filteredDetails;
         };*///($scope.util.currentProduct.details, 2);

    })
    .directive('errSrc', function () {
        return {
            link: function (scope, element, attrs) {
                element.bind('error', function() {
                    if (attrs.src != attrs.errSrc) {
                        attrs.$set('src', attrs.errSrc);
                    }
                });

                attrs.$observe('ngSrc', function(value) {
                    if (!value && attrs.errSrc) {
                        attrs.$set('src', attrs.errSrc);
                    }
                });
            }
        }
    })
    .directive("modalGallery", function ($compile) {
        console.log("Entered modal directive");
        return {
            scope: true,
            link: function (scope, element, attrs) {

                scope.calculateLeftDistance = function (index) {
                    scope.leftDistance = "-" + (index * 100) + "%"
                }

                scope.setImageDescription = function (index) {
                    scope.imageDescription = scope.galleryImages[index].imageDescription;
                }

                scope.$watch("util.currentProduct.thumbnailImages", function () {
                    scope.productImages = scope.util.currentProduct.thumbnailImages.slice();
                    scope.galleryImages = scope.util.currentProduct.galleryImages.slice();
                })
                function initialize() {
                    scope.imageDescription = scope.galleryImages[0].imageDescription;
                    scope.ulWidth = (scope.productImages.length * 100) + "%";
                    scope.liWidth = (100 / scope.productImages.length) + "%";
                    scope.leftDistance = 0 + "%";
                }


                element.on('click', function () {
                    initialize();
                    console.log(scope.productImages);
                    scope.$apply(function () {
                        scope.src = scope.currentImage;
                        console.log(scope.productImages.length);
                        var content = document.querySelector("#galleryTemplate").textContent.trim();
                        var listElem = angular.element(content);
                        var compileFn = $compile(listElem);
                        compileFn(scope);

                        console.log("List Element: " + listElem)

                        $('#myModal').modal();
                        $('#myModal').on('shown.bs.modal', function () {
                            $('#myModal .modal-body').html(listElem[0]);
                        });
                        $('#myModal').on('hidden.bs.modal', function () {
                            $('#myModal').off('shown.bs.modal');
                            $('#myModal .modal-body').html('');
                        });

                        var closeBtn = angular.element(listElem[0].querySelector(".close-gallery"));
                        closeBtn.on("click", function () {
                            $('#myModal').modal('hide');
                        })
                    })

                });
            }
        }
    })

