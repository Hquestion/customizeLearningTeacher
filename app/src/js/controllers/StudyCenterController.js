angular.module('MetronicApp').controller('StudyCenterController', function($rootScope, $scope, $http, $timeout, httpService) {
    $scope.data = {
        currentGroup: '',
        courseList: []
    };

    httpService.get('api/CourseInfo/GetCourseInfoByTeacherID', {
        teacherFID: $rootScope.userInfo.FlnkID
    }).then(function(res){
        $scope.data.courseList = res;
    });

    httpService.get('')
});