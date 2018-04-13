$(function(){
    $('#login-form').on('submit', function(e){
        //todo 登陆操作
        e.preventDefault();
        var userPhone = $('#inputPhone').val();
        var pwd = $('#inputPassword').val();
        $.post(CL_config.httpServerUrl + 'api/LoginInfo/UserLogin', {
            LoginName: userPhone,
            LoginPwd: pwd
        }).then(function(res) {
            if(res.Flag) {
                var userInfo = res.ResultObj;
                $.cookie('userId', userInfo.FlnkID);
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
                if(userInfo.RoleNum === 0) {
                    window.location.replace('index.html#/user-manage.html');
                }else {
                    window.location.replace('index.html#/study-center.html');
                }
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
        var userPhone = $('#phoneNumber').val();
        var idCard = $('#idcard').val();
        var pwd = $('#password').val();
        var confirmPwd = $('#confirm-pwd').val();
        if(pwd !== confirmPwd) {
            alert('两次输入的密码不一致！');
            return;
        }
        $.post(CL_config.httpServerUrl + 'api/LoginInfo/SetPassword', {
            LoginName: userPhone,
            SFZH: idCard,
            LoginPwd: pwd
        }).then(function(res){
            if(res.Flag) {
                window.location.href = 'login.html';
            }else {
                alert(res.Message);
            }
        }, function(){
            alert('绑定失败，请重试！');
        });
    })
});