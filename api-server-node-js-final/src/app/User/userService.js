const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const userProvider = require("./userProvider");
const userDao = require("./userDao");
const wineProvider = require("../Wine/wineProvider");
const wineDao = require("../Wine/wineDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");
const {insertKeyword} = require("./userDao");

const accountSid = secret_config.TWILIO_ACCOUNT_SID;
const authToken = secret_config.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

global.verifyDict = {};

// Service: Create, Update, Delete 비즈니스 로직 처리

exports.createUser = async function (nickname, phoneNum, pwd) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        //phoneNum 중복체크
        const phoneNumCheck = await userProvider.phoneNumCheck(phoneNum);
        if (phoneNumCheck.length > 0 && phoneNumCheck[0].status === "REGISTERED")
            return errResponse(baseResponse.ALREADY_SIGN_UP);

        if (phoneNumCheck.length > 0 && phoneNumCheck[0].status === "DELETED")
            return errResponse(baseResponse.WITHDRAWAL_ACCOUNT_PHONE_NUMBER);

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
        const randomVerificationNum = Math.floor(Math.random() * 9000) + 1000; //0000~9999사이의 랜덤값 생성
        verifyDict[phoneNum] = randomVerificationNum;
        console.log("verifyDict", verifyDict);

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
        if (phoneNum in verifyDict) {
            if (verifyDict[phoneNum] == verifyNum) {
                delete verifyDict[phoneNum];
                console.log("verifyDict", verifyDict);
                return response(baseResponse.VERIFY_SUCCESS);
            } else {
                console.log("verifyDict", verifyDict);
                return errResponse(baseResponse.VERIFY_FAIL);
            }
        } else {
            return errResponse(baseResponse.REQUEST_VERIFY_NUM_FIRST);
        }
    } catch (err) {
        logger.error(`App - postVerification Service error\n: ${err.message}`);
        return errResponse(baseResponse.SERVER_ERROR);
    }
};


exports.updateUserStatus = async function (userId, pwd, reasonId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        const userCheckRes = await userProvider.userStatusCheck(userId);
        if (userCheckRes[0].status === "DELETED")
            return errResponse(baseResponse.ALREADY_WITHDRAWN_USER);

        const hashedPassword = await crypto
            .createHash("sha512")
            .update(pwd)
            .digest("hex");

        const pwdCheck = await userProvider.passwordCheck(userId);
        if (pwdCheck[0].pwd !== hashedPassword)
            return errResponse(baseResponse.WRONG_PASSWORD);

        const updateUserStatusRes = await userDao.updateUserStatus(connection, userId, reasonId);
        connection.release();
        return response(baseResponse.USER_WITHDRAW_SUCCESS);
    } catch (err) {
        logger.error(`App - withdrawUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.postSignIn = async function (phoneNum, pwd) {
    try {
        const userCheck = await userProvider.phoneNumCheck(phoneNum);
        if (userCheck.length < 1)
            return errResponse(baseResponse.USER_NOT_EXIST);
        if (userCheck[0].status === "DELETED")
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

        const postReviewRes = await userDao.insertReview(connection, wineId, userId, rating, content);

        const insertedReviewId = postReviewRes.insertId;
        if (tagList) {
            for (let i = 0; i < tagList.length; i++) {
                const tagContent = tagList[i].tag;
                const insertTagRes = await userDao.insertTag(connection, insertedReviewId, userId, tagContent);
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


exports.createReport = async function (userId, reviewId, reasonId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        const reviewCheck = await userProvider.reviewStatusCheck(reviewId);
        if(reviewCheck[0].userId===userId)
            return errResponse(baseResponse.LOGIN_USER_REVIEW);
        if (reviewCheck[0].status === "DELETED")
            return errResponse(baseResponse.ALREADY_DELETED_REVIEW);

        const reviewReportCheck = await userProvider.reviewReportCheck(userId, reviewId);
        if (reviewReportCheck.length > 0 && reviewReportCheck[0].status === "ACCEPTED")
            return errResponse(baseResponse.ALREADY_REPORTED_REVIEW);

        const createReportRes = await userDao.insertReviewReport(connection, userId, reviewId, reasonId);
        return response(baseResponse.REPORT_SUCCESS);
    } catch (err) {
        logger.error(`App - postReviewReport Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};


exports.createSubscribe = async function (userId, wineId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        //찜하려는 와인 있는지 확인
        const wineCheckRes = await wineProvider.wineCheck(wineId);
        if (wineCheckRes.length < 1 || wineCheckRes[0].status === "DELETED")
            return errResponse(baseResponse.WINE_NOT_EXIST);

        //이미 찜 되어있는지 확인
        const subscribeCheckRes = await userDao.selectUserSubscribeCheck(connection, userId, wineId);
        if (subscribeCheckRes.length < 1) { //아예 구독이 되어있지 않은 경우
            const postSubscribeRes = await userDao.insertSubscribe(connection, userId, wineId);
            connection.release();
            return response(baseResponse.SUBSCRIBE_SUCCESS);
        } else {
            //status확인
            //status="Y"이면 다시 "N"으로 업데이트 해주기
            if (subscribeCheckRes[0].status === "Y") { //찜 해제
                const status = "N";
                const subscribeId = subscribeCheckRes[0].subscribeId;
                const updateSubscribeStatusRes = await userDao.updateSubscribeStatus(connection, subscribeId, status);
                connection.release();
                return response(baseResponse.UNSUBSCRIBE_SUCCESS);
            }
            //status="N"이면 다시 "Y"으로 업데이트 해주기
            if (subscribeCheckRes[0].status === "N") { //다시 찜 등록
                const status = "Y";
                const subscribeId = subscribeCheckRes[0].subscribeId;
                const updateSubscribeStatusRes = await userDao.updateSubscribeStatus(connection, subscribeId, status);
                connection.release();
                return response(baseResponse.SUBSCRIBE_SUCCESS);
            }
        }
    } catch (err) {
        logger.error(`App - postSubscribe Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};


exports.postSearchKeyword = async function (userId, keyword) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();

        //해당 키워드 검색 횟수 가져오기
        const searchCountRes = await userDao.selectSearchCount(connection, keyword);
        if (searchCountRes.length < 1) {//누군가 처음 검색하는 키워드의 경우
            const postSearchKeyword = await userDao.insertKeyword(connection, keyword);
        } else {
            //키워드 검색 횟수 1증가시켜주기
            const searchCount = searchCountRes[0].searchCount + 1;
            const updateSearchCount = await userDao.updateSearchCount(connection, searchCount, keyword);
        }

        //검색한 키워드가 사용자가 검색한 키워드 목록에 있는지 검사
        const keywordExistRow = await userDao.selectSearchedKeyword(connection, userId, keyword);
        if (keywordExistRow[0].length > 0) { //이미 검색한 키워드인 경우
            //해당 키워드 인덱스의 검색어 updatedAt 바꿔주기
            const searchId = keywordExistRow[0][0].searchId;
            let status = keywordExistRow[0][0].status;
            if (status === "DELETED") {
                status = "REGISTERED";
            }
            if (status === "REGISTERED") {
                status = "UPDATED";
            }
            const updateSearchKeywordRes = await userDao.updateSearchKeyword(connection, searchId, status);

            await connection.commit();
            return response(baseResponse.SUCCESS, {updatedSearchKeywordId: keywordExistRow[0][0].searchId});
        } else { //검색한 적 없는 키워드인 경우
            //Searched테이블에 추가
            const createSearchKeywordRes = await userDao.createSearchKeyword(connection, userId, keyword);
            await connection.commit();
            return response(baseResponse.SUCCESS, {insertSearchKeywordId: createSearchKeywordRes[0].insertId});
        }
    } catch (err) {
        logger.error(`App - createSearchKeyword Service error\n: ${err.message}`);
        await connection.rollback();
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
};

exports.updateAllSearchedKeyword = async function (userId) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();
        //전달받은 유저인덱스의 최근 검색 결과 전부 가져오기
        const searchedKeywordList = await userDao.selectAllSearchId(connection, userId);
        for (let i = 0; i < searchedKeywordList.length; i++) {
            const searchId = searchedKeywordList[i].searchId;
            const updateKeywordStatusRes = await userDao.updateKeywordStatus(connection, searchId);
        }
        await connection.commit();
        return response(baseResponse.DELETE_ALL_SEARCHED_KEYWORD_SUCCESS);
    } catch (err) {
        logger.error(`App - updateAllSearchKeyword Service error\n: ${err.message}`);
        await connection.rollback();
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
};

exports.updateSearchedKeyword = async function (userId, searchId) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();
        //활성화 되어있는 검색어인지,검색어 인덱스 로그인 유저의 검색어가 맞는지 확인
        const searchKeywordCheck = await userDao.selectSearchIdStatus(connection, userId, searchId);

        if (searchKeywordCheck.length < 1)
            return errResponse(baseResponse.NOT_LOGIN_USER_SEARCH);

        if (searchKeywordCheck[0].status === "DELETED")
            return errResponse(baseResponse.ALREADY_DELETED_SEARCH_KEYWORD);

        const updateKeywordStatusRes = await userDao.updateKeywordStatus(connection, searchId);
        console.log(`${searchId}번 검색어 삭제 완료`);

        await connection.commit();
        return response(baseResponse.SUCCESS, {deletedSearchKeywordId: searchId});
    } catch (err) {
        logger.error(`App - updateSearchKeyword Service error\n: ${err.message}`);
        await connection.rollback();
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
};

exports.updateReview = async function (userIdFromJWT, reviewId, rating, content, tagList) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();
        //로그인 유저의 리뷰가 맞는 지 확인
        const reviewUserCheck = await userDao.selectReviewUserCheck(connection, userIdFromJWT, reviewId);
        if (reviewUserCheck.length < 1)
            return errResponse(baseResponse.REVIEW_NOT_EXIST);
        if (reviewUserCheck[0].status === "DELETED")
            return errResponse(baseResponse.DELETED_REVIEW);

        const reviewUpdateArgs = [rating, content, reviewId];
        const updateReviewRes = await userDao.updateUserReview(connection, reviewUpdateArgs);
        console.log(updateReviewRes[0].changedRows);

        if (tagList) {
            console.log("tagList수정 진입");
            // const reviewTagIds=await wineDao.selectWineTagIds(connection,reviewId);
            // console.log(reviewTagIds.length);
            // if(reviewTagIds.length>0){
            //     for(let i=0;i<reviewTagIds.length;i++) { //기존에 있던 태그들 status값 "DELETED로 변경해줌"
            //         const tagId = reviewTagIds[i].tagId;
            //         const updateTagStatus=await userDao.updateReviewTags(connection,tagId);
            //     }
            // }
            // for(let i=0;i<tagList.length;i++){ //수정 시 들어온 태그들 전부 다시 삽입
            //     const tagContent = tagList[i].tag;
            //     const insertTagRes = await userDao.insertTag(connection, reviewId, userIdFromJWT, tagContent);
            // }
            const reviewTags = await wineDao.selectWineTags(connection, reviewId);
            const reviewTagIds = await wineDao.selectWineTagIds(connection, reviewId);
            const tags = [];
            const tagIds = [];
            for (let i = 0; i < reviewTags.length; i++) {
                tags.push(reviewTags[i].content);
                tagIds.push(reviewTagIds[i].tagId);
            }
            console.log("tags:", tags);
            console.log("tagIds:", tagIds);
            for (let i = 0; i < tagList.length; i++) {
                const tagContent = tagList[i].tag;
                if (tags.includes(tagContent)) {
                    const popId = tags.indexOf(tagContent);
                    tags.splice(popId, 1);
                    tagIds.splice(popId, 1);
                } else {
                    console.log("tag insert...");
                    const insertTagRes = await userDao.insertTag(connection, reviewId, userIdFromJWT, tagContent);
                }
            }
            console.log("tags-after:", tags);
            console.log("tagIds-after:", tagIds);
            if (tagIds.length > 0) {
                for (let i = 0; i < tagIds.length; i++) {
                    const tagId = tagIds[i];
                    const updateTagStatus = await userDao.updateReviewTags(connection, tagId);
                }
            }
        }

        await connection.commit();
        return response(baseResponse.SUCCESS)
    } catch (err) {
        logger.error(`App - updateReview Service error\n: ${err.message}`);
        await connection.rollback();
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
};

exports.updateReviewStatus = async function (userId, reviewId) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();
        const reviewUserCheck = await userDao.selectReviewUserCheck(connection, userId, reviewId);
        if (reviewUserCheck.length < 1)
            return errResponse(baseResponse.REVIEW_NOT_EXIST);
        if (reviewUserCheck[0].status === "DELETED")
            return errResponse(baseResponse.ALREADY_DELETED_REVIEW);

        const updateReviewStatus = await userDao.updateReviewStatus(connection, reviewId);
        await connection.commit();
        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`App - updateReviewStatus Service error\n: ${err.message}`);
        await connection.rollback();
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
};

exports.updateUserInfo = async function (userId, profileImg, nickname) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        //유효한 유저인지 확인
        const userCheckRes = await userProvider.userStatusCheck(userId);
        if (userCheckRes[0].status === "DELETED")
            return errResponse(baseResponse.WITHDRAWAL_ACCOUNT);

        const updateUserInfoRes = await userDao.updateUserInfo(connection, profileImg, nickname, userId);
        console.log(`${userId}번 유저 정보 변경 성공`);
        connection.release();
        return response(baseResponse.UPDATE_USER_INFO_SUCCESS);
    } catch (err) {
        logger.error(`App - updateUserInfo Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.updateAllUserInfo = async function (userId, profileImg, nickname, pwd, updatePwd) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        const userCheckRes = await userProvider.userStatusCheck(userId);
        if (userCheckRes[0].status === "DELETED")
            return errResponse(baseResponse.WITHDRAWAL_ACCOUNT);

        const hashedPassword = await crypto
            .createHash("sha512")
            .update(pwd)
            .digest("hex");

        const pwdCheck = await userProvider.passwordCheck(userId);
        if (pwdCheck[0].pwd !== hashedPassword)
            return errResponse(baseResponse.WRONG_PASSWORD);

        const hashedPwdToUpdate = await crypto
            .createHash("sha512")
            .update(updatePwd)
            .digest("hex");

        const updateUserInfoRes = await userDao.updateAllUserInfo(connection, profileImg, nickname, hashedPwdToUpdate, userId);
        console.log(`${userId}번 유저 정보 변경 성공`);
        connection.release();
        return response(baseResponse.UPDATE_USER_INFO_SUCCESS);
    } catch (err) {
        logger.error(`App - updateUserInfo Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};