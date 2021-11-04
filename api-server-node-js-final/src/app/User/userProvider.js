const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const userDao = require("./userDao");

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