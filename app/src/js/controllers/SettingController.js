angular.module('MetronicApp').controller('SettingController', function($rootScope, $scope, $uibModal, httpService, SweetAlert) {
    $scope.courseCateList = [];
    $scope.teacherList = [];
    $scope.arrangeTplList = [];
    $scope.thinkTplList = [];
    $scope.schoolStarValCfg = {};

    function initCourseCate(){
        httpService.get('api/BasicSetInfoI/GetListCourseCategory', {
            schoolFID: $rootScope.userInfo.SchoolFID
        }).then(function(res){
            $scope.courseCateList = res;
        });
    }

    function initArrangeTpl(){
        httpService.get('api/BasicSetInfoI/GetListBasicArrangeItem', {
            schoolFID: $rootScope.userInfo.SchoolFID
        }).then(function(res){
            $scope.arrangeTplList = res;
        });
    }

    function initThinkTpl(){
        httpService.get('api/BasicSetInfoI/GetListBasicReflectItem', {
            schoolFID: $rootScope.userInfo.SchoolFID
        }).then(function(res){
            $scope.thinkTplList = res;
        });
    }

    initCourseCate();
    initThinkTpl();
    initArrangeTpl();

    httpService.get('api/UserBaseInfo/GetListTeacherInfo', {
        schoolFID: $rootScope.userInfo.SchoolFID
    }).then(function(res){
        $scope.teacherList = res;
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
            SweetAlert.success('设置评价级别成功！');
        });
    };

    $scope.updateCourseCate = function(data){
        data = data || $scope.courseCateList;
        _.each(data, function(item, index){
            item.SortCode = index + 1;
        });
        httpService.post('api/BasicSetInfoI/SaveListCourseCategory', data).then(function(res){
            initCourseCate();
        }, function(){
            SweetAlert.error('保存课程分类失败！');
        });
    };

    $scope.deleteCourseCate = function(data, index){
        SweetAlert.confirm('删除之后将无法恢复，确定删除此课程类别吗？').then(function(res){
            if(res.dismiss !== 'cancel') {
                var param = $scope.courseCateList.slice();
                param[index].IsDelete = true;
                $scope.updateCourseCate(param);
            }
        });
    };

    $scope.moveCourseCate = function(data, index){
        var param = _.filter($scope.courseCateList, function(item, index2){
            return index !== index2;
        });
        param.splice(index - 1, 0, data);
        $scope.updateCourseCate(param);
    };

    $scope.addCourseCate = function(){
        $scope.addCourseCateDialog = $uibModal.open({
            templateUrl: 'courseCateSetting',
            scope: $scope,
            controller: 'addCourseCateController'
        });
    };

    $scope.updateArrange = function(data){
        data = data || $scope.arrangeTplList;
        _.each(data, function(item, index){
            item.SortCode = index + 1;
            item.SetFID = '2';
        });
        httpService.post('api/BasicSetInfoI/SaveListBasicSetInfoItem', data).then(function(res){
            initArrangeTpl();
        }, function(){
            SweetAlert.error('保存会安排模板失败！');
        });
    };

    $scope.deleteArrange = function(data, index){
        SweetAlert.confirm('删除之后将无法恢复，确定删除此会安排模板吗？').then(function(res){
            if(res.dismiss !== 'cancel') {
                var param = $scope.arrangeTplList.slice();
                param[index].IsDelete = true;
                $scope.updateArrange(param);
            }
        });
    };

    $scope.moveArrange = function(data, index){
        var param = _.filter($scope.arrangeTplList, function(item, index2){
            return index !== index2;
        });
        param.splice(index - 1, 0, data);
        $scope.updateArrange(param);
    };

    $scope.addArrangeTpl = function(){
        $scope.addArrangeDialog = $uibModal.open({
            templateUrl: 'arrangeTplSetting',
            scope: $scope,
            controller: 'addArrangeCtrl'
        });
    };

    $scope.updateThink = function(data){
        data = data || $scope.thinkTplList;
        _.each(data, function(item, index){
            item.SortCode = index + 1;
            item.SetFID = '3';
        });
        httpService.post('api/BasicSetInfoI/SaveListBasicSetInfoItem', data).then(function(res){
            initThinkTpl();
        }, function(){
            SweetAlert.error('保存有反思模板失败！');
        });
    };

    $scope.deleteThink = function(data, index){
        SweetAlert.confirm('删除之后将无法恢复，确定删除此有反思模板吗？').then(function(res){
            if(res.dismiss !== 'cancel') {
                var param = $scope.thinkTplList.slice();
                param[index].IsDelete = true;
                $scope.updateThink(param);
            }
        });
    };

    $scope.moveThink = function(data, index){
        var param = _.filter($scope.thinkTplList, function(item, index2){
            return index !== index2;
        });
        param.splice(index - 1, 0, data);
        $scope.updateThink(param);
    };

    $scope.addThinkTpl = function(){
        $scope.addThinkDialog = $uibModal.open({
            templateUrl: 'thinkTplSetting',
            scope: $scope,
            controller: 'addThinkCtrl'
        });
    };
});

angular.module('MetronicApp').controller('addCourseCateController', function($rootScope, $scope, $uibModal, httpService) {
    $scope.doAddCourseCate = function(){
        var param = $scope.courseCateList.slice();
        param.push({
            "FlnkID": "",
            "SchoolFID": $rootScope.userInfo.SchoolFID,
            "CourseCategoryName": $scope.tempCourseCateName,
            "SortCode": 1,
            "Creater": $rootScope.userInfo.FlnkID,
            "Modifier": $rootScope.userInfo.FlnkID,
            "HeadTeacher": $scope.tempCourseCateHeadTeacher
        });
        $scope.updateCourseCate(param);
        $scope.addCourseCateDialog && $scope.addCourseCateDialog.close();
    };

    $scope.cancel = function(){
        $scope.addCourseCateDialog && $scope.addCourseCateDialog.close();
    }
});

angular.module('MetronicApp').controller('addArrangeCtrl', function($rootScope, $scope, $uibModal, httpService) {
    $scope.doAddArrange = function(){
        var param = $scope.arrangeTplList.slice();
        param.push({
            "FlnkID": "",
            "SchoolFID": $rootScope.userInfo.SchoolFID,
            "SortCode": 1,
            "Creater": $rootScope.userInfo.FlnkID,
            "Modifier": $rootScope.userInfo.FlnkID,
            SetFID: "2",
            SetItemName: $scope.tempArrangeName
        });
        $scope.updateArrange(param);
        $scope.addArrangeDialog && $scope.addArrangeDialog.close();
    };

    $scope.cancel = function(){
        $scope.addArrangeDialog && $scope.addArrangeDialog.close();
    }
});

angular.module('MetronicApp').controller('addThinkCtrl', function($rootScope, $scope, $uibModal, httpService) {
    $scope.doAddThink = function(){
        var param = $scope.thinkTplList.slice();
        param.push({
            "FlnkID": "",
            "SchoolFID": $rootScope.userInfo.SchoolFID,
            "SortCode": 1,
            "Creater": $rootScope.userInfo.FlnkID,
            "Modifier": $rootScope.userInfo.FlnkID,
            SetFID: "2",
            SetItemName: $scope.tempThinkName
        });
        $scope.updateThink(param);
        $scope.addThinkDialog && $scope.addThinkDialog.close();
    };

    $scope.cancel = function(){
        $scope.addThinkDialog && $scope.addThinkDialog.close();
    }
});