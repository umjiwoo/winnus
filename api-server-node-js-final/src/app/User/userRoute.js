module.exports = function(app){
    const user = require('./userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    //회원가입 api
    app.post('/app/users',user.postUser);

    //휴대폰 문자 인증 api
    app.post('/app/verifications',user.postVerification);
    //인증번호 확인 api
    app.post('/app/verifications/verify',user.verify);

    //로그인 api
    app.post('/app/login',user.login);
    //자동 로그인 api
    app.post('/app/auto-login',jwtMiddleware,user.autoLogin);
};