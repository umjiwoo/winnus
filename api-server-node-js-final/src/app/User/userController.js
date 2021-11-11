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