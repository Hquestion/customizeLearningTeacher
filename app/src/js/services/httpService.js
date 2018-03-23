angular.module('MetronicApp').service('httpService', function($http, $q){
    return {
        get: function(url, param) {
            var defer = $q.defer();
            url = CL_config.httpServerUrl + url;
            $http.get(url, {
                params: param
            }).then(function(res){
                if(res.data.Flag) {
                    defer.resolve(res.data.ResultObj)
                }else {
                    defer.reject(res.data)
                }
            }, function(res){
                defer.reject(res)
            });
            return defer.promise;
        },
        post: function(url, param) {
            var defer = $q.defer();
            url = CL_config.httpServerUrl + url;
            $http.post(url, param).then(function(res){
                if(res.data.Flag) {
                    defer.resolve(res.data.ResultObj);
                }else {
                    defer.reject(res.data);
                }
            }, function(res){
                defer.reject();
            });
            return defer.promise;
        }
    }
});