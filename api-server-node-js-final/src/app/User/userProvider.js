const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const userDao = require("./userDao");

const {response,errResponse} = require("../../../config/response");
const baseResponse = require("../../../config/baseResponseStatus");

// Provider: Read 비즈니스 로직 처리

exports.nicknameCheck=async function(nickname){
    const connection=await pool.getConnection(async (conn) => conn);
    const nicknameCheckRes=await userDao.selectUserNickname(connection,nickname);
    connection.release();
    return nicknameCheckRes;
};

exports.phoneNumCheck=async function(phoneNum){
    const connection=await pool.getConnection(async (conn) => conn);
    const phoneNumCheckRes=await userDao.selectUserPhoneNum(connection,phoneNum);
    connection.release();
    return phoneNumCheckRes;
};

exports.passwordCheck=async function(userId){
    const connection=await pool.getConnection(async (conn) => conn);
    const passwordCheckRes=await userDao.selectUserPassword(connection,userId);
    connection.release();
    return passwordCheckRes;
};

exports.userStatusCheck=async function(userId){
    const connection=await pool.getConnection(async (conn) => conn);
    const userStatusCheckRes=await userDao.selectUserStatus(connection,userId);
    connection.release();
    return userStatusCheckRes;
};

exports.retrieveUserSubscribeList=async function(userId){
    const connection=await pool.getConnection(async (conn) => conn);
    const subscribeCount=await userDao.selectSubscribeCount(connection,userId);
    const userSubscribeList=await userDao.selectUserSubscribeList(connection,userId);
    connection.release();
    return response(baseResponse.SUCCESS,subscribeCount.concat({subscribeList:userSubscribeList}));
};