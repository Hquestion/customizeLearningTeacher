angular.module('MetronicApp').controller('SettingController', function($rootScope, $scope, httpService) {
    $scope.courseCateList = [];
    $scope.teacherList = [];
    $scope.arrangeTplList = [];
    $scope.thinkTplList = [];
    $scope.schoolStarValCfg = {};

    httpService.get('api/BasicSetInfoI/GetListCourseCategory', {
        schoolFID: $rootScope.userInfo.SchoolFID
    }).then(function(res){
        $scope.courseCateList = res;
    });

    httpService.get('api/UserBaseInfo/GetListTeacherInfo', {
        schoolFID: $rootScope.userInfo.SchoolFID
    }).then(function(res){
        $scope.teacherList = res;
    });

    httpService.get('api/BasicSetInfoI/GetListBasicArrangeItem', {
        schoolFID: $rootScope.userInfo.SchoolFID
    }).then(function(res){
        $scope.arrangeTplList = res;
    });

    httpService.get('api/BasicSetInfoI/GetListBasicReflectItem', {
        schoolFID: $rootScope.userInfo.SchoolFID
    }).then(function(res){
        $scope.thinkTplList = res;
    });

    httpService.get('api/BasicSetInfoI/GetSchoolConfigEvaluate', {
        schoolFID: $rootScope.userInfo.SchoolFID
    }).then(function(res){
        $scope.schoolStarValCfg = res;
        $scope.schoolStarValCfg.StarValue = $scope.schoolStarValCfg.StarValue || 0
    }, function(){
        $scope.schoolStarValCfg = {
            StarValue: 0
        }
    });

    $scope.onSetStarVal = function(data){
        httpService.post('api/BasicSetInfoI/SaveSchoolConfigEvaluate', {
            FlnkID: $scope.schoolStarValCfg.FlnkID,
            StarValue: data,
            SchoolFID: $rootScope.userInfo.SchoolFID,
            MaxStarValue: 10,
            Creater: $scope.userInfo.FlnkID,
            Modifier: $scope.userInfo.FlnkID
        }).then(function(){
            alert('保存成功')
        });
    }
});