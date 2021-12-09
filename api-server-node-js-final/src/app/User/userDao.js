exports.selectUserStatus = async function (connection, userId) {
    const selectUserStatusQuery = `
        SELECT status
        FROM User
        WHERE userId = ?;
    `;
    const [selectUserStatusQueryRow] = await connection.query(selectUserStatusQuery, userId);
    return selectUserStatusQueryRow;
};

exports.selectUserNickname = async function (connection, nickname) {
    const selectUserNicknameQuery = `
        SELECT userId
        FROM User
        WHERE nickname = ?;
    `;
    const [selectUserNicknameQueryRow] = await connection.query(selectUserNicknameQuery, nickname);
    return selectUserNicknameQueryRow;
};

exports.selectUserPhoneNum = async function (connection, phoneNum) {
    const selectUserPhoneNumQuery = `
        SELECT userId, status
        FROM User
        WHERE phoneNum = ?;
    `;
    const [selectUserPhoneNumQueryRow] = await connection.query(selectUserPhoneNumQuery, phoneNum);
    return selectUserPhoneNumQueryRow;
};

exports.selectUserPassword = async function (connection, userId) {
    const selectUserPasswordQuery = `
        SELECT pwd
        FROM User
        WHERE userId = ?;
    `;
    const [selectUserPasswordQueryRow] = await connection.query(selectUserPasswordQuery, userId);
    return selectUserPasswordQueryRow;
};

exports.insertUser = async function (connection, nickname, phoneNum, pwd) {
    const insertUserQuery = `
        INSERT INTO User (nickname, phoneNum, pwd) VALUE (?,?,?);
    `;
    const insertUserQueryRow = await connection.query(insertUserQuery, [nickname, phoneNum, pwd]);
    return insertUserQueryRow[0];
};

exports.selectUserInfo = async function (connection, userId) {
    const selectUserInfoQuery = `
        SELECT nickname, profileImg, phoneNum
        FROM User
        WHERE userId = ?;
    `;
    const [selectUserInfoQueryRow] = await connection.query(selectUserInfoQuery, userId);
    return selectUserInfoQueryRow;
};


exports.insertReview = async function (connection, wineId, userId, rating, content) {
    const insertReviewQuery = `
        INSERT INTO Review
        VALUES (null, ?, ?, ?, ?, default, default, default);
    `;
    const insertReviewQueryRow = await connection.query(insertReviewQuery, [wineId, userId, rating, content]);
    return insertReviewQueryRow[0];
};

exports.insertTag = async function (connection, reviewId, userId, tagContent) {
    const insertTagQuery = `
        INSERT INTO Tag
        VALUES (null, ?, ?, ?, default, default, default);
    `;
    const insertTagQueryRow = await connection.query(insertTagQuery, [reviewId, userId, tagContent]);
    return insertTagQueryRow;
};

exports.selectUserSubscribeCheck = async function (connection, userId, wineId) {
    const selectUserSubscribeCheckQuery = `
        SELECT subscribeId, status
        FROM Subscribe
        WHERE userId = ?
          AND wineId = ?;
    `;
    const [selectUserSubscribeCheckQueryRow] = await connection.query(selectUserSubscribeCheckQuery, [userId, wineId]);
    return selectUserSubscribeCheckQueryRow;
};

exports.insertSubscribe = async function (connection, userId, wineId) {
    const insertSubscribeQuery = `
        INSERT INTO Subscribe
        VALUES (null, ?, ?, default, default, default);
    `;
    const insertSubscribeQueryRow = await connection.query(insertSubscribeQuery, [userId, wineId]);
    return insertSubscribeQueryRow;
};

exports.updateSubscribeStatus = async function (connection, subscribeId, status) {
    const updateSubscribeStatusQuery = `
        UPDATE Subscribe
        SET status=?
        WHERE subscribeId = ?;
    `;
    const updateSubscribeStatusQueryRow = await connection.query(updateSubscribeStatusQuery, [status, subscribeId]);
    return updateSubscribeStatusQueryRow;
};

exports.selectSubscribeCount = async function (connection, userId) {
    const selectSubscribeCountQuery = `
        SELECT count(subscribeId) as subscribeNum
        FROM Subscribe
        WHERE userId = ?
          and status = "Y";
    `;
    const [selectSubscribeCountQueryRow] = await connection.query(selectSubscribeCountQuery, userId);
    return selectSubscribeCountQueryRow;
};

exports.selectUserSubscribeList = async function (connection, userId) {
    const selectUserSubscribeListQuery = `
        SELECT wineId,
               wineImg,
               wineName,
               country,
               region,
               quantity,
               price,
               CASE
                   WHEN (select status from Subscribe where wineId = Wine.wineId and userId = ?) = "Y"
                       THEN "Y"
                   ELSE "N"
                   END                      AS userSubscribeStatus,
               (select count(subscribeId)
                from Subscribe
                where Subscribe.status = "Y"
                  and wineId = Wine.wineId) as subscribeCount,
               (select count(reviewId)
                from Review
                where Review.status = "REGISTERED"
                  and wineId = Wine.wineId) as reviewCount
        FROM Wine
        WHERE wineId IN (select wineId from Subscribe where userId = ? and status = "Y");
    `;
    const [selectUserSubscribeListQueryRow] = await connection.query(selectUserSubscribeListQuery, [userId, userId]);
    return selectUserSubscribeListQueryRow;
};

exports.selectSearchedKeyword = async function (connection, userId, keyword) {
    const selectSearchedKeywordQuery = `
        SELECT searchId, keyword, status
        FROM Searched
        WHERE userId = ?
          AND keyword = ?;
    `;
    const selectSearchedKeywordQueryRow = await connection.query(selectSearchedKeywordQuery, [userId, keyword]);
    return selectSearchedKeywordQueryRow;
};

exports.updateSearchKeyword = async function (connection, searchId, status) {
    const updateSearchKeywordQuery = `
        UPDATE Searched
        SET status=?
        WHERE searchId = ?;
    `;
    const updateSearchKeywordQueryRow = await connection.query(updateSearchKeywordQuery, [status, searchId]);
    return updateSearchKeywordQueryRow;
};

exports.createSearchKeyword = async function (connection, userId, keyword) {
    const createSearchKeywordQuery = `
        INSERT INTO Searched
        VALUES (null, ?, ?, default, default, default);
    `;
    const createSearchKeywordQueryRow = await connection.query(createSearchKeywordQuery, [userId, keyword]);
    return createSearchKeywordQueryRow;
};

exports.selectSearchCount = async function (connection, keyword) {
    const selectSearchCountQuery = `
        SELECT searchCount
        FROM SearchCount
        where keyword = ?;
    `;
    const [selectSearchCountQueryRow] = await connection.query(selectSearchCountQuery, keyword);
    return selectSearchCountQueryRow;
};

exports.insertKeyword = async function (connection, keyword) {
    const insertKeywordQuery = `
        INSERT INTO SearchCount (keyword) VALUE (?);
    `;
    const insertKeywordQueryRow = await connection.query(insertKeywordQuery, keyword);
    return insertKeywordQueryRow;
};

exports.updateSearchCount = async function (connection, searchCount, keyword) {
    const updateSearchCountQuery = `
        UPDATE SearchCount
        SET searchCount=?
        WHERE keyword = ?;
    `;
    const updateSearchCountQueryRow = await connection.query(updateSearchCountQuery, [searchCount, keyword]);
    return updateSearchCountQueryRow;
};

exports.selectSearchedList = async function (connection, userId) {
    const selectSearchedListQuery = `
        SELECT searchId, keyword
        FROM Searched
        WHERE userId = ?
          AND (status = 'REGISTERED' OR status = 'UPDATED')
        ORDER BY updatedAt DESC LIMIT 5;
    `;
    const [selectSearchedListQueryRow] = await connection.query(selectSearchedListQuery, userId);
    return selectSearchedListQueryRow;
};

exports.selectAllSearchId = async function (connection, userId) {
    const selectAllSearchIdQuery = `
        SELECT searchId
        FROM Searched
        WHERE userId = ? AND status = "REGISTERED"
           OR status = "UPDATED";
    `;
    const [selectAllSearchIdQueryRow] = await connection.query(selectAllSearchIdQuery, userId);
    return selectAllSearchIdQueryRow;
};

exports.updateKeywordStatus = async function (connection, searchId) {
    const updateKeywordStatusQuery = `
        UPDATE Searched
        SET status="DELETED"
        WHERE searchId = ?;
    `;
    const updateKeywordStatusQueryRow = await connection.query(updateKeywordStatusQuery, searchId);
    return updateKeywordStatusQueryRow;
};

exports.selectSearchIdStatus = async function (connection, userId, searchId) {
    const selectSearchIdStatusQuery = `
        SELECT searchId, status
        FROM Searched
        WHERE userId = ?
          AND searchId = ?;
    `;
    const [selectSearchIdStatusQueryRow] = await connection.query(selectSearchIdStatusQuery, [userId, searchId]);
    return selectSearchIdStatusQueryRow;
};

exports.selectHotSearched = async function (connection) {
    const selectHotSearchedQuery = `
        SELECT keyword
        FROM SearchCount
        ORDER BY searchCount DESC LIMIT 10;
    `;
    const [selectHotSearchedQueryRow] = await connection.query(selectHotSearchedQuery);
    return selectHotSearchedQueryRow;
};

exports.selectUserReviewIds = async function (connection, userId) {
    const selectUserReviewsQuery = `
        SELECT reviewId
        FROM Review
        WHERE userId = ?
          AND status!="DELETED";
    `;
    const [selectUserReviewsQueryRow] = await connection.query(selectUserReviewsQuery, userId);
    return selectUserReviewsQueryRow;
};

exports.selectReviewUserCheck = async function (connection, userId, reviewId) {
    const selectReviewUserCheckQuery = `
        SELECT status
        FROM Review
        WHERE userId = ?
          AND reviewId = ?;
    `;
    const [selectReviewUserCheckQueryRow] = await connection.query(selectReviewUserCheckQuery, [userId, reviewId]);
    return selectReviewUserCheckQueryRow;
};

exports.selectReviewStatus = async function(connection,reviewId){
    const selectReviewStatusQuery=`
        SELECT userId,status
        FROM Review
        WHERE reviewId=?;
    `;
    const [selectReviewStatusQueryRow]=await connection.query(selectReviewStatusQuery,reviewId);
    return selectReviewStatusQueryRow;
};

exports.updateUserReview = async function (connection, reviewUpdateArgs) {
    const updateUserReviewQuery = `
        UPDATE Review
        SET rating=?,
            content=?
        WHERE reviewId = ?;
    `;
    const updateUserReviewQueryRow = await connection.query(updateUserReviewQuery, reviewUpdateArgs);
    return updateUserReviewQueryRow;
};

exports.updateReviewTags = async function (connection, tagId) {
    const updateReviewTagsQuery = `
        UPDATE Tag
        SET status="DELETED"
        WHERE tagId = ?;
    `;
    const updateReviewTagsQueryRow = await connection.query(updateReviewTagsQuery, tagId);
    return updateReviewTagsQueryRow;
};

exports.updateReviewStatus=async function(connection,reviewId){
    const updateReviewStatusQuery=`
        UPDATE Review SET status="DELETED" WHERE reviewId=?;
    `;
    const updateReviewStatusQueryRow=await connection.query(updateReviewStatusQuery,reviewId);
    return updateReviewStatusQueryRow;
};

exports.updateUserInfo = async function (connection, profileImg, nickname, userId) {
    const updateUserInfoQuery = `
        UPDATE User
        SET profileImg=?,
            nickname=?
        WHERE userId = ?;
    `;
    const updateUserInfoQueryRow = await connection.query(updateUserInfoQuery, [profileImg, nickname, userId]);
    return updateUserInfoQueryRow;
};

exports.updateAllUserInfo = async function (connection, profileImg, nickname, hashedPwdToUpdate, userId) {
    const updateAllUserInfoQuery = `
        UPDATE User
        SET profileImg=?,
            nickname=?,
            pwd=?
        WHERE userId = ?;
    `;
    const updateAllUserInfoQueryRow = await connection.query(updateAllUserInfoQuery, [profileImg, nickname, hashedPwdToUpdate, userId]);
    return updateAllUserInfoQueryRow;
};

exports.updateUserStatus = async function (connection, userId, reasonId) {
    const updateUserStatusQuery = `
        UPDATE User
        SET status="DELETED",
            withdrawReason=?
        WHERE userId = ?;
    `;
    const updateUserStatusQueryRow = await connection.query(updateUserStatusQuery, [reasonId, userId]);
    return updateUserStatusQueryRow;
};

exports.insertReviewReport=async function(connection,userId,reviewId,reasonId){
    const insertReviewReportQuery=`
        INSERT INTO ReviewReport (userId,reviewId,reasonId) VALUE (?,?,?);
    `;
    const insertReviewReportQueryRow=await connection.query(insertReviewReportQuery,[userId,reviewId,reasonId]);
    return insertReviewReportQueryRow;
};

exports.selectReviewReport=async function(connection,userId,reviewId){
    const selectReviewReportQuery=`
        SELECT status
        FROM ReviewReport
        WHERE userId=? AND reviewId=?;
    `;
    const [selectReviewReportQueryRow]=await connection.query(selectReviewReportQuery,[userId,reviewId]);
    return selectReviewReportQueryRow;
};