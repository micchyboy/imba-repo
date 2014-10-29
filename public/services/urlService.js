angular.module('sportsStore')
    .constant('domain','http://localhost:3000')
//    .constant('domain','http://imba-app.herokuapp.com')
    .constant('api','/some/api/info')
    .service('urls',function(domain,api, $routeParams){
        this.getDataUrl = function(username){
            return domain + "/api/products/" + username;
        }

        this.authUrl = domain + "/api/login";
        this.logOutUrl = domain + "/api/logout";
        this.signUpUrl = domain + "/api/signup";
        this.createUrl = domain + "/api/create";
        this.deleteUrl = domain + "/api/delete";
        this.deleteImageUrl = domain + "/api/delete_image";
        this.updateUrl = domain + "/api/update";
        this.uploadUrl = domain + "/api/upload";
        this.primaryImageUrl = domain + "/api/primary_image";


    })

