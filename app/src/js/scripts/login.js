$(function(){
    $('#login-form').on('submit', function(e){
        //todo 登陆操作
        e.preventDefault();
        var userPhone = $('#inputPhone').val();
        var pwd = $('#inputPassword').val();
        $.post(CL_config.httpServerUrl + '/api/LoginInfo/UserLogin', {
            LoginName: userPhone,
            LoginPwd: pwd
        }).then(function(res) {
            if(res.Flag) {
                var userInfo = res.ResultObj;
                $.cookie('userId', userInfo.FlnkID)
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
                window.location.replace('/#/setting.html');
            }else {
                alert('登陆失败');
            }
        }, function(){
            alert('登陆失败');
        });
    });

    $('#register-form').on('submit', function(e) {
        //todo 注册操作
        e.preventDefault();
        console.log(e)
    })
});