exports.selectWineCount=async function(connection){
    const selectWineCountQuery=`
        SELECT count(wineId) as wineNum FROM Wine;
    `;
    const [selectWineCountQueryRow]=await connection.query(selectWineCountQuery);
    return selectWineCountQueryRow;
};

exports.selectWineCountByName=async function(connection,wineName){
    const selectWineCountQuery=`
        SELECT count(wineId) as wineNum FROM Wine WHERE wineName=?;
    `;
    const [selectWineCountQueryRow]=await connection.query(selectWineCountQuery,wineName);
    return selectWineCountQueryRow;
};

exports.selectWineList=async function(connection){
    const selectWineListQuery=`
        SELECT wineId,wineImg,wineName,price FROM Wine ORDER BY clickCount LIMIT 18;
    `;
    const [selectWineListQueryRow]=await connection.query(selectWineListQuery);
    return selectWineListQueryRow;
};

exports.selectTodayWines=async function(connection,wineIdx){
    const selectTodayWinesQuery=`
        SELECT wineId,wineImg,wineName,price FROM Wine WHERE wineId=?;
    `;
    const [selectTodayWinesQueryRow]=await connection.query(selectTodayWinesQuery,wineIdx);
    return selectTodayWinesQueryRow;
};

exports.selectWineListByType=async function(connection,type){
    const selectWineListByTypeQuery=`
        SELECT wineId,wineImg,wineName,price FROM Wine
        WHERE type=?
        ORDER BY clickCount
        LIMIT 18;
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


exports.selectFloralWines=async function(connection){
    const selectFloralWinesQuery=`
        SELECT wineId,wineImg,wineName,price
        FROM Wine
        WHERE wineId IN (SELECT wineId FROM Flavor WHERE subCategoryId IN (SELECT subCategoryId FROM SubFlavorCategory WHERE mainCategoryId=1));
    `;
    const [selectFloralWinesQueryRow]=await connection.query(selectFloralWinesQuery);
    return selectFloralWinesQueryRow;
};

exports.selectWinesForHomeParty=async function(connection){
    const selectWinesForHomePartyQuery=`
        SELECT wineId,wineImg,wineName,price
        FROM Wine
        WHERE type=4 AND 10000<=price<20000 AND sweetness=1;
    `;
    const [selectWinesForHomePartyQueryRow]=await connection.query(selectWinesForHomePartyQuery);
    return selectWinesForHomePartyQueryRow;
};

exports.selectWinesForAutumn=async function(connection){
    const selectWinesForAutumnQuery=`
        SELECT wineId,wineImg,wineName,price
        FROM Wine
        WHERE (variety like "%샤르도네%" or "%피노누아%") or type=4;
    `;
    const [selectWinesForAutumnQueryRow]=await connection.query(selectWinesForAutumnQuery);
    return selectWinesForAutumnQueryRow;
};

exports.selectWineNameByKeyword=async function(connection,keyword){
    const selectWineNameByKeywordQuery=`
        SELECT wineName
        FROM Wine
        WHERE wineName LIKE ?;
    `;
    const [selectWineNameByKeywordQueryRow]=await connection.query(selectWineNameByKeywordQuery,keyword);
    return selectWineNameByKeywordQueryRow;
};

exports.selectWineByName=async function(connection,userId,wineName){
    const selectWineByNameQuery=`
        SELECT wineId,wineImg,wineName,country,region,quantity,price,
               CASE
                   WHEN (select status from Subscribe where wineId = Wine.wineId and userId = ?) is not null
                       THEN status
                   ELSE "N"
                   END AS userSubscribeStatus,
               (select count(subscribeId) from Subscribe where wineId=Wine.wineId) as subscribeCount,
               (select count(reviewId) from Review where wineId=Wine.wineId) as reviewCount
        FROM Wine
        WHERE wineName=?;
    `;
    const [selectWineByNameQueryRow]=await connection.query(selectWineByNameQuery,[userId,wineName]);
    return selectWineByNameQueryRow;
};