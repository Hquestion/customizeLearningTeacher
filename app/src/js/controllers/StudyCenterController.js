angular.module('MetronicApp').controller('StudyCenterController', function($rootScope, $scope, $http, $timeout,$sce, $q, $uibModal, httpService, SweetAlert) {
    $scope.data = {
        currentGroup: '',
        courseList: []
    };

    var MESSAGE_PAGE_SIZE = 20;
    var FAST_MSG_TYPE = {
        1: '同学们，你们真棒',
        2: '同学们，要多做记录',
        3: '同学们，要多观察勤思考',
        4: '同学们，要抓紧时间了'
    };
    var ws;
    connectSocket();
    function connectSocket(){
        ws = new WebSocket(CL_config.socketServiceUrl);
        ws.onopen = function(e){
            console.log('socket open...', +new Date());
            $scope.sendMsg(true);
        };
        ws.onmessage = function(e){
            $scope.$apply(function () {
                $scope.data.messages.push(JSON.parse(e.data));
            });
        };
        ws.onerror = function(e){
            console.error(e);
            ws.close();
        }

        ws.onclose = function(e){
            console.log('socket close...', +new Date());
            console.error('连接断开。。。')
            console.error(e);
        }

        document.addEventListener('hashchange', function(e){
            ws.close();
        });
        window.onbeforeunload = function(){ws.close(); }
        $rootScope.$on('$stateChangeSuccess', function(e){
            ws.close();
        });
    }

    httpService.get('api/CourseInfo/GetCourseInfoByTeacherID', {
        teacherFID: $rootScope.userInfo.FlnkID
    }).then(function(res){
        $scope.data.courseList = res;
        initCourseGroups(res[0], true);
    });


    httpService.get('api/BasicSetInfoI/GetSchoolConfigEvaluate', {
        schoolFID: $rootScope.userInfo.SchoolFID
    }).then(function(res){
        $scope.data.EvaluateStar = res.StarValue || 10;
    }, function(){
        $scope.data.EvaluateStar = 10;
    });

    function initCourseGroups(course, isInit){
        if(course.groupList) {
            return;
        }
        httpService.get('api/CourseGroup/GetCourseGroupByCourseID', {
            courseFID: course.FlnkID
        }).then(function(res){
            if(res && res instanceof Array) {
                course.courseGroups = res;
            }else {
                course.courseGroups = [];
            }
            if(isInit) {
                $scope.setCurrentGroup(null, course.courseGroups[0]);
                course.isOpend = true;
            }
        }, function(){
            course.courseGroups = [];
        });
    }

    $scope.toggleCourse = function(course){
        course.isOpend = !course.isOpend;
        initCourseGroups(course);
    };

    $scope.setCurrentGroup = function(e, group){
        e && e.stopPropagation();
        $scope.data.currentGroup = group;
        initCourseStatus();
        loadCurrentGroupData();
        // 需要对未完成的任务进行激活，然后才能接受消息
        if(group.Status === 0) {
            httpService.post('api/CourseGroup/UseActivationGroup', {
                "studentFID": $rootScope.userInfo.FlnkID,
                "groupFID": group.FlnkID,
                "CourseFID": group.CourseFID
            }).then(function(res){

            });
        }
    };

    function initCourseStatus () {
        $scope.data.groupArrangeList = [];
        $scope.data.messages = [];
        $scope.data.messagePageIndex = 1;
        $scope.data.totalMessagePages = 1;
        $scope.data.currentGroupMember = '';
        $scope.data.groupMembers = [];
        $scope.data.thinkCurrentMember = '';
        $scope.data.thinkTplList = [];
        $scope.data.groupCanPraise = false;
        $scope.data.currentMemberThinkContent = '';
    }

    function loadCurrentGroupData(){
        if(!$scope.data.currentGroup) {
            return;
        }
        // 获取小组会安排内容
        httpService.get('api/CourseGroup/GetListCourseGroupArrangeInfo', {
            courseFID: $scope.data.currentGroup.CourseFID,
            groupFID: $scope.data.currentGroup.FlnkID
        }).then(function(res){
            $scope.data.groupArrangeList = res;
        }, function(){
            $scope.data.groupArrangeList = [];
        });
        getMemberChatMsg($scope.data.messagePageIndex);
        //获取小组成员
        httpService.get('api/CourseGroup/GetListGroupMembersByGroup', {
            groupFID: $scope.data.currentGroup.FlnkID
        }).then(function(res){
            $scope.data.groupMembers = _.filter(res, function(item){
                return item.MemberIdentity === 3;
            });
        }, function(){
            $scope.data.groupMembers = [];
        });
        //获取老师是否可以打分
        httpService.get('api/CourseGroup/IsPraiseReflect', {
            groupFID: $scope.data.currentGroup.FlnkID
        }).then(function(res){
            $scope.data.groupCanPraise = true;
        }, function(){
            $scope.data.groupCanPraise = false;
        });
        $scope.setThinkCurrentMember('');
    }

    $scope.setCurrentMember = function(member){
        $scope.data.currentGroupMember = member;
        $scope.data.messagePageIndex = 1;
        $scope.data.messages = [];
        getMemberChatMsg($scope.data.messagePageIndex);
    };

    function getMemberChatMsg(pageIndex){
        var defer;
        if($scope.data.currentGroupMember) {
            // 获取小组会安排内容
            defer = httpService.post('api/CourseGroup/GetPageChatMessage', {
                "GroupFID": $scope.data.currentGroup.FlnkID,
                "UserFID": $scope.data.currentGroupMember.MemberFID,
                "Page": {
                    "PageIndex": pageIndex,
                    "PageSize": MESSAGE_PAGE_SIZE
                }
            });
        }else {
            // 获取小组会安排内容
            defer = httpService.post('api/CourseGroup/GetPageChatMessage', {
                "GroupFID": $scope.data.currentGroup.FlnkID,
                "Page": {
                    "PageIndex": pageIndex,
                    "PageSize": MESSAGE_PAGE_SIZE
                }
            });
        }
        defer.then(function(res){
            var showData = res.DataSource;
            $scope.data.totalMessagePages = res.PageCount;
            showData.reverse();
            var data = [];
            _.each(showData, function(item){
                item.MessageBody = JSON.parse(item.MessageBody);
                data.push(item.MessageBody);
            });
            $scope.data.messages = data.concat($scope.data.messages || []);
        }, function(){
            $scope.data.messages = [];
        });
    }

    $scope.showPracticeResult = function(){
        $scope.practiceModal = $uibModal.open({
            templateUrl: 'practiceResult',
            scope: $scope,
            controller: 'showResultCtrl'
        });
    };

    $scope.trustSrc = function(url){
        return $sce.trustAsResourceUrl(url);
    };

    $scope.onMsgContentScroll = function(){
        if($scope.data.messagePageIndex < $scope.data.totalMessagePages) {
            $scope.data.messagePageIndex++;
            getMemberChatMsg($scope.data.messagePageIndex);
        }
    };

    $scope.sendMsg = function(isJoinRoom, msg){
        var content = {
            MessageType: isJoinRoom ? 0: 2,
            FromUser: $rootScope.userInfo.FlnkID,
            ToGroup: $scope.data.currentGroup.FlnkID,
            RoleNum: $rootScope.userInfo.RoleNum,
            AvatarUrl: $rootScope.userInfo.AvatarUrl || '',
            UserName: $rootScope.userInfo.XM,
            MessageBody: {
                msgkey: '',
                msgtype: '1',
                msgcontent: msg || $scope.tempMsg,
                stepkey: '',
                stepcode: '',
                stepname: ''
            }
        };
        if(isJoinRoom) {
            content.MessageBody = {
                UserName: $rootScope.userInfo.FlnkID
            }
        }
        ws.send(JSON.stringify(content));
        $scope.tempMsg = '';
    };

    $scope.sendFastMsg = function(type){
        $scope.tempMsg = FAST_MSG_TYPE[type];
        $scope.sendMsg();
    };

    $scope.setThinkCurrentMember = function(member){
        $scope.data.thinkCurrentMember = member;
        if(member) {
            httpService.get('api/CourseGroup/GetCrouseGroupReflectInfo', {
                userFID: member.MemberFID,
                groupFID: $scope.data.currentGroup.FlnkID
            }).then(function(res){
                $scope.data.currentMemberThinkContent = res.ReflectContent;
            }, function(){
                $scope.data.currentMemberThinkContent = '';
            });
        }
        loadThinkRecord().then(function(res){
            loadMemberThinkRecord().then(function(memberRes){
                if(memberRes && memberRes.length > 0) {
                    _.each(res, function(cateItem){
                        _.each(cateItem.modelList, function(modelItem){
                            var data = _.find(memberRes, function(item){
                                return item.ReflectCategory === cateItem.FlnkID && item.ReflectFID === modelItem.FlnkID;
                            });
                            modelItem.StarValue = data && data.StarValue || 0;
                            modelItem.EvaluateFlnkID = data && data.FlnkID;
                        });
                    });
                    $scope.data.thinkTplList = res;
                } else {
                    $scope.data.thinkTplList = res;
                }
            }, function(){
                $scope.data.thinkTplList = res;
            });
        });
    };

    function loadThinkRecord() {
        loadThinkRecord.caches = loadThinkRecord.caches || {};
        var defer = $q.defer();
        if(loadThinkRecord.caches[$scope.data.currentGroup.CourseFID]) {
            defer.resolve(loadThinkRecord.caches[$scope.data.currentGroup.CourseFID])
        }else {
            httpService.get('api/CourseManage/GetListCourseReflectConfigDetails', {
                courseFID: $scope.data.currentGroup.CourseFID
            }).then(function(res){
                _.each(res, function(cateItem){
                    _.each(cateItem.modelList, function(modelItem){
                        modelItem.StarValue = 0;
                    });
                });
                loadThinkRecord.caches[$scope.data.currentGroup.CourseFID] = res;
                defer.resolve(res);
            }, function(res){
                loadThinkRecord.caches[$scope.data.currentGroup.CourseFID] = [];
                defer.resolve([]);
            });
        }
        return defer.promise;
    }

    function loadMemberThinkRecord() {
        var defer = $q.defer();
        httpService.get('api/CourseGroup/GetListTeacherCrouseGroupReflectInfoByStudent', {
            groupFID: $scope.data.currentGroup.FlnkID,
            teacherFID: $rootScope.userInfo.FlnkID,
            studentFID: $scope.data.thinkCurrentMember && $scope.data.thinkCurrentMember.MemberFID || '',
            courseFID: $scope.data.currentGroup.CourseFID
        }).then(function(res){
            defer.resolve(res);
        }, function(){
            defer.reject();
        });
        return defer.promise;
    }

    $scope.finishCourse = function(){
        var data = [];
        _.each($scope.data.thinkTplList, function(thinkGroup){
            _.each(thinkGroup.modelList, function(thinkItem){
                data.push({
                    "FlnkID": thinkItem.EvaluateFlnkID,
                    "GroupFID": $scope.data.currentGroup.FlnkID,
                    "IsPerson": !!$scope.data.thinkCurrentMember,
                    "StudentFID":  $scope.data.thinkCurrentMember &&  $scope.data.thinkCurrentMember.FlnkID,
                    "StarValue": thinkItem.StarValue,
                    "Modifier": $rootScope.userInfo.FlnkID,
                    "CourseFID": $scope.data.currentGroup.CourseFID
                });
            });
        });
        httpService.post('api/CourseGroup/SavePCrouseGroupReflectScore', data).then(function(){
            SweetAlert.success('保存评分结果成功！');
        });
    };

    $scope.closeGroup = function(){
        SweetAlert.confirm('即将关闭当前的任务小组，关闭之后将无法恢复，确定继续吗？').then(function(res){
            if(res.dismiss === 'cancel') return;
            httpService.post('api/CourseGroup/CloseCourseGroup ', {
                FLnkID: $scope.data.currentGroup.FlnkID
            }).then(function(){
                SweetAlert.success('关闭课程任务小组成功！');
            });
        });
    };
});

angular.module('MetronicApp').controller('showResultCtrl', function($scope, httpService){
    httpService.get('api/CourseGroup/GetCourseGroupWorkArrangeInfoByStudent', {
        groupFID: $scope.data.currentGroup.FlnkID,
        userFID: $scope.data.currentGroupMember && $scope.data.currentGroupMember.MemberFID || ''
    }).then(function(res){
        _.each(res, function(item){
            _.each(item.WorkArrangeList, function(arrange){
                arrange.MessageBody = JSON.parse(arrange.MessageBody);
                arrange.MessageBody = arrange.MessageBody.MessageBody;
            });
        });
        $scope.currentStuResult = res;
    }, function(){
        $scope.currentStuResult = [];
    });
    if($scope.data.currentGroupMember) {
        httpService.get('api/CourseGroup/GetCrouseGroupReflectInfo', {
            userFID: $scope.data.currentGroupMember && $scope.data.currentGroupMember.MemberFID || '',
            groupFID: $scope.data.currentGroup.FlnkID
        }).then(function(res){
            $scope.modalStuThinkContent = res.ReflectContent;
        }, function(){
            $scope.modalStuThinkContent = '';
        });
    }else {
        $scope.modalStuThinkContent = '';
    }

    $scope.close = function(){
        $scope.practiceModal && $scope.practiceModal.close();
    };
});