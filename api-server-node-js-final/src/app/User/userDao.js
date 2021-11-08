exports.selectUserStatus=async function(connection,userId){
    const selectUserStatusQuery=`
        SELECT status FROM User WHERE userId=?;
    `;
    const [selectUserStatusQueryRow]=await connection.query(selectUserStatusQuery,userId);
    return selectUserStatusQueryRow;
};

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

exports.insertReview=async function(connection,wineId,userId,rating,content){
    const insertReviewQuery=`
        INSERT INTO Review VALUES (null,?,?,?,?,default,default,default);
    `;
    const insertReviewQueryRow=await connection.query(insertReviewQuery,[wineId,userId,rating,content]);
    return insertReviewQueryRow[0];
};

exports.insertTag=async function(connection,reviewId,userId,tagContent){
    const insertTagQuery=`
        INSERT INTO Tag VALUES (null,?,?,?,default,default,default);
    `;
    const insertTagQueryRow=await connection.query(insertTagQuery,[reviewId,userId,tagContent]);
    return insertTagQueryRow;
};