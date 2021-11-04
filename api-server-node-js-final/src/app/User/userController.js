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

