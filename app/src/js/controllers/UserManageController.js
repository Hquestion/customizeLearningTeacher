angular.module('MetronicApp', []).controller('UserManageController', function($rootScope, $scope, $q, $modal, httpService, SweetAlert) {
    $scope.searchKey = '';
    $scope.onInputSearch = function(){
        $scope.filtTeacherList = _.filter($scope.teacherList, function(item){
            return item.XM.indexOf($scope.searchKey) >= 0;
        });
    };

    $scope.onSwitchChange = function(val){
        httpService.post('api/UserBaseInfo/SetSchoolMaster', [{
            UserFID: val.FlnkID,
            IsMaster: val.isSelected ? 1 : 0
        }]).then(function(){
            SweetAlert.success('修改管理员成功！');
        }, function(){
            val.isSelected = false;
            SweetAlert.error('修改管理员成功！');
        });
    };

    httpService.get('api/UserBaseInfo/GetListTeacherInfo', {
        schoolFID: $rootScope.userInfo.SchoolFID
    }).then(function(res){
        $scope.teacherList = res;
        _.each(res, function(item){
            item.isSelected = !!item.IsMaster;
        });
        $scope.filtTeacherList = _.filter($scope.teacherList, function(){return true});
    });
});