angular.module('MetronicApp', []).controller('ReportController', function($rootScope, $scope, $q, $modal, httpService, SweetAlert) {

    $scope.data = {
        gradeList: [],
        currentStudent: '',
        courseCateList: [],
        currentCate: '',
        currentGrade: '',
        currentClass: '',
        currentStu: ''
    };

    httpService.post('api/Report/GetReportByObjectDictionary', {
        storename: 'proc_getgrade',
        schoolfid: $scope.userInfo.SchoolFID
    }).then(function(res){
        $scope.data.gradeList = res;
        $scope.changeGrade(res[0]);
    });

    $scope.changeGrade = function(grade){
        if(grade.isOpend) {
            grade.isOpend = !grade.isOpend;
            return;
        }else {
            grade.isOpend = !grade.isOpend;
        }
        $scope.data.currentGrade = grade;
        if(!grade.classList) {
            httpService.post('api/Report/GetReportByObjectDictionary', {
                storename: 'proc_getclass',
                schoolfid: $scope.userInfo.SchoolFID,
                gradeno: grade.GradeNo
            }).then(function(res){
                grade.classList = res;
                $scope.changeClass(grade, res[0]);
            });
        }else {
            $scope.changeClass(grade, grade.classList[0]);
        }
    };

    $scope.changeClass = function(grade, klass, e){
        e && e.stopPropagation();
        if(klass.isOpend) {
            klass.isOpend = !klass.isOpend;
            return;
        }else {
            klass.isOpend = !klass.isOpend;
        }
        $scope.data.currentGrade = grade;
        $scope.data.currentClass = klass;
        if(!klass.stuList) {
            httpService.post('api/Report/GetReportByObjectDictionary', {
                storename: 'proc_getuser',
                schoolfid: $scope.userInfo.SchoolFID,
                gradeno: grade.GradeNo,
                classno: klass.ClassNo
            }).then(function(res){
                klass.stuList = res;
                $scope.changeStu(grade, klass, res[0]);
            });
        }else {
            $scope.changeStu(grade, klass, klass.stuList[0]);
        }
    };

    $scope.changeStu = function(grade, klass, stu, e){
        e && e.stopPropagation();
        $scope.data.currentGrade = grade;
        $scope.data.currentClass = klass;
        $scope.data.currentStu = stu;
        generateReport();
    };

    function generateReport(){
        initGeneralReport();
        httpService.get('api/BasicSetInfoI/GetListCourseCategory', {
            schoolFID: $scope.userInfo.SchoolFID
        }).then(function(res){
            $scope.data.courseCateList = res;
            $scope.data.currentCate = res[0];
            initCateReport(res[0]);
        });
    }

    $scope.setCurrentCate = function(data){
        $scope.data.currentCate = data;
        initCateReport(data);
    };

    function initGeneralReport(){
        httpService.post('api/Report/GetReportByObjectDictionary', {
            storename: 'Proc_ReflectScore',
            userid: $scope.data.currentStu.userid
        }).then(function(res){
            if(res.length > 0) {
                var indicators = _.map(res, function(item){
                    return {
                        name: item.ReflectCategoryName,
                        max: item.TotalStarValue
                    }
                });
                var seriesValue = _.map(res, function(item){
                    return item.StarValue;
                });
                var option = {
                    tooltip: {},
                    radar: {
                        name: {
                            textStyle: {
                                color: '#fff',
                                backgroundColor: '#999',
                                borderRadius: 3,
                                padding: [3, 5]
                            }
                        },
                        indicator: indicators
                    },
                    series: [{
                        name: '能力图谱',
                        type: 'radar',
                        // areaStyle: {normal: {}},
                        data : [
                            {
                                value : seriesValue,
                                name : '平均得分'
                            }
                        ]
                    }]
                };
                echarts.dispose($('#general-radar-area').get(0));
                $(function(){
                    var myChart = echarts.init(document.getElementById('general-radar-area'));
                    myChart.setOption(option);
                });
                $scope.noData = false;
            }else {
                echarts.dispose($('#general-radar-area').get(0));
                $scope.noData = true;
            }
        });
    }

    function initCateReport(cate){
        httpService.post('api/Report/GetReportByObjectDictionary', {
            storename: 'Proc_CourseCategoryReflectScore',
            coursecategoryid: cate.FlnkID,
            userid: $scope.data.currentStu.userid
        }).then(function(res){
            if(res.length > 0) {
                var indicators = _.map(res, function(item){
                    return {
                        name: item.ReflectCategoryName,
                        max: item.TotalStarValue
                    }
                });
                var seriesValue = _.map(res, function(item){
                    return item.StarValue;
                });
                var option = {
                    tooltip: {},
                    radar: {
                        name: {
                            textStyle: {
                                color: '#fff',
                                backgroundColor: '#999',
                                borderRadius: 3,
                                padding: [3, 5]
                            }
                        },
                        indicator: indicators
                    },
                    series: [{
                        name: '能力图谱',
                        type: 'radar',
                        // areaStyle: {normal: {}},
                        data : [
                            {
                                value : seriesValue,
                                name : '平均得分'
                            }
                        ]
                    }]
                };
                echarts.dispose($('#radar-area').get(0));
                $(function(){
                    var myChart = echarts.init(document.getElementById('radar-area'));
                    myChart.setOption(option);
                });
                $scope.noDetailData = false;
            }else {
                echarts.dispose($('#radar-area').get(0));
                $scope.noDetailData = true;
            }
        });
    }
});