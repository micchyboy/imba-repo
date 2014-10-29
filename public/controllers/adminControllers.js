angular.module("sportsStore")
    .controller("authCtrl", function ($scope, $http, $location, urls, authService, $timeout) {
        $scope.authenticate = function (user, pass) {
            authService.authenticateUser($scope, user, pass)
                .then(function (data) {
                    console.log("Z POWER OF PROMISES!! THE FUCKING DATA: " + data);
                    $(".login-success").slideDown();
                    $timeout(function () {
                        $(".login-success").slideUp();
                    }, 3000);
                    $scope.data.user = data;

                    $scope.showProduct();
                },
                function (error) {
                    $scope.authenticationError = error;
                });
        }

        $scope.signUp = function () {
            $scope.accountCreated = false;
            console.log("Signing up!")
            $http({
                url: urls.signUpUrl,
                method: "POST",
                data: {
                    username: $scope.credentials[0],
                    password: $scope.credentials[1],
                    email: $scope.credentials[2],
                    phone: $scope.credentials[3]
                }
            }).success(function (data) {
//                console.log("Success" + data);
                $scope.accountCreated = true;
                $(".signup-success").slideDown();
                $timeout(function () {
                    $(".signup-success").slideUp();
                }, 3000);
                $scope.$emit("authSuccess");
//                $scope.authenticate(data.username, data.password)
            }).error(function (error) {
                console.log("Error is: " + error);
                $scope.signupError = error;
            });
        }
    })
    .controller("editorCtrl", function ($scope, urls, $http, $upload,
                                        $timeout, $q, dataHandler) {
        $scope.fileReaderSupported = window.FileReader != null && (window.FileAPI == null || FileAPI.html5 != false);
        $scope.imageDescriptions = [];


        initializeCurrentProduct();
        var deferred;

        /*dataHandler.copyContents($scope);

         $scope.$on("$locationChangeStart", function () {
         var obj = {key: "currentProduct", value: $scope.currentProduct};
         $scope.$emit("saveState", obj);
         })*/

        function initializeCurrentProduct() {
            $scope.currentProduct = {};
            $scope.currentProduct.features = [];
            $scope.currentProduct.details = [];
        }

        $scope.numberWithDecimalPattern = function () {
            return new RegExp("^[0-9]+[.]?[0-9]*$");
        }

        $scope.numberPattern = function () {
            return new RegExp("^[0-9]+$");
        }

        //TODO: not used, logic moved to server to append "- Copy" on duplicates
        $scope.renameDuplicate = function () {
            var imagesPath = $scope.currentProduct.thumbnailImages;
            var imageArr = [];

            for (var j = 0; j < imagesPath.length; j++) {
                var imageFilename = imagesPath[j].substring(imagesPath[j].lastIndexOf("/") + 1, imagesPath[j].length);
                imageArr[j] = imageFilename;
                for (var i = 0; i < $scope.selectedFiles.length; i++) {
                    if (imageFilename == $scope.selectedFiles[i].name) {
                        var duplicateName = $scope.selectedFiles[i].name;
                        $scope.selectedFiles[i].name = "Copy - " + duplicateName;
//                        $scope.duplicate = imageFilename;
//                        $scope.detailsForm.files.$setValidity("duplicate", true);
                    }
                }
            }

            /*if (imageArr.indexOf(uploadFilename) != -1) {
             $scope.duplicate = uploadFilename;
             $scope.detailsForm.filez.$setValidity("duplicate", false);
             }*/
            /*else {
             $scope.detailsForm.filez.$setValidity("duplicate", true);
             }*/
        }

        $scope.removeSelectedFile = function (file) {
            if ($scope.selectedPrimary == file.name) {
                $scope.selectedPrimary = "";
            }
            var index = $scope.selectedFiles.indexOf(file);
            $scope.selectedFiles.splice(index, 1);
            $scope.dataUrls.splice(index, 1);
            $scope.counter--;
        }

        $scope.containsImages = function () {
            var hasImage = ($scope.selectedFiles && $scope.selectedFiles.length > 0) ||
                ($scope.currentProduct.galleryImages && $scope.currentProduct.galleryImages.length > 0);

            $scope.detailsForm.$setValidity("hasImage", hasImage);

            return hasImage;
        }

        $scope.$on("createProduct", function (event) {
            console.log("Create event received");
            initializeCurrentProduct();
        })

        $scope.$on("editProduct", function (event, product) {
            console.log("Edit event received");
            $scope.currentProduct = angular.copy(product);
        })

        $scope.cancelEdit = function () {
            initializeCurrentProduct();
        }

        $scope.isPrimary = function (flag, arg) {
            if (!$scope.selectedPrimary) {
                var imagePath = $scope.currentProduct.primaryImage;
                var filename;
                if (imagePath) {
                    filename = imagePath.substring(imagePath.lastIndexOf("/") + 1, imagePath.length);
                }
                $scope.selectedPrimary = filename;
            }

            $scope.setNewPrimary = function (filename) {
                $scope.currentProduct.primaryImage = null;
                $scope.primaryImage = filename;

                $scope.selectedPrimary = filename;
            }

            $scope.setExistingPrimary = function (item) {
                $scope.primaryImage = null;
                $scope.currentProduct.primaryImage = $scope.convertToThumbnailSize(item.path);

                var filename = item.path.substring(item.path.lastIndexOf("/") + 1, item.path.length);
                $scope.selectedPrimary = filename;

            }

//            if ($scope.selectedFiles && $scope.selectedFiles.length > 0 && !$scope.currentProduct.primaryImage) {
            if ($scope.selectedPrimary) {
                $scope.detailsForm.$setValidity("primaryImage", true);
            }
            else {
                $scope.detailsForm.$setValidity("primaryImage", false);
            }
//            }


            if (flag == "N") {
                return $scope.primaryImage == arg;
            }
            else if (flag == "E") {
                var galleryPath = $scope.currentProduct.primaryImage;
                if (galleryPath && galleryPath.indexOf("/images/thumbnails") > -1) {
                    galleryPath = $scope.convertToGallerySize(galleryPath);
                }

                return galleryPath == arg
            }
        }


        $scope.updateProduct = function () {
            $http({
                url: urls.updateUrl,
                method: "PUT",
                data: {
                    user: $scope.data.user,
                    _id: $scope.currentProduct._id,
                    category: $scope.currentProduct.category,
                    floorArea: $scope.currentProduct.floorArea,
                    lotArea: $scope.currentProduct.lotArea,
                    price: $scope.currentProduct.price,
                    city: $scope.currentProduct.city,
                    bath: $scope.currentProduct.bath,
                    beds: $scope.currentProduct.beds,
                    features: $scope.currentProduct.features,
                    details: $scope.currentProduct.details,
                    galleryImages: $scope.currentProduct.galleryImages,
                    primaryImage: $scope.currentProduct.primaryImage
                }
            }).then(function (result) {
                deferred = [];
//                console.log("Successfully saved product!! " + data);
                console.log("Prooooooduct ID: " + result);

                $scope.myModel = {
                    username: $scope.data.user.username,
                    productId: $scope.currentProduct._id
                };
                if ($scope.selectedFiles && $scope.selectedFiles.length != 0) {
                    for (var i = 0; i < $scope.selectedFiles.length; i++) {
                        deferred[i] = $q.defer();
                        if (i == 0) {
                            $scope.myModel.imageDescription = $scope.imageDescriptions[i];
                            $scope.start(i);
                        }

                        (function (i) {
//                            var j = i;
                            deferred[i].promise.then(function () {
                                i++;
                                if (i < $scope.selectedFiles.length) {
                                    $scope.myModel.imageDescription = $scope.imageDescriptions[i];
                                    $scope.start(i);
                                }
                            })
                                .then(function () {
                                    if (i == $scope.selectedFiles.length) {
                                        /*$(".update-success").slideDown();
                                         $timeout(function () {
                                         $(".update-success").slideUp();
                                         }, 3000);*/
                                        $scope.savePrimaryImage($scope.currentProduct._id, $scope.selectedPrimary)
                                            .then(function (result) {
                                                console.log("Saved Primary Image")
                                                $scope.getProducts();
                                            });
                                    }
                                })
                        })(i);
//                        console.log("Image description "+ i +": " +  $scope.myModel.imageDescription)

                    }
                }

                $(".update-success").slideDown();
                var cleanUpVar = $scope.$on("$routeChangeStart", function () {
                    $(".update-success").slideUp();
                    cleanUpVar();
                })
//                $scope.getProducts();
                $scope.util.currentProduct = {};

            }).catch(function (error) {
                console.log("Error is: " + error);
                $scope.authenticationError = error;
            });
        }

        $scope.saveProduct = function () {

            $http({
                url: urls.createUrl,
                method: "POST",
                data: {
                    user: $scope.data.user,
                    category: $scope.currentProduct.category,
//                    description: $scope.currentProduct.description,
                    floorArea: $scope.currentProduct.floorArea,
                    lotArea: $scope.currentProduct.lotArea,
                    price: $scope.currentProduct.price,
                    city: $scope.currentProduct.city,
                    bath: $scope.currentProduct.bath,
                    beds: $scope.currentProduct.beds,
                    features: $scope.currentProduct.features,
                    details: $scope.currentProduct.details,
                    thumbnailImages: $scope.currentProduct.thumbnailImages,
                    galleryImages: $scope.currentProduct.galleryImages
                }
            }).then(function (result) {
                deferred = [];
//                console.log("Successfully saved product!! " + data);
                console.log("Prooooooduct ID: " + result.data.productId);

                $scope.myModel = {
                    username: $scope.data.user.username,
                    productId: result.data.productId
                };
                if ($scope.selectedFiles && $scope.selectedFiles.length != 0) {
                    for (var i = 0; i < $scope.selectedFiles.length; i++) {
                        deferred[i] = $q.defer();
                        if (i == 0) {
                            $scope.myModel.imageDescription = $scope.imageDescriptions[i];
                            $scope.start(i);
                        }

                        (function (i) {
//                            var j = i;
                            deferred[i].promise.then(function () {
                                i++;
                                if (i < $scope.selectedFiles.length) {
                                    $scope.myModel.imageDescription = $scope.imageDescriptions[i];
                                    $scope.start(i);
                                }

                            })
                                .then(function () {
                                    if (i == $scope.selectedFiles.length) {
                                        /*$(".create-success").slideDown();
                                         $timeout(function () {
                                         $(".create-success").slideUp();
                                         }, 3000);*/
                                        $scope.savePrimaryImage(result.data.productId, $scope.selectedPrimary)
                                            .then(function (result) {
                                                console.log("Saved Primary Image")
                                                $scope.getProducts();
                                            });
                                    }
                                })
                        })(i);
//                        console.log("Image description "+ i +": " +  $scope.myModel.imageDescription)

                    }
                }

                $(".create-success").slideDown();
                var cleanUpVar = $scope.$on("$routeChangeStart", function () {
                    $(".create-success").slideUp();
                    cleanUpVar();
                })
//                $scope.getProducts();
                $scope.util.currentProduct = {};

            }).catch(function (error) {
                console.log("Error is: " + error);
                $scope.authenticationError = error;
            });
        }


        $scope.selectedFiles = [];
        $scope.dataUrls = [];
        $scope.counter = 0;

        $scope.onFileSelect = function ($files) {
//            console.log($files);
            $scope.duplicatedFiles = $scope.selectedFiles.filter(function(f) {
                for(var i = 0; i < $files.length; i++){
                    if(f.name == $files[i].name){
                        $files.splice(i, 1);
                        return true;
                    }
                }
                return false;
            });

            if($scope.duplicatedFiles.length > 0){
                /*for(var i = 0; i < $scope.duplicatedFiles.length; i++){
                    $files.splice($files.indexOf($scope.duplicatedFiles[i]), 1);
                }*/

                $scope.notifyDanger("Duplicate filenames have been ignored. " +
                    "Please rename the file then upload again.", 5000)
            }

            $scope.progress = [];
            if ($scope.upload && $scope.upload.length > 0) {
                for (var i = 0; i < $scope.upload.length; i++) {
                    if ($scope.upload[i] != null) {
                        $scope.upload[i].abort();
                    }
                }
            }
            $scope.upload = [];
            $scope.uploadResult = [];

            /* for(var i = 0; i < $files.length; i++) {
             $scope.containsDuplicate($files[i].name);
             if ($scope.detailsForm.filez.$error.duplicate) {
             $files.splice(i, 1);
             }
             }*/

            $scope.selectedFiles = $scope.selectedFiles.concat($files);

            for (var i = $scope.counter; i < $scope.selectedFiles.length; i++) {
                var $file = $scope.selectedFiles[i];
                if ($scope.fileReaderSupported && $file.type.indexOf('image') > -1) {
                    var fileReader = new FileReader();
                    fileReader.readAsDataURL($scope.selectedFiles[i]);
                    var loadFile = function (fileReader, index) {
                        fileReader.onload = function (e) {
                            $timeout(function () {
                                $scope.dataUrls[index] = e.target.result;
                            });
                        }
                    }(fileReader, i);
                }
                $scope.progress[i] = -1;
                $scope.counter++;
                /*if ($scope.uploadRightAway) {
                 $scope.start(i);
                 }*/
            }
        };

        $scope.start = function (index) {
            $scope.progress[index] = 0;
            $scope.errorMsg = null;
            //$upload.upload()
            $scope.upload[index] = $upload.upload({
                url: urls.uploadUrl,
                method: "POST",
//                headers: {'my-header': 'my-header-value'},
                data: {
                    myModel: $scope.myModel,
                    errorCode: $scope.generateErrorOnServer && $scope.serverErrorCode,
                    errorMessage: $scope.generateErrorOnServer && $scope.serverErrorMsg
                },
                /* formDataAppender: function(fd, key, val) {
                 if (angular.isArray(val)) {
                 angular.forEach(val, function(v) {
                 fd.append(key, v);
                 });
                 } else {
                 fd.append(key, val);
                 }
                 }, */
                /* transformRequest: [function(val, h) {
                 console.log(val, h('my-header')); return val + '-modified';
                 }], */
                file: $scope.selectedFiles[index],
                fileFormDataName: 'myFile'
            });
            $scope.upload[index].then(function (response) {
                deferred[index].resolve();
                $timeout(function () {
                    $scope.uploadResult.push(response.data);
                });
            }, function (response) {
                if (response.status > 0) $scope.errorMsg = response.status + ': ' + response.data;
            }, function (evt) {
                // Math.min is to fix IE which reports 200% sometimes
                $scope.progress[index] = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });
            $scope.upload[index].xhr(function (xhr) {
//				xhr.upload.addEventListener('abort', function() {console.log('abort complete')}, false);
            });
        }
        console.log("Editor Scope!");


        $scope.deleteProductImage = function (item) {
            $http({
                url: urls.deleteImageUrl,
                method: "POST",
                data: {
                    user: $scope.data.user,
                    imageId: item._id,
                    galleryPath: item.path
                }
            }).then(function (result) {
                console.log("Image deleted.");

                var index = $scope.currentProduct.galleryImages.indexOf(item);

                if ($scope.currentProduct.thumbnailImages[index] == $scope.currentProduct.primaryImage) {
                    $scope.selectedPrimary = "";
                    $scope.currentProduct.primaryImage = "";
                }
                $scope.currentProduct.galleryImages.splice(index, 1);
                $scope.currentProduct.thumbnailImages.splice(index, 1);
//                $route.reload();
            })
        }

    })

    .directive("saveConfirmation", function () {
        return {
            link: function ($scope, $elem, $attrs) {
                var content = document.querySelector("#saveConfirmation").textContent.trim();
                var listElem = angular.element(content);
                var saveButton = angular.element(listElem[0].querySelector(".save-product"));

                $elem.on('click', function () {
                    $scope.$apply(function () {

                        console.log("List Element: " + listElem);

                        $('#myModalContentOnly').modal();
                        $('#myModalContentOnly').on('shown.bs.modal', function () {
                            $('#myModalContentOnly .modal-content').html(listElem[0]);
                        });
                        $('#myModalContentOnly').on('hidden.bs.modal', function () {
                            $('#myModalContentOnly').off('shown.bs.modal');
                            saveButton.off("click");
                            $('#myModalContentOnly .modal-content').html('');
                            $('#myModalContentOnly').off('hidden.bs.modal');
                        });

                        saveButton.on("click", function () {
                            $scope.saveProduct();
                            $('#myModalContentOnly').modal('hide');
                        })
                    })

                });
            }
        }
    })
    .directive("updateConfirmation", function () {
        return {
            link: function ($scope, $elem, $attrs) {
                var content = document.querySelector("#updateConfirmation").textContent.trim();
                var listElem = angular.element(content);
                var updateButton = angular.element(listElem[0].querySelector(".update-product"));

                $elem.on('click', function () {
                    $scope.$apply(function () {

                        console.log("List Element: " + listElem);

                        $('#myModalContentOnly').modal();
                        $('#myModalContentOnly').on('shown.bs.modal', function () {
                            $('#myModalContentOnly .modal-content').html(listElem[0]);
                        });
                        $('#myModalContentOnly').on('hidden.bs.modal', function () {
                            $('#myModalContentOnly').off('shown.bs.modal');
                            updateButton.off("click");
                            $('#myModalContentOnly .modal-content').html('');
                            $('#myModalContentOnly').off('hidden.bs.modal');
                        });

                        updateButton.on("click", function () {
                            $scope.updateProduct();
                            $('#myModalContentOnly').modal('hide');
                        })
                    })

                });
            }
        }
    })
    .directive("deleteImageConfirmation", function () {
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
                            $('#myModalContentOnly').off('hidden.bs.modal');
                        });

                        deleteButton.on("click", function () {
                            $scope.deleteProductImage($scope.item);
                            $('#myModalContentOnly').modal('hide');
                            deleteButton.off("click");
                        })
                    })

                });
            }
        }
    })
    .directive("clearDetailsConfirmation", function () {
        return {
            link: function ($scope, $elem, $attrs) {
                var content = document.querySelector("#clearDetailsConfirmation").textContent.trim();
                var listElem = angular.element(content);
                var clearButton = angular.element(listElem[0].querySelector(".clear-details"));

                $elem.on('click', function () {
                    $scope.$apply(function () {

                        console.log("List Element: " + listElem);

                        $('#myModalContentOnly').modal();
                        $('#myModalContentOnly').on('shown.bs.modal', function () {
                            $('#myModalContentOnly .modal-content').html(listElem[0]);
                        });
                        $('#myModalContentOnly').on('hidden.bs.modal', function () {
                            $('#myModalContentOnly .modal-content').html('');
                            $('#myModalContentOnly').off('shown.bs.modal');
                            $('#myModalContentOnly').off('hidden.bs.modal');
                        });

                        clearButton.on("click", function () {
                            $scope.reload();
                            $('#myModalContentOnly').modal('hide');
                        })
                    })

                });
            }
        }
    })
    .directive("simpleRepeater", function ($rootScope) {
//        alert("Entered simple repeater directive..");
        return {
            restrict: "EA",
            template: "<div ng-transclude></div>",
            transclude: true,
            replace: true,
            scope: true,
            compile: function (element, attrs, transcludeFn) {
                return function ($scope, $element, $attr) {
                    $scope.$$nextSibling.index = 0; //accesses the transcluded scope
                    var parentScope = $scope.$new();
                    var index = 1;
                    var lastElem = $element;

                    var clonedElems = [];
                    var items;

                    function initializeItems(product) {
                        if ($attr["type"] == "features") {
                            items = product ? product.features : $scope.currentProduct.features;
                            $scope.$watch("currentProduct.features", function () {
                                items = $scope.currentProduct.features;
                            }, true)
                        }
                        else {
                            items = product ? product.details : $scope.currentProduct.details;
                            $scope.$watch("currentProduct.details", function () {
                                items = $scope.currentProduct.details;
                            }, true)
                        }
                    }

                    initializeItems();
                    parentScope.$on("editProduct", function (event, product) {
                        initializeItems(product);
                        for (var i = 1; i < items.length; i++) {
                            var childScope = parentScope.$new();
                            childScope.index = i;
                            (function (childScope) {
                                childScope.$on("indexChanged", function (event, removedIndex) {
                                    if (childScope.index > removedIndex) {
                                        childScope.index--;
                                        childScope.$digest();
                                    }
                                })
                            })(childScope);

                            transcludeFn(childScope, function (clone) {
                                clonedElems.push(clone);
                                var buttonElem = clone.find("button");
                                buttonElem.addClass("btn-danger").text("-");

                                (function (childScope) {
                                    buttonElem.on("click", function () {
                                        items.splice(childScope.index, 1);
                                        clonedElems.splice(childScope.index - 1, 1);
                                        lastElem = clonedElems[clonedElems.length - 1];
                                        if (!lastElem) {
                                            lastElem = $element;
                                        }
                                        clone.remove();
                                        index--;
                                        var childScopeIndex = childScope.index;
                                        childScope.$destroy();
                                        parentScope.$broadcast("indexChanged", childScopeIndex);
                                    });
                                })(childScope);

                                lastElem.after(clone);
                                lastElem = clone;
                            });

                        }
                        if (items.length != 0) {
                            index = items.length;
                        }
                    })


                    $element.find("button").on("click", function () {
                        parentScope.$apply(function () {
                            var childScope = parentScope.$new();
                            childScope.index = index++;

                            //initial childScope.index = 1
                            childScope.$on("indexChanged", function (event, removedIndex) {
                                if (childScope.index > removedIndex) {
                                    childScope.index--;
                                    childScope.$digest();
                                }
                            })

                            //initial childScope.index = 1
                            transcludeFn(childScope, function (clone) {
                                clonedElems.push(clone);
                                var buttonElem = clone.find("button");
                                buttonElem.addClass("btn-danger").text("-");

                                //initial childScope.index = 1
                                buttonElem.on("click", function () {
                                    if (items) {
                                        items.splice(childScope.index, 1);
                                    }
                                    clonedElems.splice(childScope.index - 1, 1);
                                    lastElem = clonedElems[clonedElems.length - 1];
                                    if (!lastElem) {
                                        lastElem = $element;
                                    }
                                    clone.remove();
                                    index--;
                                    var childScopeIndex = childScope.index;
                                    childScope.$destroy();
                                    parentScope.$broadcast("indexChanged", childScopeIndex);
                                });

                                lastElem.after(clone);
                                lastElem = clone;
                            });
                        })

                    });
                }
            }
        }
    })

