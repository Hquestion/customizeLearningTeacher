angular.module('MetronicApp').controller('CourseController', function($rootScope, $scope, $q, httpService) {
    $scope.data = {
        courseCateList: [],
        currentCourse: {
            SchoolFID: $scope.userInfo.SchoolFID,
            Creater: $scope.userInfo.FlnkID,
            Modifier: $scope.userInfo.FlnkID,
            "FlnkID": "",
            "CourseName": "",
            "CourseCode": "",
            "CourseCategoryFID": "",
            "HeadTeacherFID": "",
            "CourseDuration": 1,
            "IsExpireClose": false,
            "IsWorkTeam": false,
            "GroupNum": 1,
            "IsNumControl": false,
            "OpenStartTime": "",
            "OpenEndTime": "",
            "SortCode": 1,
            "IsAudited": false,
            "HeadTeacherName": "",
            "CoordTeachers": ""
        }
    };

    httpService.get('api/BasicSetInfoI/GetListCourseCategory', {
        schoolFID: $scope.userInfo.SchoolFID
    }).then(function(res){
        $scope.data.courseCateList = res;
        var deferList = [];
        $.each($scope.data.courseCateList, function(index, item){
            deferList.push(httpService.get('api/CourseInfo/GetCourseInfoByTeacherCategoryID', {
                CourseCategoryFID: item.FlnkID,
                teacherFID: $scope.userInfo.FlnkID
            }));
        });
        $q.all(deferList).then(function(result){
            $.each($scope.data.courseCateList, function(index, item){
                item.courseList = result[index]
            });
        });
    });

    httpService.get('api/UserBaseInfo/GetListTeacherInfo', {
        schoolFID: $rootScope.userInfo.SchoolFID
    }).then(function(res){
        $scope.teacherList = res;
    });

    $scope.openCreateDatePicker = function(){
        $scope.data.currentCourse.createTimeopened = true
    };

    $scope.saveCourse = function(){
        $.each($scope.teacherList, function(index ,item){
            if(item.FlnkID === $scope.data.currentCourse.HeadTeacherFID) {
                $scope.data.currentCourse.HeadTeacherName = item.XM;
            }
        });
        httpService.post('api/CourseInfo/SaveCourseInfo', {
            CourseInfo: $scope.data.currentCourse,
            ListCoordinationTeacher: []
        }).then(function(res){
            console.log(res)
        })
    };

    $scope.$on('$viewContentLoaded', function() {
        CKEDITOR.replaceAll();
    });
});