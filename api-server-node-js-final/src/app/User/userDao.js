exports.selectUserNickname=async function(connection,nickname){
    const selectUserNicknameQuery=`
        SELECT userId FROM User WHERE nickname=?;
    `;
    const [selectUserNicknameQueryRow]=await connection.query(selectUserNicknameQuery,nickname);
    return selectUserNicknameQueryRow;
};

exports.selectUserPhoneNum=async function(connection,phoneNum){
    const selectUserPhoneNumQuery=`
        SELECT userId,status FROM User WHERE phoneNum=?;
    `;
    const [selectUserPhoneNumQueryRow]=await connection.query(selectUserPhoneNumQuery,phoneNum);
    return selectUserPhoneNumQueryRow;
};

exports.selectUserPassword=async function(connection,userId){
    const selectUserPasswordQuery=`
        SELECT pwd FROM User WHERE userId=?;
    `;
    const [selectUserPasswordQueryRow]=await connection.query(selectUserPasswordQuery,userId);
    return selectUserPasswordQueryRow;
};

exports.insertUser=async function(connection,nickname,phoneNum,pwd){
    const insertUserQuery=`
        INSERT INTO User (nickname,phoneNum,pwd) VALUE (?,?,?);
    `;
    const insertUserQueryRow=await connection.query(insertUserQuery,[nickname,phoneNum,pwd]);
    return insertUserQueryRow[0];
};