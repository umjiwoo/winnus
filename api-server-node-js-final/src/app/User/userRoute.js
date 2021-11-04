module.exports = function(app){
    const user = require('./userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    //회원가입 api
    app.post('/app/users',user.postUser);

    //휴대폰 문자 인증 api
    app.post('/app/verifications',user.postVerification);
    //TODO 로그인 api

};