angular.module('MetronicApp', ['720kb.datepicker']).controller('CourseController', function($rootScope, $scope, $q, $modal, httpService, SweetAlert) {
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

    var TAB_INDEX_MAP = {
        '1': 'courseSettingTabActive',
        '2': 'prevKnowTabActive',
        '3': 'arrangeTabActive',
        '4': 'practiceTabActive',
        '5': 'thinkTabActive'
    };

    $scope.activateTab = function(index) {
        for(var key in TAB_INDEX_MAP) {
            $scope[TAB_INDEX_MAP[key]] = false;
        }
        $scope[TAB_INDEX_MAP[index]] = true;
    };

    $scope.activateTab('1');

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
                _.each(res, function(item){
                    item.OpenEndTime = item.OpenEndTime && item.OpenEndTime.slice(0, 10) || '';
                    item.OpenStartTime = item.OpenStartTime && item.OpenStartTime.slice(0, 10) || '';
                });
                cate.courseList = res;
                if(isInit) {
                    $scope.data.currentCourse = res[0];
                }
            }, function(){
                cate.courseList = [];
            });
        }
    }

    httpService.get('api/UserBaseInfo/GetListTeacherInfo', {
        schoolFID: $rootScope.userInfo.SchoolFID
    }).then(function(res){
        $scope.teacherList = res;
    });

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
                SweetAlert.success('添加课程成功！', {
                    title: ''
                });
            } else {
                //修改成功
                SweetAlert.success('修改课程成功！', {
                    title: ''
                });
            }
        })
    };

    $scope.toggleCategory = function(cate){
        cate.isOpend = !cate.isOpend;
        initCateCourses(cate);
    };

    $scope.setCurrentCourse = function(e, course) {
        e.stopPropagation();
        $scope.data.currentCourse = course;
        $scope.data.arrangeList = null;
        $scope.data.courseRemarkList = null;
        $scope.activateTab('1');
    };

    $scope.addCourse = function(){
        $scope.data.currentCourse = null;
    };

    $scope.initEditor = function(){
        $scope.activateTab('2');
        if(!CKEDITOR.instances['prev-know-editor']) {
            CKEDITOR.replace('prev-know-editor');
        }
    }

    $scope.initArrange = function(){
        $scope.activateTab('3');
        if($scope.data.arrangeList) {
            return;
        }
        httpService.get('api/CourseManage/GetListC_CourseArrangeInfo', {
            courseFID: $scope.data.currentCourse.FlnkID
        }).then(function(res){
            _.each(res, function(item){
                item.modelList = item.modelList || [];
                if(item.modelList.length === 0) {
                    item.modelList.push({
                        "FlnkID": '',
                        "CourseFID": $scope.data.currentCourse.FlnkID,
                        "IsSingle": true,
                        "SortCode": 1,
                        "Creater": $rootScope.userInfo.FlnkID,
                        "Modifier": $rootScope.userInfo.FlnkID,
                        "ArrangeFID": item.FlnkID || '',
                        "IsCheck": false,
                        "ArrangeContent": '',
                        "ArrangeType": 0
                    })
                }
            });
            $scope.data.arrangeList = res;
        });
    };

    $scope.initThink = function(){
        $scope.activateTab('5');
        if($scope.data.courseRemarkList) {
            return;
        }
        httpService.get('api/CourseManage/GetListCourseReflectConfigDetails', {
            courseFID: $scope.data.currentCourse.FlnkID
        }).then(function(res){
            if(res && res instanceof Array) {
                _.each(res, function(item, index){
                    item.modelList = item.modelList || [];
                });
                $scope.data.courseRemarkList = res;
            }else {
                $scope.data.courseRemarkList = [];
            }
        });
    };

    $scope.saveArrange = function(){
        var param = [];
        _.each($scope.data.arrangeList, function(item, index){
            item.SortCode = index + 1;
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
            _.each(item.modelList, function(modelItem){
                var newModelItem = {
                    "FlnkID": modelItem.FlnkID,
                    "CourseFID": $scope.data.currentCourse.FlnkID,
                    "IsSingle": modelItem.IsSingle,
                    "SortCode": modelItem.SortCode || 1,
                    "Creater": $rootScope.userInfo.FlnkID,
                    "Modifier": $rootScope.userInfo.FlnkID,
                    "ArrangeFID": item.FlnkID || '',
                    "IsCheck": modelItem.IsCheck,
                    "ArrangeContent": modelItem.ArrangeContent,
                    "ArrangeType": modelItem.ArrangeType || 0
                }
                arrangeModel.push(newModelItem);
            });
            arrangeObj.modelList = arrangeModel;
            param.push(arrangeObj);
        });
        httpService.post('api/CourseManage/SaveC_CourseArrangeInfo', param).then(function(res){
            SweetAlert.success('保存步骤成功！', {
                title: ''
            });
        });
    };

    $scope.editStep = function(arrange){
        $scope.toEditArrange = JSON.parse(JSON.stringify(arrange));
        $scope.toEditArrange.modelList = $scope.toEditArrange.modelList || [];
        if(arrange.modelList && arrange.modelList[0] && arrange.modelList[0].ArrangeType === 1) {
            if(arrange.modelList[0].IsSingle) {
                $scope.toEditArrange.arrangeMode = '2';
            }else {
                $scope.toEditArrange.arrangeMode = '3';
            }
        }else {
            $scope.toEditArrange.arrangeMode = '1';
        }
        $scope.editArrangeStepDialog = $modal.open({
            templateUrl: 'editArrangeStep',
            scope: $scope,
            controller: 'editArrangeCtrl'
        });
    };

    $scope.addStep = function(){
        $scope.editStep({});
    };

    $scope.addThinkItem = function(item){
        if(!$.trim(item.tempItemContent)) {
            item.isTempContentEmpty = true;
            return;
        }else {
            item.isTempContentEmpty = false;
        }
        item.modelList.push({
            "FlnkID": '',
            "ReflectFID": item.FlnkID,
            "ReflectItemName": $.trim(item.tempItemContent),
            "SortCode": (item.modelList.length || 0) + 1,
            "Creater": $rootScope.userInfo.FlnkID,
            "Modifier": $rootScope.userInfo.FlnkID,
            "CourseFID": item.CourseFID
        });
        item.tempItemContent = '';
    };

    $scope.checkThinkTempItem = function(item){
        item.isTempContentEmpty = !$.trim(item.tempItemContent);
    };

    $scope.saveThink = function(){
        var param = [];
        _.each($scope.data.courseRemarkList, function(item, index){
            param = param.concat(item.modelList);
        });
        httpService.post('api/CourseManage/SaveCourseReflectConfigItem', param).then(function(res){
            SweetAlert.success('保存有反思内容成功！', {
                title: ''
            });
        }, function(){
            SweetAlert.error('保存有反思内容失败，请重试！', {
                title: ''
            });
        });
    };
});

angular.module('MetronicApp').controller('editArrangeCtrl', function($rootScope, $scope, httpService){
    $scope.addOption = function() {
        $scope.toEditArrange.modelList.push({
            "FlnkID": '',
            "CourseFID": $scope.data.currentCourse.FlnkID,
            "IsSingle": $scope.toEditArrange.arrangeMode === '2',
            "SortCode": 1,
            "Creater": $rootScope.userInfo.FlnkID,
            "Modifier": $rootScope.userInfo.FlnkID,
            "ArrangeFID": $scope.toEditArrange.FlnkID || '',
            "IsCheck": false,
            "ArrangeContent": '',
            "ArrangeType": 1
        });
    };

    $scope.doSave = function(){
        if($scope.toEditArrange.arrangeMode === '1') {
            _.each($scope.toEditArrange.modelList, function(item){
                item.ArrangeType = 0;
                item.IsSingle = false;
                item.IsCheck = false;
            });
        }else {
            _.each($scope.toEditArrange.modelList, function(item){
                item.ArrangeType = 1;
                item.IsSingle = $scope.toEditArrange.arrangeMode === '2';
            });
        }
        if($scope.toEditArrange.FlnkID) {
            var index = _.findIndex($scope.data.arrangeList, function(item){
                return item.FlnkID === $scope.toEditArrange.FlnkID;
            });
            $scope.data.arrangeList[index] = $scope.toEditArrange;
        }else {
            $scope.data.arrangeList.push($scope.toEditArrange);
        }
        $scope.editArrangeStepDialog && $scope.editArrangeStepDialog.close()
    };

    $scope.cancel = function(){
        $scope.editArrangeStepDialog && $scope.editArrangeStepDialog.close()
    };
});