const jwtMiddleware = require("../../../config/jwtMiddleware");
const user = require("./userController");
module.exports = function(app){
    const user = require('./userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    //회원가입 api
    app.post('/app/users',user.postUser);
    //탈퇴 api
    app.patch('/app/users/withdraw',jwtMiddleware,user.withdraw);


    //휴대폰 문자 인증 api
    app.post('/app/verifications',user.postVerification);
    //인증번호 확인 api
    app.post('/app/verifications/verify',user.verify);


    //유저 정보 조회 api
    app.get('/app/users/:userId',jwtMiddleware,user.getUserInfo);
    //유저 정보 수정 api
    app.patch('/app/users/:userId',jwtMiddleware,user.updateUserInfo);


    //로그인 api
    app.post('/app/login',user.login);
    //자동 로그인 api
    app.post('/app/auto-login',jwtMiddleware,user.autoLogin);


    //리뷰 작성 api
    app.post('/app/reviews',jwtMiddleware,user.postReview);
    //사용자 리뷰 조회 api
    app.get('/app/users/reviews/:userId',jwtMiddleware,user.getUserReviews);
    //리뷰 삭제 api
    app.patch("/app/users/reviews/:reviewId",jwtMiddleware,user.updateReviewStatus);
    //리뷰 수정 api
    app.patch('/app/reviews/:reviewId',jwtMiddleware,user.updateReview);
    //리뷰 신고 api
    app.post('/app/reviews/report',jwtMiddleware,user.postReport);


    //와인 찜 등록 api
    app.post('/app/subscribes',jwtMiddleware,user.postSubscribe);
    //와인 찜 조회 api
    app.get('/app/subscribes',jwtMiddleware,user.getUserSubscribeList);


    //검색어 등록 api
    app.post('/app/searched',jwtMiddleware,user.postSearchKeyword);
    //검색어 조회 api
    app.get('/app/searched',jwtMiddleware,user.getUserSearched);
    //인기 검색어 조회 api
    app.get('/app/searched/hot',jwtMiddleware,user.getHotSearched);
    //검색어 삭제(일부/전체) api
    app.patch('/app/searched',jwtMiddleware,user.patchSearchedList);
};