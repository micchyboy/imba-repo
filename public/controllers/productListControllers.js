angular.module("sportsStore")
    .constant("productListActiveClass", "btn-primary")
    .constant("productListPageCount", 8)
    .config(function ($anchorScrollProvider) {
        $anchorScrollProvider.disableAutoScrolling();
    })
    .controller("productListCtrl", function ($scope, $filter, productListActiveClass, productListPageCount,
                                             $http, deleteUrl, primaryImageUrl) {
        var selectedCategory = null;
        var minimumPrice = 0;
        var maximumPrice = 0;

        $scope.searchData = {};
        $scope.searchData.criteria = $scope.util.sortBy.default;

        $scope.selectedPage = 1;
        $scope.pageSize = productListPageCount;

        $scope.selectCategory = function (newCategory) {
            selectedCategory = newCategory;
            $scope.selectedPage = 1;
        }
        $scope.selectPage = function (newPage) {
            $scope.selectedPage = newPage;
        }
        $scope.categoryFilterFn = function (product) {
            if (selectedCategory == null && minimumPrice == 0 && maximumPrice == 0) {
                return true;
            }
            var isLocated = selectedCategory ? (product.city == selectedCategory) : true;
            var isGreaterMinPrice = minimumPrice ? (product.price >= minimumPrice) : true
            var isLesserMaxPrice = maximumPrice ? (product.price <= maximumPrice) : true;

            return (isLocated && isGreaterMinPrice && isLesserMaxPrice);
        }
        $scope.getPageClass = function (page) {
            return $scope.selectedPage == page ? productListActiveClass : "";
        }

        $scope.searchProduct = function (location, minPrice, maxPrice) {
            selectedCategory = location ? location : null;
            minimumPrice = minPrice ? minPrice : 0;
            maximumPrice = maxPrice ? maxPrice : 0;

            $scope.selectedPage = 1;
        }

        $scope.showDetailsView = function (item) {
            $scope.util.currentProduct = item;

//            $scope.gotoElement('main');
        }

        $scope.showProduct = function () {
            $scope.util.mode = 'product';
            $scope.util.currentProduct = {};
            $scope.redirectPage("");
        }

        $scope.editProduct = function (item) {
            $scope.util.mode = 'update';
            $scope.redirectPage("/editor");
            var cleanUpEditProdBroad = $scope.$on("$routeChangeSuccess", function () {
                $scope.$broadcast("editProduct", item);

                cleanUpEditProdBroad();
            })

        }

        $scope.createProduct = function () {
            $scope.util.mode = 'create';
            $scope.redirectPage('/create');
            var cleanUpCreateProdBroad = $scope.$on("$routeChangeSuccess", function () {
                $scope.$broadcast("createProduct");

                cleanUpCreateProdBroad();
            })
        }

        $scope.deleteProduct = function (item) {
            $http({
                url: deleteUrl,
                method: "POST",
                data: {
                    user: $scope.data.user,
                    _id: item._id
                }
            }).then(function (result) {
                console.log("Product deleted.");

                if($scope.util.currentProduct._id == item._id){
                    $scope.util.currentProduct = {};
                }
                $scope.data.products.splice($scope.data.products.indexOf(item), 1);
//                $route.reload();
            })
        }

        $scope.savePrimaryImage = function (productId, filename) {
            console.log("Calling save primary image id: " + productId);
            return $http({
                url: primaryImageUrl,
                method: "POST",
                data: {
                    user: $scope.data.user,
                    _id: productId,
                    primaryImage: filename
                }
            })
        }

    })
    .directive("deleteProductConfirmation", function () {
        return {
            link: function ($scope, $elem, $attrs) {
                var content = document.querySelector("#deleteConfirmation").textContent.trim();
                var listElem = angular.element(content);
                var deleteButton = angular.element(listElem[0].querySelector(".delete-item"));

                $elem.on('click', function () {
                    $scope.$apply(function () {

                        console.log("List Element: " + listElem);

                        $('#myModalContentOnly').modal();
                        $('#myModalContentOnly').on('shown.bs.modal', function () {
                            $('#myModalContentOnly .modal-content').html(listElem[0]);
                        });
                        $('#myModalContentOnly').on('hidden.bs.modal', function () {
                            $('#myModalContentOnly').off('shown.bs.modal');
                            deleteButton.off("click");
                            $('#myModalContentOnly .modal-content').html('');
                        });

                        deleteButton.on("click", function () {
                            $scope.deleteProduct($scope.item, $scope.$index);
                            $('#myModalContentOnly').modal('hide');
                            deleteButton.off("click");
                        })
                    })

                });
            }
        }
    })
    .directive("bindImageSrc", function(){
        return {
            link: function($scope, $elem, $attrs){
                $attrs.$observe("ngSrc", function(value){
                    if(value){
                        console.log("Image src changed to: " + value);
                        $attrs.$set("src", value);
                    }
                    else{
                        //add the spinner
                    }
                })
            }
        }
    });