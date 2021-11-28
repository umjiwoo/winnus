const jwtMiddleware = require("../../../config/jwtMiddleware");
const userProvider = require("../../app/User/userProvider");
const userService = require("../../app/User/userService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const regexPwd=require("password-regexp")();
const {emit} = require("nodemon");

exports.postUser=async function(req,res){
   const {nickname,phoneNum,pwd}=req.body;
   //null값 체크
   if(!nickname)
       return res.send(errResponse(baseResponse.ENTER_NICKNAME_TO_SIGN_UP));
   if(!phoneNum)
       return res.send(errResponse(baseResponse.ENTER_PHONENUM_TO_SIGN_UP));
   if(!pwd)
       return res.send(errResponse(baseResponse.ENTER_PASSWORD_TO_SIGN_UP));

   if(nickname.length>20)
       return res.send(errResponse(baseResponse.NICKNAME_LENGTH_OVER));

    if(!phoneNum.match(/^[0-9]{3}[0-9]{4}[0-9]{4}$/))
        return res.send(response(baseResponse.PHONE_REGEX_WRONG));

    if(!regexPwd.test(pwd))
        return res.send(response(baseResponse.PASSWORD_REGEX_WRONG));

   const signUpRes=await userService.createUser(nickname,phoneNum,pwd);
   return res.send(signUpRes);
};

exports.withdraw=async function(req,res){
    const userIdFromJWT=req.verifiedToken.userId;
    const withdrawUserRes=await userService.updateUserStatus(userIdFromJWT);
    return res.send(withdrawUserRes);
};

exports.getUserInfo=async function(req,res){
    const userIdFromJWT=req.verifiedToken.userId;
    const userId=req.params.userId;
    if(userIdFromJWT!=userId)
        return res.send(errResponse(baseResponse.NOT_LOGIN_USER_ID));
    const userInfoRes=await userProvider.retrieveUserInfo(userIdFromJWT);
    return res.send(userInfoRes);
};

exports.updateUserInfo=async function(req,res){
    const userIdFromJWT=req.verifiedToken.userId;
    const userId=req.params.userId;
    const {profileImg,nickname,pwd,updatePwd}=req.body;
    if(userIdFromJWT!=userId)
        return res.send(errResponse(baseResponse.NOT_LOGIN_USER_ID));
    if(!profileImg)
        return res.send(errResponse(baseResponse.ENTER_IMG_URL_TO_UPDATE));
    if(!nickname)
        return res.send(errResponse(baseResponse.ENTER_NICKNAME_TO_UPDATE));
    if(nickname.length>20)
        return res.send(errResponse(baseResponse.NICKNAME_LENGTH_OVER));

    if(updatePwd) { //바꾸려는 비밀번호 있으면 비밀번호 변경까지 같이
        if (!pwd)
            return res.send(errResponse(baseResponse.ENTER_PWD_TO_USER_CHECK));
        if(!regexPwd.test(updatePwd))
            return res.send(response(baseResponse.PASSWORD_REGEX_WRONG));

        const updateUserInfoRes=await userService.updateAllUserInfo(userIdFromJWT,profileImg,nickname,pwd,updatePwd);
        return res.send(updateUserInfoRes);
    }
    else{ //아니면 프로필사진,닉네임만 변경되도록
        const updateUserInfoRes=await userService.updateUserInfo(userIdFromJWT,profileImg,nickname);
        return res.send(updateUserInfoRes);
    }
};

exports.postVerification=async function(req,res){
    const phoneNum=req.body.phoneNum;

    if(!phoneNum)
        return res.send(errResponse(baseResponse.ENTER_PHONE_NUMBER_TO_VERIFY));

    if(!phoneNum.match(/^[0-9]{3}[0-9]{4}[0-9]{4}$/))
        return res.send(response(baseResponse.PHONE_REGEX_WRONG));

    const createVerificationRes=await userService.createVerification(phoneNum);
    return res.send(createVerificationRes);
};

exports.verify=async function(req,res){
    const {phoneNum,verifyNum}=req.body;

    if(!phoneNum)
        return res.send(errResponse(baseResponse.ENTER_PHONE_NUMBER_TO_VERIFY));
    if(!verifyNum)
        return res.send(errResponse(baseResponse.ENTER_GIVEN_VERIFYING_NUMBER));

    const verifyPhoneNumRes=await userService.postVerification(phoneNum,verifyNum);
    return res.send(verifyPhoneNumRes);
};

exports.login=async function(req,res){
    const {phoneNum,pwd}=req.body; //휴대폰번호,비밀번호로 로그인
    if(!phoneNum)
        return res.send(errResponse(baseResponse.ENTER_PHONENUM_TO_SIGN_IN));
    if(!pwd)
        return res.send(errResponse(baseResponse.ENTER_PASSWORD_TO_SIGN_IN));

    if(!phoneNum.match(/^[0-9]{3}[0-9]{4}[0-9]{4}$/))
        return res.send(response(baseResponse.PHONE_REGEX_WRONG));

    if(!regexPwd.test(pwd))
        return res.send(response(baseResponse.PASSWORD_REGEX_WRONG));

    const signInRes=await userService.postSignIn(phoneNum,pwd);
    return res.send(signInRes);
};

exports.autoLogin=async function(req,res){
    const userIdFromJWT=req.verifiedToken.userId;
    return res.send(response(baseResponse.TOKEN_VERIFICATION_SUCCESS,{loginUserId:userIdFromJWT}));
};

exports.postReview=async function(req,res){
    const userIdFromJWT=req.verifiedToken.userId;
    const {wineId,rating,content,tagList}=req.body;
    if(!wineId)
        return res.send(errResponse(baseResponse.ENTER_WINE_ID));
    if(!rating)
        return res.send(errResponse(baseResponse.RATING_NULL));
    if(!content)
        return res.send(errResponse(baseResponse.REVIEW_CONTENT_NULL));
    if(content.length<20)
        return res.send(errResponse(baseResponse.REVIEW_CONTENT_LENGTH_WRONG));

    const postReviewRes=await userService.createReview(wineId,userIdFromJWT,rating,content,tagList);
    return res.send(postReviewRes);
};

exports.postSubscribe=async function(req,res){
    const userIdFromJWT=req.verifiedToken.userId;
    const wineId=req.body.wineId;
    if(!wineId)
        return res.send(errResponse(baseResponse.ENTER_WILLING_TO_SUBSCRIBE_WINE_ID));
    const postSubscribeRes=await userService.createSubscribe(userIdFromJWT,wineId);
    return res.send(postSubscribeRes);
};

exports.getUserSubscribeList=async function(req,res){
    const userIdFromJWT=req.verifiedToken.userId;
    const userSubscribeListRes=await userProvider.retrieveUserSubscribeList(userIdFromJWT);
    return res.send(userSubscribeListRes);
};

exports.postSearchKeyword=async function(req,res){
    const userIdFromJWT=req.verifiedToken.userId;

    const keyword=req.body.keyword;

    if(!keyword)
        return res.send(errResponse(baseResponse.SEARCH_KEYWORD_EMPTY));

    const postSearchRes=await userService.postSearchKeyword(userIdFromJWT,keyword);

    return res.send(postSearchRes);
};

exports.getUserSearched=async function(req,res){
    const userIdFromJWT=req.verifiedToken.userId;

    const getUserSearchedRes=await userProvider.retrieveSearchedList(userIdFromJWT);
    return res.send(getUserSearchedRes);
};

exports.patchSearchedList=async function(req,res){
    const userIdFromJWT=req.verifiedToken.userId;
    const searchId=req.query.searchId;

    if(!searchId) {
        const AllKeywordDeletion=await userService.updateAllSearchedKeyword(userIdFromJWT);
        return res.send(AllKeywordDeletion);
    }
    else{
        const keywordDeletion=await userService.updateSearchedKeyword(userIdFromJWT,searchId);
        return res.send(keywordDeletion);
    }
};

exports.getHotSearched=async function(req,res){
    const getHotSearchedRes=await userProvider.retrieveHotSearchedList();
    return res.send(getHotSearchedRes);
};

exports.getUserReviews=async function(req,res){
    const userIdFromJWT=req.verifiedToken.userId;
    const userId=req.params.userId;

    if(userIdFromJWT!=userId)
        return res.send(errResponse(baseResponse.NOT_LOGIN_USER_ID));
    const userReviewsRes=await userProvider.retrieveUserReviews(userIdFromJWT);
    return res.send(userReviewsRes);
};

exports.updateReview=async function(req,res){
    const userIdFromJWT=req.verifiedToken.userId;
    const reviewId=req.params.reviewId;
    const {rating,content,tagList}=req.body;

    if(!reviewId)
        return res.send(errResponse(baseResponse.ENTER_REIVEW_ID_TO_UPDATE));

    if(!rating)
        return res.send(errResponse(baseResponse.RATING_NULL));
    if(!content)
        return res.send(errResponse(baseResponse.REVIEW_CONTENT_NULL));
    if(content.length<20)
        return res.send(errResponse(baseResponse.REVIEW_CONTENT_LENGTH_WRONG));

    const updateReviewRes=await userService.updateReview(userIdFromJWT,reviewId,rating,content,tagList);
    return res.send(updateReviewRes);
};