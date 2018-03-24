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
        initCateCourses(res[0], true);
    });

    function initCateCourses(cate, isInit){
        if(cate.courseList) {
            return;
        }else {
            httpService.get('api/CourseInfo/GetCourseInfoByCategoryID', {
                CourseCategoryFID: cate.FlnkID
            }).then(function(res){
                cate.courseList = res;
                if(isInit) {
                    $scope.data.currentCourse = res[0];
                }
            });
        }
    }

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
            if(!$scope.data.currentCourse.FlnkID) {
                $scope.data.currentCourse.FlnkID = res.CourseFID;
                var courseCate = _.find($scope.data.courseCateList, function(cate){
                    return cate.FlnkID === res.CourseCategoryFID;
                });
                courseCate.courseList = courseCate.courseList || [];
                courseCate.courseList.push($scope.data.currentCourse);
            } else {
                //修改成功
            }
        })
    };

    $scope.initEditor = function(){
        console.log(CKEDITOR.instances['prev-know-editor'])
        if(!CKEDITOR.instances['prev-know-editor']) {
            CKEDITOR.replace('prev-know-editor');
        }
    }

    $scope.initArrange = function(){
        if($scope.data.arrangeList) {
            return;
        }
        httpService.get('api/CourseManage/GetListC_CourseArrangeInfo', {
            courseFID: $scope.data.currentCourse.FlnkID
        }).then(function(res){
            $scope.data.arrangeList = res;
        });
    }

    $scope.saveArrange = function(){
        var param = [];
        _.each($scope.data.arrangeList, function(item){
            var arrangeObj = {
                "FlnkID": item.FlnkID || '',
                "CourseFID": $scope.data.currentCourse.FlnkID,
                "SetItemFID": item.SetItemFID || '',
                "ArrangeName": item.ArrangeName || '',
                "SortCode": item.SortCode || '',
                "Creater": $rootScope.userInfo.FlnkID,
                "Modifier": $rootScope.userInfo.FlnkID,
            };
            var arrangeModel = [];
            if(item.modelList && item.modelList.length > 0) {
                _.each(item.modelList, function(modelItem){
                    var newModelItem = {
                        "FlnkID": modelItem.FlnkID,
                        "CourseFID": $scope.data.currentCourse.FlnkID,
                        "IsSingle": true,
                        "SortCode": 1,
                        "Creater": $rootScope.userInfo.FlnkID,
                        "Modifier": $rootScope.userInfo.FlnkID,
                        "ArrangeFID": item.FlnkID || '',
                        "IsCheck": false,
                        "ArrangeContent": modelItem.ArrangeContent,
                        "ArrangeType": modelItem.ArrangeType || 1
                    }
                    arrangeModel.push(newModelItem);
                })
            }else {
                arrangeModel.push({
                    "FlnkID": '',
                    "CourseFID": $scope.data.currentCourse.FlnkID,
                    "IsSingle": true,
                    "SortCode": 1,
                    "Creater": $rootScope.userInfo.FlnkID,
                    "Modifier": $rootScope.userInfo.FlnkID,
                    "ArrangeFID": item.FlnkID || '',
                    "IsCheck": false,
                    "ArrangeContent": item.InputArrangeContent,
                    "ArrangeType": 1
                })
            }
            arrangeObj.modelList = arrangeModel;
            param.push(arrangeObj);
        });
        httpService.post('api/CourseManage/SaveC_CourseArrangeInfo', param).then(function(res){
            console.log(res)
        })
    };
});