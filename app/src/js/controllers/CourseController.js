angular.module('MetronicApp', ['720kb.datepicker']).controller('CourseController', function($rootScope, $scope, $q, $modal, httpService, SweetAlert) {
    var tempCourse = {
        SchoolFID: $rootScope.userInfo.SchoolFID,
        Creater: $rootScope.userInfo.FlnkID,
        Modifier: $rootScope.userInfo.FlnkID,
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
    };

    $scope.data = {
        courseCateList: [],
        currentCourse: {}
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
                    $scope.setCurrentCourse(null, res[0]);
                    cate.isOpend = true;
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
            ListCoordinationTeacher: $scope.data.currentCourse.helpTeacherList
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
        e && e.stopPropagation();
        $scope.activateTab('1');
        $scope.data.currentCourse = course;
        $scope.data.arrangeList = null;
        $scope.data.courseRemarkList = null;
        $scope.data.prevKnowContent = null;
        if(!course.helpTeacherList) {
            course.helpTeacherList = [];
            httpService.get('api/CourseInfo/GetListCourseCoordinationTeacher', {
                courseFID: course.FlnkID
            }).then(function(res){
                course.helpTeacherList = res;
            }, function(){
                course.helpTeacherList = [];
            });
        }
    };

    $scope.addCourse = function(){
        $scope.activateTab('1');
        $scope.data.currentCourse = JSON.parse(JSON.stringify(tempCourse));
        $scope.data.arrangeList = null;
        $scope.data.courseRemarkList = null;
        $scope.data.prevKnowContent = null;
    };

    $scope.deleteCourse = function(){
        var defer = SweetAlert.confirm('确定删除本课程吗？删除之后将同时删除课程关联的小组任务');
        defer.then(function(res) {
            if(res.dismiss === 'cancel') {
                return;
            }
            httpService.post('api/CourseInfo/DeleteCourseInfoByID', {
                FLnkID: $scope.data.currentCourse.FlnkID
            }).then(function (res) {
                SweetAlert.success('删除课程成功！', {
                    title: ''
                });
                var courseCate = _.find($scope.data.courseCateList, function (cate) {
                    return cate.FlnkID === $scope.data.currentCourse.CourseCategoryFID;
                });
                var index = _.findIndex(courseCate.courseList, function (item) {
                    return item.FlnkID === $scope.data.currentCourse.FlnkID;
                });
                courseCate.courseList.splice(index, 1);
                $scope.addCourse();
            }, function () {
                SweetAlert.error('删除课程失败，请重试！', {
                    title: ''
                });
            });
        });
    };

    $scope.initEditor = function(){
        $scope.activateTab('2');
        try {
            CKEDITOR.replace('prev-know-editor');
        }catch (e) {

        }
        if($scope.data.prevKnowContent) {
            return;
        }
        httpService.get('api/CourseManage/GetSingleCourseKnows', {
            courseFID: $scope.data.currentCourse.FlnkID
        }).then(function(res){
            $scope.data.prevKnowContent = res;
            CKEDITOR.instances['prev-know-editor'].setData($scope.data.prevKnowContent.KnowContent);
        }, function(){
            $scope.data.prevKnowContent = {
                "FlnkID": "",
                "CourseFID": $scope.data.currentCourse.FlnkID,
                "KnowContent": "",
                "Creater": $rootScope.userInfo.FlnkID,
                "Midifier": $rootScope.userInfo.FlnkID
            };
            CKEDITOR.instances['prev-know-editor'].setData('');
        });
    };

    $scope.savePrevKnow = function(){
        var instance = CKEDITOR.instances['prev-know-editor'];
        var content = instance.getData();
        $scope.data.prevKnowContent.KnowContent = content;
        httpService.post('api/CourseManage/OpertionTempleTable', $scope.data.prevKnowContent).then(function(res){
            SweetAlert.success('保存早知道内容成功！', {
                title: ''
            });
        }, function(){
            SweetAlert.error('保存早知道内容失败，请重试！', {
                title: ''
            });
        });
    };

    function initArrangeDataAjax(){
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
    }

    $scope.initArrange = function(){
        $scope.activateTab('3');
        if($scope.data.arrangeList) {
            return;
        }
        initArrangeDataAjax();
    };

    $scope.deleteStep = function(index){
        var defer = SweetAlert.confirm('确定删除此步骤吗？删除之后您需要保存设置才能生效！');
        defer.then(function(res) {
            if(res.dismiss === 'cancel') {
                return;
            }
            var data = $scope.data.arrangeList[index];
            if(data.FlnkID) {
                httpService.post('api/CourseManage/DeleteCourseArrangeInfo', {
                    FlnkID: data.FlnkID
                }).then(function(res){
                    if(index >= 0) {
                        $scope.data.arrangeList.splice(index, 1);
                    }
                    SweetAlert.success('删除会安排步骤成功！', {
                        title: ''
                    });
                }, function(){
                    SweetAlert.error('删除会安排步骤失败，请重试！', {
                        title: ''
                    });
                });
            }else {
                if(index >= 0) {
                    $scope.data.arrangeList.splice(index, 1);
                }
            }
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
            initArrangeDataAjax();
        }, function(){
            SweetAlert.error('保存步骤失败，请重试！', {
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
            _.each(item.modelList, function(modelItem, index2){
                modelItem.SortCode = index2 + 1;
            });
            param = param.concat(item.modelList);
        });
        httpService.post('api/CourseManage/SaveCourseReflectConfigItem', param).then(function(res){
            SweetAlert.success('保存有反思内容成功！', {
                title: ''
            });
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
        }, function(){
            SweetAlert.error('保存有反思内容失败，请重试！', {
                title: ''
            });
        });
    };

    $scope.deleteThinkItem = function(index, remarkParent){
        // 删除有反思内容
        var defer = SweetAlert.confirm('确定删除此打分项吗？删除之后将无法恢复！');
        defer.then(function(res) {
            if (res.dismiss === 'cancel') {
                return;
            }
            var data = remarkParent.modelList[index];
            if(data && data.FlnkID) {
                httpService.post('api/CourseManage/DeleteCourseReflectConfigItem', {
                    FlnkID: data.FlnkID
                }).then(function(res){
                    SweetAlert.success('删除打分项成功！', {
                        title: ''
                    });
                    if(index >= 0) {
                        remarkParent.modelList.splice(index, 1);
                    }
                }, function(){
                    SweetAlert.error('删除打分项失败，请重试！', {
                        title: ''
                    });
                });
            }else {
                if(index >= 0) {
                    remarkParent.modelList.splice(index, 1);
                }
            }
        });
    };

    $scope.moveThinkItem = function (data, index) {
        if(index > 0) {
            var list = data.modelList;
            var tempData = list[index];
            data.modelList.splice(index, 1);
            data.modelList.splice(index - 1, 0, tempData);
        }
    };

    $scope.sortStep = function(data, index){
        if(index > 0) {
            var tempData = data[index];
            data.splice(index, 1);
            data.splice(index - 1, 0, tempData);
        }
    };

    $scope.editHelpTeacher = function(){
        $scope.editHelpTeacherDialog = $modal.open({
            templateUrl: 'selectTeacher',
            scope: $scope,
            controller: 'editHelpTeacherCtrl'
        });
    };

    $scope.deleteHelpTeacher = function(data, index){
        if(data.FlnkID) {
            httpService.post('api/CourseInfo/DeleteCourseCoordinationTeacher', {
                FLnkID: data.FlnkID
            }).then(function(res){
                $scope.data.currentCourse.helpTeacherList.splice(index, 1);
            }, function(){
                SweetAlert.error('删除协作老师失败！');
            });
        }else {
            $scope.data.currentCourse.helpTeacherList.splice(index, 1);
        }
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

    $scope.deleteOptionItem = function(index){
        var data = $scope.toEditArrange.modelList[index];
        if(data && data.FlnkID) {
            httpService.post('api/CourseManage/DeleteCourseArrangeSeletct', {
                FlnkID: data.FlnkID
            }).then(function(res){
                $scope.toEditArrange.modelList.splice(index, 1);
            }, function(){
                SweetAlert.error('删除失败,请重试！');
            });
        } else {
            $scope.toEditArrange.modelList.splice(index, 1);
        }
    }
});

angular.module('MetronicApp').controller('editHelpTeacherCtrl', function($rootScope, $scope, httpService){
    $scope.originTeacherList = _.filter($scope.teacherList, function (item) {
        return true;
    });
    _.each($scope.data.currentCourse.helpTeacherList, function(helpItem){
        var helpTeacher = _.find($scope.originTeacherList, function(item){
            return item.FlnkID === helpItem.TeacherFID;
        });
        if(helpTeacher) {
            helpTeacher.isSelected = true;
        }
    });
    $scope.filtTeacherList = _.filter($scope.originTeacherList, function(){return true});
    $scope.searchKey = '';
    $scope.onInputSearch = function(){
        $scope.filtTeacherList = _.filter($scope.originTeacherList, function(item){
            return item.XM.indexOf($scope.searchKey) >= 0;
        });
    };
    $scope.addHelpTeacher = function(){
        var selectedTeachers = $scope.filtTeacherList.filter(function(item){
            return !!item.isSelected;
        });
        var newHelpTeachers = _.map(selectedTeachers, function(item){
            var old = _.find($scope.data.currentCourse.helpTeacherList, function(teacher){
                return teacher.TeacherFID === item.FlnkID;
            });
            return {
                CourseFID: $scope.data.currentCourse.FlnkID,
                Creater: $rootScope.userInfo.FlnkID,
                FlnkID: old && old.FlnkID || '',
                Modifier: $rootScope.userInfo.FlnkID,
                TeacherFID: item.FlnkID,
                TeacherName: item.XM
            };
        });
        $scope.data.currentCourse.helpTeacherList = newHelpTeachers;
        $scope.editHelpTeacherDialog && $scope.editHelpTeacherDialog.close();
    };
    $scope.cancel = function(){
        $scope.editHelpTeacherDialog && $scope.editHelpTeacherDialog.close();
    }
});