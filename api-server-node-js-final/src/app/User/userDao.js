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

exports.selectSearchedKeyword=async function(connection, userId, keyword) {
    const selectSearchedKeywordQuery = `
        SELECT searchId, keyword, status
        FROM Searched
        WHERE userId = ?
          AND keyword = ?;
    `;
    const selectSearchedKeywordQueryRow = await connection.query(selectSearchedKeywordQuery, [userId, keyword]);
    return selectSearchedKeywordQueryRow;
};

exports.updateSearchKeyword=async function(connection, searchId, status) {
    const updateSearchKeywordQuery = `
        UPDATE Searched
        SET status=?
        WHERE searchId = ?;
    `;
    const updateSearchKeywordQueryRow = await connection.query(updateSearchKeywordQuery, [status, searchId]);
    return updateSearchKeywordQueryRow;
};

exports.createSearchKeyword=async function(connection, userId, keyword) {
    const createSearchKeywordQuery = `
        INSERT INTO Searched
        VALUES (null, ?, ?, default, default, default);
    `;
    const createSearchKeywordQueryRow = await connection.query(createSearchKeywordQuery, [userId, keyword]);
    return createSearchKeywordQueryRow;
};

exports.selectSearchCount=async function(connection,keyword){
    const selectSearchCountQuery=`
        SELECT searchCount FROM SearchCount where keyword=?;
    `;
    const [selectSearchCountQueryRow]=await connection.query(selectSearchCountQuery,keyword);
    return selectSearchCountQueryRow;
};

exports.insertKeyword=async function(connection,keyword){
    const insertKeywordQuery=`
        INSERT INTO SearchCount (keyword) VALUE (?);
    `;
    const insertKeywordQueryRow=await connection.query(insertKeywordQuery,keyword);
    return insertKeywordQueryRow;
};

exports.updateSearchCount=async function(connection,searchCount,keyword){
    const updateSearchCountQuery=`
        UPDATE SearchCount SET searchCount=? WHERE keyword=?;
    `;
    const updateSearchCountQueryRow=await connection.query(updateSearchCountQuery,[searchCount,keyword]);
    return updateSearchCountQueryRow;
};

exports.selectSearchedList=async function(connection,userId){
    const selectSearchedListQuery = `
        SELECT searchId, keyword
        FROM Searched
        WHERE userId = ?
            AND (status = 'REGISTERED' OR status='UPDATED')
        ORDER BY updatedAt DESC
        LIMIT 5;
    `;
    const [selectSearchedListQueryRow] = await connection.query(selectSearchedListQuery, userId);
    return selectSearchedListQueryRow;
};

exports.selectAllSearchId=async function(connection, userId) {
    const selectAllSearchIdQuery = `
        SELECT searchId
        FROM Searched
        WHERE userId = ? AND status="REGISTERED" OR status="UPDATED";
    `;
    const [selectAllSearchIdQueryRow] = await connection.query(selectAllSearchIdQuery, userId);
    return selectAllSearchIdQueryRow;
};

exports.updateKeywordStatus=async function(connection, searchId) {
    const updateKeywordStatusQuery = `
        UPDATE Searched
        SET status="DELETED"
        WHERE searchId = ?;
    `;
    const updateKeywordStatusQueryRow = await connection.query(updateKeywordStatusQuery, searchId);
    return updateKeywordStatusQueryRow;
};

exports.selectSearchIdStatus=async function(connection,userId,searchId){
    const selectSearchIdStatusQuery=`
        SELECT searchId,status
        FROM Searched
        WHERE userId=? AND searchId=?;
    `;
    const [selectSearchIdStatusQueryRow]=await connection.query(selectSearchIdStatusQuery,[userId,searchId]);
    return selectSearchIdStatusQueryRow;
};

exports.selectHotSearched=async function(connection){
    const selectHotSearchedQuery=`
        SELECT keyword
        FROM SearchCount
        ORDER BY searchCount DESC
        LIMIT 10;
    `;
    const [selectHotSearchedQueryRow]=await connection.query(selectHotSearchedQuery);
    return selectHotSearchedQueryRow;
};

exports.selectUserReviewIds=async function(connection,userId){
    const selectUserReviewsQuery=`
        SELECT reviewId
        FROM Review
        WHERE userId=? AND status!="DELETED";
    `;
    const [selectUserReviewsQueryRow]=await connection.query(selectUserReviewsQuery,userId);
    return selectUserReviewsQueryRow;
};