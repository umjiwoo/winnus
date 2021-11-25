const jwtMiddleware = require("../../../config/jwtMiddleware");
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

    //리뷰 작성
    app.post('/app/reviews',jwtMiddleware,user.postReview);

    //와인 찜 등록
    app.post('/app/subscribes',jwtMiddleware,user.postSubscribe);

    //와인 찜 조회
    app.get('/app/subscribes',jwtMiddleware,user.getUserSubscribeList);

    //검색어 등록
    app.post('/app/searched',jwtMiddleware,user.postSearchKeyword);

    //검색어 조회
    app.get('/app/searched',jwtMiddleware,user.getUserSearched);

    //인기 검색어 조회
    app.get('/app/searched/hot',jwtMiddleware,user.getHotSearched);

    //검색어 삭제(일부/전체)
    app.patch('/app/searched',jwtMiddleware,user.patchSearchedList);
};