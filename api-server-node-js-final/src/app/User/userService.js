const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const userProvider = require("./userProvider");
const userDao = require("./userDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");

const accountSid = secret_config.TWILIO_ACCOUNT_SID;
const authToken = secret_config.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

// Service: Create, Update, Delete 비즈니스 로직 처리

exports.createUser=async function(nickname,phoneNum,pwd){
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        //nickname,phoneNum 중복체크
        const phoneNumCheck=await userProvider.phoneNumCheck(phoneNum);
        if(phoneNumCheck.length>0)
            return errResponse(baseResponse.ALREADY_SIGN_UP);

        const nicknameCheck = await userProvider.nicknameCheck(nickname);
        if(nicknameCheck.length>0)
            return errResponse(baseResponse.NICKNAME_ALREADY_EXIST);

        //비밀번호 암호화
        const hashedPassword = await crypto
            .createHash("sha512")
            .update(pwd)
            .digest("hex");

        const createUserRes=await userDao.insertUser(connection,nickname,phoneNum,hashedPassword);

        connection.release();
        return response(baseResponse.SUCCESS,{signUpUserId:createUserRes.insertId});
    }
    catch(err){
        logger.error(`createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.createVerification = async function (phoneNum) {
    try {
        global.randomVerificationNumArray = [];
        global.verifiedPhoneNumArray = [];

        verifiedPhoneNumArray.push(phoneNum);
        const randomVerificationNum = Math.floor(Math.random() * 9000) + 1000; //0000~9999사이의 랜덤값 생성
        randomVerificationNumArray.push(randomVerificationNum);

        client.messages
            .create({
                body: `winnus 가입을 위해 인증번호를 입력해주세요- 인증번호: ${randomVerificationNum}`,
                from: '+13159618693',
                to: '+82'+phoneNum
            })
            .then(message => console.log(message.sid));

        return response(baseResponse.SEND_VERIFICATION_MSG_SUCCESS);
    } catch (err) {
        logger.error(`App - createVerification Service error\n: ${err.message}`);
        return errResponse(baseResponse.FAIL_TO_SEND_VERIFICATION_MSG);
    }
};