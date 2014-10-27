angular.module("sportsStore")
    .factory("dataHandler",function($rootScope){
         var stateMap = [];
        $rootScope.$on("saveState", function(event, obj){
            if(!keyExists(obj.key)) {
                stateMap.push(obj);
            }
        })

        function keyExists(key){
            for(var i = 0; i < stateMap.length; i++) {
                if (stateMap[i].key == key) {
                    return true;
                }
            }
            return false;
        }

        return {
            get : function(key){
                for(var i = 0; i < stateMap.length; i++){
                    if(stateMap[i].key == key){
                        return stateMap[i].value;
                    }
                    return false;
                }
            },
            copyContents : function(scope){
                for(var i = 0; i < stateMap.length; i++){
                    scope[stateMap[i].key] = stateMap[i].value;
                }
            }
        }
    });
