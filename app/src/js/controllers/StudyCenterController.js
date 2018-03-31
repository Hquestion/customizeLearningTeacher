angular.module('MetronicApp').controller('StudyCenterController', function($rootScope, $scope, $http, $timeout,$sce, httpService) {
    $scope.data = {
        currentGroup: '',
        courseList: []
    };

    var MESSAGE_PAGE_SIZE = 20;
    var FAST_MSG_TYPE = {
        1: '同学们，你们真棒',
        2: '同学们，要多做记录',
        3: '同学们，要多观察勤思考',
        4: '同学们，要抓紧事件了'
    };
    var ws;
    connectSocket();
    function connectSocket(){
        ws = new WebSocket("ws://192.168.0.117:8400");
        ws.onopen = function(e){
            $scope.sendMsg(true);
        };
        ws.onmessage = function(e){
            $scope.$apply(function () {
                $scope.data.messages.push(JSON.parse(e.data));
            });
        };
        ws.onerror = function(){
            ws.close();
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
                $scoep.setCurrentGroup(null, course.courseGroups[0]);
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
            $scope.data.groupMembers = res;
        }, function(){
            $scope.data.groupMembers = [];
        });
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

    };
});