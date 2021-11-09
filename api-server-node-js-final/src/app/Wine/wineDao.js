exports.selectWineList=async function(connection){
    const selectWineListQuery=`
        SELECT wineId,wineImg,wineName,price FROM Wine ORDER BY clickCount;
    `;
    const [selectWineListQueryRow]=await connection.query(selectWineListQuery);
    return selectWineListQueryRow;
};

exports.selectWineListByType=async function(connection,type){
    const selectWineListByTypeQuery=`
        SELECT wineId,wineImg,wineName,price FROM Wine
        WHERE type=?
        ORDER BY clickCount;
    `;
    const [selectWineListByTypeQueryRow]=await connection.query(selectWineListByTypeQuery,type);
    return selectWineListByTypeQueryRow;
};

exports.selectWineInfo=async function(connection,wineId){
    const selectWineInfoQuery=`
        SELECT wineImg,wineName,inEnglish,country,region,quantity,productionYear,price,
            sweetness,acidity,body,tannin,
            taste,
            Wine.type as typeId,
            (select type from TypeCategory where typeId=Wine.type) as type,
            variety,
            (select ROUND(avg(rating),2) from Review where wineId=Wine.wineId) as rating,
            (select count(reviewId) from Review where wineId=Wine.wineId) as reviewNum
        FROM Wine
        WHERE wineId=?;
    `;
    const [selectWineInfoQueryRow]=await connection.query(selectWineInfoQuery,wineId);
    return selectWineInfoQueryRow;
};

exports.selectWineFlavor=async function(connection,wineId){
    const selectWineFlavorQuery=`
        SELECT flavor 
        FROM SubFlavorCategory
        WHERE subCategoryId in (SELECT subCategoryId FROM Flavor WHERE wineId=?);
    `;
    const [selectWineFlavorQueryRow]=await connection.query(selectWineFlavorQuery,wineId);
    return selectWineFlavorQueryRow;
};

exports.selectPairingFood=async function(connection,wineId){
    const selectPairingFoodQuery=`
        SELECT food 
        From FoodCategory 
        WHERE foodCategoryId IN (SELECT foodCategoryId FROM FoodPairing WHERE wineId=?);
    `;
    const [selectPairingFoodQueryRow]=await connection.query(selectPairingFoodQuery,wineId);
    return selectPairingFoodQueryRow;
};

exports.selectWineReviewLimit3=async function(connection,wineId){
    const selectWineReviewLimit3Query=`
        SELECT 
               rating,content,
               (select DATE_FORMAT(createdAt,'%Y.%m.%d')) as createdAt,
               (select nickname from User where userId=Review.userId) as userName
        FROM Review
        WHERE wineId=?
        ORDER BY createdAt DESC
        LIMIT 3;
    `;
    const [selectWineReviewLimit3QueryRow]=await connection.query(selectWineReviewLimit3Query,wineId);
    return selectWineReviewLimit3QueryRow;
};

exports.selectBestWineListByType=async function(connection,wineType,wineId){
    const selectBestWineListByTypeQuery=`
        SELECT wineId,wineImg,wineName,price
        FROM Wine
        WHERE type=?
        NOT IN (?)
        ORDER BY clickCount
        LIMIT 4;
    `;
    const [selectBestWineListByTypeQueryRow]=await connection.query(selectBestWineListByTypeQuery,[wineType,wineId]);
    return selectBestWineListByTypeQueryRow;
};

exports.selectSimilarWineList=async function(connection,sweetness,acidity,body,tannin,wineId){
    const selectSimilarWineListQuery=`
        SELECT wineId,wineImg,wineName,price
        FROM Wine
        WHERE sweetness=? AND acidity=? AND body=? AND tannin=?
        NOT IN (?);
    `;
    const [selectSimilarWineListQueryRow]=await connection.query(selectSimilarWineListQuery,[sweetness,acidity,body,tannin,wineId]);
    return selectSimilarWineListQueryRow;
};

exports.selectWineStatus=async function(connection,wineId){
    const selectWineStatusQuery=`
        SELECT status FROM Wine WHERE wineId=?;
    `;
    const [selectWineStatusQueryRow]=await connection.query(selectWineStatusQuery,wineId);
    return selectWineStatusQueryRow;
};

exports.selectWineReviews=async function(connection,wineId){
    const selectWineReviewsQuery=`
        SELECT
            rating,content,
            (select DATE_FORMAT(createdAt,'%Y.%m.%d')) as createdAt,
            (select nickname from User where userId=Review.userId) as userName
        FROM Review
        WHERE wineId=?
        ORDER BY createdAt DESC;
    `;
    const [selectWineReviewsQueryRow]=await connection.query(selectWineReviewsQuery,wineId);
    return selectWineReviewsQueryRow;
};