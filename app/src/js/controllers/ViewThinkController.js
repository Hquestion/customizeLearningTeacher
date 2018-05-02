angular.module('MetronicApp').controller('ViewThinkController', function($rootScope, $scope, $location, $http, $timeout,$sce, $q, $uibModal, httpService, SweetAlert) {

    var groupId = $location.search().groupId;

    $scope.data = {
        groupMembers: [],
        currentMemberThinkContent: '',
        thinkCurrentMember: ''
    };

    httpService.get('api/CourseGroup/GetListGroupMembersByGroup', {
        groupFID: groupId
    }).then(function(res){
        $scope.data.groupMembers = _.filter(res, function(item){
            return item.MemberIdentity === 3;
        });
        $scope.data.thinkCurrentMember = $scope.data.groupMembers[0];
    }, function(){
        $scope.data.groupMembers = [];
    });

    $scope.setThinkCurrentMember = function(member){
        $scope.data.thinkCurrentMember = member;
        if(member) {
            httpService.get('api/CourseGroup/GetCrouseGroupReflectInfo', {
                userFID: member.MemberFID,
                groupFID: groupId
            }).then(function(res){
                $scope.data.currentMemberThinkContent = res.ReflectContent;
            }, function(){
                $scope.data.currentMemberThinkContent = '';
            });
        }
    };
});