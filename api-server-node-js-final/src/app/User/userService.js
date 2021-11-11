const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const userProvider = require("./userProvider");
const userDao = require("./userDao");
const wineProvider = require("../Wine/wineProvider");
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

exports.createUser = async function (nickname, phoneNum, pwd) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        //nickname,phoneNum 중복체크
        const phoneNumCheck = await userProvider.phoneNumCheck(phoneNum);
        if (phoneNumCheck.length > 0 && phoneNumCheck[0].status === "REGISTERED")
            return errResponse(baseResponse.ALREADY_SIGN_UP);

        if (phoneNumCheck.length > 0 && phoneNumCheck[0].status === "WITHDRAWN")
            return errResponse(baseResponse.WITHDRAWAL_ACCOUNT);

        const nicknameCheck = await userProvider.nicknameCheck(nickname);
        if (nicknameCheck.length > 0)
            return errResponse(baseResponse.NICKNAME_ALREADY_EXIST);

        //비밀번호 암호화
        const hashedPassword = await crypto
            .createHash("sha512")
            .update(pwd)
            .digest("hex");

        const createUserRes = await userDao.insertUser(connection, nickname, phoneNum, hashedPassword);

        connection.release();
        return response(baseResponse.SUCCESS, {signUpUserId: createUserRes.insertId});
    } catch (err) {
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
                to: '+82' + phoneNum
            })
            .then(message => console.log(message.sid));

        return response(baseResponse.SEND_VERIFICATION_MSG_SUCCESS);
    } catch (err) {
        logger.error(`App - createVerification Service error\n: ${err.message}`);
        return errResponse(baseResponse.FAIL_TO_SEND_VERIFICATION_MSG);
    }
};

exports.postVerification = async function (phoneNum, verifyNum) {
    try {
        const givenPhoneNum = phoneNum;
        const givenVerifyNum = verifyNum;//인증을 위해 다시 요청한 정보들
        const existPhoneNum = verifiedPhoneNumArray[0];
        const existVerifyNum = randomVerificationNumArray[0];//문자 전송 시 저장해놨던 정보들

        if (givenPhoneNum === existPhoneNum && givenVerifyNum === existVerifyNum) {
            verifiedPhoneNumArray.pop();
            randomVerificationNumArray.pop();
            return response(baseResponse.VERIFY_SUCCESS);
        } else {
            return errResponse(baseResponse.VERIFY_FAIL);
        }
    } catch (err) {
        logger.error(`App - postVerification Service error\n: ${err.message}`);
        return errResponse(baseResponse.REQUEST_VERIFY_NUM_FIRST);
    }
};

exports.postSignIn = async function (phoneNum, pwd) {
    try {
        const userCheck = await userProvider.phoneNumCheck(phoneNum);
        if (userCheck.length < 1)
            return errResponse(baseResponse.USER_NOT_EXIST);
        if (userCheck[0].status === "WITHDRAWN")
            return errResponse(baseResponse.WITHDRAWAL_ACCOUNT);

        const hashedPassword = await crypto
            .createHash("sha512")
            .update(pwd)
            .digest("hex");

        const loginUserId = userCheck[0].userId;
        const passwordCheckRes = await userProvider.passwordCheck(loginUserId);

        if (passwordCheckRes[0].pwd !== hashedPassword)
            return errResponse(baseResponse.SIGN_IN_PASSWORD_WRONG);

        let token = await jwt.sign(
            {userId: loginUserId,},
            secret_config.jwtsecret,
            {
                expiresIn: "10d",
                subject: "User",
            }
        );

        return response(baseResponse.SUCCESS, {'userId': loginUserId, 'jwt': token});
    } catch (err) {
        logger.error(`App - postSignIn Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.createReview = async function (wineId, userId, rating, content, tagList) {
    //리뷰 작성 시 태그 있으면 Tag 테이블에도 추가되게끔하기
    //Tag에 필요한 컬럼->reviewId,userId,content
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();
        //리뷰 작성 가능한 유저인지
        const userStatusCheckRes = await userProvider.userStatusCheck(userId);
        if (userStatusCheckRes.length < 1)
            return errResponse(baseResponse.USER_NOT_EXIST);
        if (userStatusCheckRes[0].status === "WITHDRAWN")
            return errResponse(baseResponse.WITHDRAWAL_ACCOUNT);
        //리뷰 작성 가능한 상태의 와인인지
        const wineCheckRes = await wineProvider.wineCheck(wineId);
        if (wineCheckRes.length < 1 || wineCheckRes[0].status === "DELETED")
            return errResponse(baseResponse.WINE_NOT_EXIST);

        const postReviewRes=await userDao.insertReview(connection,wineId,userId,rating,content);

        const insertedReviewId=postReviewRes.insertId;
        if(tagList){
            for(let i=0;i<tagList.length;i++){
                const tagContent=tagList[i].tag;
                const insertTagRes=await userDao.insertTag(connection,insertedReviewId,userId,tagContent);
            }
        }

        await connection.commit();
        return response(baseResponse.POST_REVIEW_SUCCESS);
    } catch (err) {
        await connection.rollback();
        logger.error(`App - postReview Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
};

exports.createSubscribe=async function(userId,wineId){
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        //찜하려는 와인 있는지 확인
        const wineCheckRes=await wineProvider.wineCheck(wineId);
        if(wineCheckRes.length<1 || wineCheckRes[0].status==="DELETED")
            return errResponse(baseResponse.WINE_NOT_EXIST);

        //이미 찜 되어있는지 확인
        const subscribeCheckRes=await userDao.selectUserSubscribeCheck(connection,userId,wineId);
        if(subscribeCheckRes.length<1){ //아예 구독이 되어있지 않은 경우
            const postSubscribeRes=await userDao.insertSubscribe(connection,userId,wineId);
            connection.release();
            return response(baseResponse.SUBSCRIBE_SUCCESS);
        }
        else{
            //status확인
            //status="Y"이면 다시 "N"으로 업데이트 해주기
            if(subscribeCheckRes[0].status==="Y"){ //찜 해제
                const status="N";
                const subscribeId=subscribeCheckRes[0].subscribeId;
                const updateSubscribeStatusRes=await userDao.updateSubscribeStatus(connection,subscribeId,status);
                connection.release();
                return response(baseResponse.UNSUBSCRIBE_SUCCESS);
            }
            //status="N"이면 다시 "Y"으로 업데이트 해주기
            if(subscribeCheckRes[0].status==="N"){ //다시 찜 등록
                const status="Y";
                const subscribeId=subscribeCheckRes[0].subscribeId;
                const updateSubscribeStatusRes=await userDao.updateSubscribeStatus(connection,subscribeId,status);
                connection.release();
                return response(baseResponse.SUBSCRIBE_SUCCESS);
            }
        }
    }
    catch(err){
        logger.error(`App - postSubscribe Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};