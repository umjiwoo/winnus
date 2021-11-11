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

exports.selectUserSubscribeCheck=async function(connection,userId,wineId){
    const selectUserSubscribeCheckQuery=`
        SELECT subscribeId,status FROM Subscribe WHERE userId=? AND wineId=?;
    `;
    const [selectUserSubscribeCheckQueryRow]=await connection.query(selectUserSubscribeCheckQuery,[userId,wineId]);
    return selectUserSubscribeCheckQueryRow;
};

exports.insertSubscribe=async function(connection,userId,wineId){
    const insertSubscribeQuery=`
        INSERT INTO Subscribe VALUES (null,?,?,default,default,default);
    `;
    const insertSubscribeQueryRow=await connection.query(insertSubscribeQuery,[userId,wineId]);
    return insertSubscribeQueryRow;
};

exports.updateSubscribeStatus=async function(connection,subscribeId,status){
    const updateSubscribeStatusQuery=`
        UPDATE Subscribe SET status=? WHERE subscribeId=?;
    `;
    const updateSubscribeStatusQueryRow=await connection.query(updateSubscribeStatusQuery,[status,subscribeId]);
    return updateSubscribeStatusQueryRow;
};

exports.selectSubscribeCount=async function(connection,userId){
    const selectSubscribeCountQuery=`
        SELECT count(subscribeId) as subscribeNum FROM Subscribe WHERE userId=?;
    `;
    const [selectSubscribeCountQueryRow]=await connection.query(selectSubscribeCountQuery,userId);
    return selectSubscribeCountQueryRow;
};

exports.selectUserSubscribeList=async function(connection,userId){
    const selectUserSubscribeListQuery=`
        SELECT wineId,wineImg,wineName,country,region,quantity,price,
               (select count(subscribeId) from Subscribe where wineId=Wine.wineId and status="Y") as subscribeCount,
               (select count(reviewId) from Review where wineId=Wine.wineId) as reviewCount
        FROM Wine
        WHERE wineId IN (select wineId from Subscribe where userId=? and status="Y");
    `;
    const [selectUserSubscribeListQueryRow]=await connection.query(selectUserSubscribeListQuery,userId);
    return selectUserSubscribeListQueryRow;
};