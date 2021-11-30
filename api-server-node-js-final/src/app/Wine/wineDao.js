exports.selectWineCount = async function (connection) {
    const selectWineCountQuery = `
        SELECT count(wineId) as wineNum
        FROM Wine;
    `;
    const [selectWineCountQueryRow] = await connection.query(selectWineCountQuery);
    return selectWineCountQueryRow;
};

exports.selectWineCountByName = async function (connection, keyword) {
    const selectWineCountQuery = `
        SELECT count(wineId) as wineNum
        FROM Wine
        WHERE wineName LIKE ?;
    `;
    const [selectWineCountQueryRow] = await connection.query(selectWineCountQuery, keyword);
    return selectWineCountQueryRow;
};

exports.selectWineList = async function (connection, userId) {
    const selectWineListQuery = `
        SELECT wineId,
               wineImg,
               wineName,
               price,
               CASE
                   WHEN (select status from Subscribe where wineId = Wine.wineId and userId = ?) = "Y"
                       THEN "Y"
                   ELSE "N"
                   END AS userSubscribeStatus
        FROM Wine
        ORDER BY clickCount LIMIT 18;
    `;
    const [selectWineListQueryRow] = await connection.query(selectWineListQuery, userId);
    return selectWineListQueryRow;
};

exports.selectTodayWineInfo = async function (connection, queryParams) {
    const selectTodayWinesQuery = `
        SELECT wineId,
               wineImg,
               wineName,
               price,
               country,
               region,
               CASE
                   WHEN (select status from Subscribe where wineId = Wine.wineId and userId = ?) = "Y"
                       THEN "Y"
                   ELSE "N"
                   END AS userSubscribeStatus
        FROM Wine
        WHERE wineId IN (?);
    `;
    const [selectTodayWinesQueryRow] = await connection.query(selectTodayWinesQuery, queryParams);
    return selectTodayWinesQueryRow;
};


exports.selectSimpleWineInfo = async function (connection, userId, wineIdx) {
    const selectSimpleWineInfoQuery = `
        SELECT wineId,
               wineImg,
               wineName,
               quantity,
               price,
               country,
               region,
               CASE
                   WHEN (select status from Subscribe where wineId = Wine.wineId and userId = ?) = "Y"
                       THEN "Y"
                   ELSE "N"
                   END AS userSubscribeStatus,
               (select count(subscribeId) from Subscribe where wineId=Wine.wineId) as subscribeCount,
               (select count(reviewId) from Review where wineId=Wine.wineId) as reviewCount
        FROM Wine
        WHERE wineId = ?;
    `;
    const [selectSimpleWineInfoQueryRow] = await connection.query(selectSimpleWineInfoQuery, [userId, wineIdx]);
    return selectSimpleWineInfoQueryRow;
};

exports.selectWineListByType = async function (connection, userId, type) {
    const selectWineListByTypeQuery = `
        SELECT wineId,
               wineImg,
               wineName,
               price,
               CASE
                   WHEN (select status from Subscribe where wineId = Wine.wineId and userId = ?) = "Y"
                       THEN "Y"
                   ELSE "N"
                   END AS userSubscribeStatus
        FROM Wine
        WHERE type = ?
        ORDER BY clickCount LIMIT 18;
    `;
    const [selectWineListByTypeQueryRow] = await connection.query(selectWineListByTypeQuery, [userId, type]);
    return selectWineListByTypeQueryRow;
};

exports.selectWineListByTaste = async function (connection, userId, type, sweetness, acidity, body, tannin) {
    const selectWineListByTasteQuery = `
        SELECT *
        FROM (SELECT wineId,
                     wineImg,
                     wineName,
                     price,
                     country,
                     region,
                     CASE
                         WHEN (select status from Subscribe where wineId = Wine.wineId and userId = ?) = "Y"
                             THEN "Y"
                         ELSE "N"
                         END AS userSubscribeStatus,
                     type,
                     sweetness,
                     acidity,
                     body,
                     tannin
              FROM Wine
              WHERE type = ?) as firstFilteringRes
        WHERE firstFilteringRes.sweetness = ?
          AND firstFilteringRes.acidity = ?
          AND firstFilteringRes.body = ?
          AND firstFilteringRes.tannin = ?;
    `;
    const [selectWineListByTasteQueryRow] = await connection.query(selectWineListByTasteQuery, [userId, type, sweetness, acidity, body, tannin]);
    return selectWineListByTasteQueryRow;
};

exports.selectWineInfo = async function (connection, wineId) {
    const selectWineInfoQuery = `
        SELECT wineImg,
               wineName,
               inEnglish,
               country,
               region,
               quantity,
               productionYear,
               price,
               sweetness,
               acidity,
               body,
               tannin,
               taste,
               Wine.type                                                             as typeId,
               (select type from TypeCategory where typeId = Wine.type)              as type,
               variety,
               (select ROUND(avg(rating), 2) from Review where wineId = Wine.wineId) as rating,
               (select count(reviewId) from Review where wineId = Wine.wineId)       as reviewNum
        FROM Wine
        WHERE wineId = ?;
    `;
    const [selectWineInfoQueryRow] = await connection.query(selectWineInfoQuery, wineId);
    return selectWineInfoQueryRow;
};

exports.selectWineFlavor = async function (connection, wineId) {
    const selectWineFlavorQuery = `
        SELECT flavor, flavorImg
        FROM SubFlavorCategory
        WHERE subCategoryId in (SELECT subCategoryId FROM Flavor WHERE wineId = ?);
    `;
    const [selectWineFlavorQueryRow] = await connection.query(selectWineFlavorQuery, wineId);
    return selectWineFlavorQueryRow;
};

exports.selectPairingFood = async function (connection, wineId) {
    const selectPairingFoodQuery = `
        SELECT food, foodImg
        From FoodCategory
        WHERE foodCategoryId IN (SELECT foodCategoryId FROM FoodPairing WHERE wineId = ?);
    `;
    const [selectPairingFoodQueryRow] = await connection.query(selectPairingFoodQuery, wineId);
    return selectPairingFoodQueryRow;
};

exports.selectPairingFoodList = async function (connection, shopWineIdList) {
    const selectPairingFoodListQuery = `
        SELECT foodCategoryId, food, foodImg
        From FoodCategory
        WHERE foodCategoryId
                  IN (SELECT foodCategoryId
                      FROM FoodPairing
                      WHERE wineId IN (?));
    `;
    const [selectPairingFoodListQueryRow] = await connection.query(selectPairingFoodListQuery, [shopWineIdList]);
    return selectPairingFoodListQueryRow;
};

exports.selectWineReviewLimit3 = async function (connection, wineId) {
    const selectWineReviewLimit3Query = `
        SELECT rating,
               content,
               (select DATE_FORMAT(createdAt, '%Y.%m.%d'))              as createdAt,
               (select nickname from User where userId = Review.userId) as userName
        FROM Review
        WHERE wineId = ?
          AND status!="DELETED"
        ORDER BY createdAt DESC LIMIT 3;
    `;
    const [selectWineReviewLimit3QueryRow] = await connection.query(selectWineReviewLimit3Query, wineId);
    return selectWineReviewLimit3QueryRow;
};

exports.selectBestWineListByType = async function (connection, wineType, wineId) {
    const selectBestWineListByTypeQuery = `
        SELECT wineId, wineImg, wineName, price, country, region
        FROM Wine
        WHERE type = ?
                  NOT IN (?)
        ORDER BY clickCount LIMIT 4;
    `;
    const [selectBestWineListByTypeQueryRow] = await connection.query(selectBestWineListByTypeQuery, [wineType, wineId]);
    return selectBestWineListByTypeQueryRow;
};

exports.selectSimilarWineList = async function (connection, sweetness, acidity, body, tannin, wineId) {
    const selectSimilarWineListQuery = `
        SELECT wineId, wineImg, wineName, price, country, region
        FROM Wine
        WHERE (sweetness = ?
          AND acidity = ?
          AND body = ?
          AND tannin = ?)
        NOT IN (?)
        LIMIT 4;
    `;
    const [selectSimilarWineListQueryRow] = await connection.query(selectSimilarWineListQuery, [sweetness, acidity, body, tannin, wineId]);
    return selectSimilarWineListQueryRow;
};

exports.selectWineStatus = async function (connection, wineId) {
    const selectWineStatusQuery = `
        SELECT status
        FROM Wine
        WHERE wineId = ?;
    `;
    const [selectWineStatusQueryRow] = await connection.query(selectWineStatusQuery, wineId);
    return selectWineStatusQueryRow;
};

exports.selectWineReviewId = async function (connection, wineId) {
    const selectWineReviewIdQuery = `
        SELECT reviewId
        FROM Review
        WHERE wineId = ?
          AND status!="DELETED";
    `;
    const [selectWineReviewIdQueryRow] = await connection.query(selectWineReviewIdQuery, wineId);
    return selectWineReviewIdQueryRow;
};

exports.selectWineTags = async function (connection, reviewId) {
    const selectWineTagsQuery = `
        SELECT content
        FROM Tag
        WHERE tagId IN (select tagId from Tag where reviewId = ?)
          AND status!="DELETED";
    `;
    const [selectWineTagsQueryRow] = await connection.query(selectWineTagsQuery, reviewId);
    return selectWineTagsQueryRow;
};

exports.selectWineTagIds = async function (connection, reviewId) {
    const selectWineTagIdsQuery = `
        SELECT tagId
        FROM Tag
        WHERE tagId IN (select tagId from Tag where reviewId = ?)
          AND status!="DELETED";
    `;
    const [selectWineTagIdsQueryRow] = await connection.query(selectWineTagIdsQuery, reviewId);
    return selectWineTagIdsQueryRow;
};


exports.selectWineReviews = async function (connection, reviewId) {
    const selectWineReviewsQuery = `
        SELECT (select wineId from Wine where wineId = Review.wineId)   as wineId,
               (select wineImg from Wine where wineId = Review.wineId)  as wineImg,
               (select wineName from Wine where wineId = Review.wineId) as wineName,
               (select country from Wine where wineId = Review.wineId)  as country,
               (select region from Wine where wineId = Review.wineId)   as region,
               reviewId,
               rating,
               content,
               (select DATE_FORMAT(createdAt, '%Y.%m.%d'))              as createdAt,
               (select nickname from User where userId = Review.userId) as userName
        FROM Review
        WHERE reviewId = ?
          AND Review.status!="DELETED";
    `;
    const [selectWineReviewsQueryRow] = await connection.query(selectWineReviewsQuery, reviewId);
    return selectWineReviewsQueryRow;
};


exports.selectFloralWines = async function (connection, userId) {
    const selectFloralWinesQuery = `
        SELECT wineId,
               wineImg,
               wineName,
               price,
               country,
               region,
               CASE
                   WHEN (select status from Subscribe where wineId = Wine.wineId and userId = ?) = "Y"
                       THEN "Y"
                   ELSE "N"
                   END AS userSubscribeStatus
        FROM Wine
        WHERE wineId IN (SELECT wineId
                         FROM Flavor
                         WHERE subCategoryId IN (SELECT subCategoryId FROM SubFlavorCategory WHERE mainCategoryId = 1));
    `;
    const [selectFloralWinesQueryRow] = await connection.query(selectFloralWinesQuery, userId);
    return selectFloralWinesQueryRow;
};

exports.selectWinesForHomeParty = async function (connection, userId) {
    const selectWinesForHomePartyQuery = `
        SELECT wineId,
               wineImg,
               wineName,
               price,
               country,
               region,
               CASE
                   WHEN (select status from Subscribe where wineId = Wine.wineId and userId = ?) = "Y"
                       THEN "Y"
                   ELSE "N"
                   END AS userSubscribeStatus
        FROM Wine
        WHERE type = 4
          AND 10000 <= price < 20000
          AND sweetness = 1;
    `;
    const [selectWinesForHomePartyQueryRow] = await connection.query(selectWinesForHomePartyQuery, userId);
    return selectWinesForHomePartyQueryRow;
};

exports.selectWinesForAutumn = async function (connection, userId) {
    const selectWinesForAutumnQuery = `
        SELECT wineId,
               wineImg,
               wineName,
               price,
               country,
               region,
               CASE
                   WHEN (select status from Subscribe where wineId = Wine.wineId and userId = ?) = "Y"
                       THEN "Y"
                   ELSE "N"
                   END AS userSubscribeStatus
        FROM Wine
        WHERE (variety like "%샤르도네%" or "%피노누아%")
           or type = 4;
    `;
    const [selectWinesForAutumnQueryRow] = await connection.query(selectWinesForAutumnQuery, userId);
    return selectWinesForAutumnQueryRow;
};

exports.selectWineNames = async function (connection) {
    const selectWineNamesQuery = `
        SELECT wineName
        FROM Wine;
    `;
    const [selectWineNamesQueryRow] = await connection.query(selectWineNamesQuery);
    return selectWineNamesQueryRow;
};

exports.selectWineByName = async function (connection, userId, keyword) {
    const selectWineByNameQuery = `
        SELECT wineId,
               wineImg,
               wineName,
               country,
               region,
               quantity,
               price,
               quantity,
               CASE
                   WHEN (select status from Subscribe where wineId = Wine.wineId and userId = ?) = "Y"
                       THEN "Y"
                   ELSE "N"
                   END                                                                                AS userSubscribeStatus,
               (select count(subscribeId) from Subscribe where wineId = Wine.wineId and status = "Y") as subscribeCount,
               (select count(reviewId) from Review where wineId = Wine.wineId)                        as reviewCount
        FROM Wine
        WHERE wineName LIKE ?;
    `;
    const [selectWineByNameQueryRow] = await connection.query(selectWineByNameQuery, [userId, keyword]);
    return selectWineByNameQueryRow;
};

exports.selectWineAromas = async function (connection) {
    const selectWineAromasQuery = `
        SELECT subCategoryId, flavor
        FROM SubFlavorCategory;
    `;
    const [selectWineAromasQueryRow] = await connection.query(selectWineAromasQuery);
    return selectWineAromasQueryRow;
};

exports.selectWineFoods = async function (connection) {
    const selectWineFoodsQuery = `
        SELECT foodCategoryId, food
        FROM FoodCategory;
    `;
    const [selectWineFoodsQueryRow] = await connection.query(selectWineFoodsQuery);
    return selectWineFoodsQueryRow;
};

exports.selectCountAllWineShop = async function (connection) {
    const selectCountWineShopQuery = `
        SELECT count(shopId) as shopNum
        FROM Shop;
    `;
    const [selectCountWineShopQueryRow] = await connection.query(selectCountWineShopQuery);
    return selectCountWineShopQueryRow;
};

exports.selectCountWineShopByArea = async function (connection, area) {
    const selectCountWineShopByAreaQuery = `
        SELECT count(shopId) as shopNum
        FROM Shop
        WHERE location LIKE ?;
    `;
    const [selectCountWineShopByAreaQueryRow] = await connection.query(selectCountWineShopByAreaQuery, area);
    return selectCountWineShopByAreaQueryRow;
};

exports.selectCountWineShop = async function (connection, queryParams) {
    const selectCountWineShopQuery = `
        SELECT count(shopId) as shopNum
        FROM Shop
        WHERE location LIKE ?
          AND shopId IN (select shopId from ShopWine where wineId in (?));
    `;
    const [selectCountWineShopQueryRow] = await connection.query(selectCountWineShopQuery, queryParams);
    return selectCountWineShopQueryRow;
};

exports.selectAllWineShop = async function (connection) {
    const selectWineShopQuery = `
        SELECT shopId, shopImg, shopName, shopCategory, location, tel
        FROM Shop;
    `;
    const [selectWineShopQueryRow] = await connection.query(selectWineShopQuery);
    return selectWineShopQueryRow;
};

exports.selectWineShopByArea = async function (connection, area) {
    const selectWineShopByAreaQuery = `
        SELECT shopId, shopImg, shopName, shopCategory, location, tel
        FROM Shop
        WHERE location LIKE ?;
    `;
    const [selectWineShopByAreaQueryRow] = await connection.query(selectWineShopByAreaQuery, area);
    return selectWineShopByAreaQueryRow;
};

exports.selectWineIdByName = async function (connection, wineName) {
    const selectWineIdByNameQuery = `
        SELECT wineId
        FROM Wine
        WHERE wineName LIKE ?;
    `;
    const [selectWineIdByNameQueryRow] = await connection.query(selectWineIdByNameQuery, wineName);
    return selectWineIdByNameQueryRow;
};

exports.selectWineShopByWineId = async function (connection, wineId) {
    const selectWineShopByWineIdQuery = `
        SELECT shopId, shopName, shopCategory, location, tel
        FROM Shop
        WHERE shopId IN (select shopId from ShopWine where wineId = ?);
    `;
    const [selectWineShopByWineIdQueryRow] = await connection.query(selectWineShopByWineIdQuery, wineId);
    return selectWineShopByWineIdQueryRow;
};

exports.selectWineShopByAreaWineList = async function (connection, queryParams) {
    const selectWineShopByAreaWineListQuery = `
        SELECT shopId, shopImg, shopName, shopCategory, location, tel
        FROM Shop
        WHERE location LIKE ?
          AND shopId IN (select shopId from ShopWine where wineId in ?);
    `;
    const [selectWineShopByAreaWineListQueryRow] = await connection.query(selectWineShopByAreaWineListQuery, queryParams);
    return selectWineShopByAreaWineListQueryRow;
};

exports.selectWineShop = async function (connection, shopId) {
    const selectWineShopQuery = `
        SELECT shopId, status
        FROM Shop
        WHERE shopId = ?;
    `;
    const [selectWineShopQueryRow] = await connection.query(selectWineShopQuery, shopId);
    return selectWineShopQueryRow;
};

exports.selectShopWine = async function (connection, userId, shopId) {
    const selectShopWineQuery = `
        SELECT wineId,
               wineImg,
               wineName,
               country,
               region,
               quantity,
               price,
               quantity,
               CASE
                   WHEN (select status from Subscribe where wineId = Wine.wineId and userId = ?) = "Y"
                       THEN "Y"
                   ELSE "N"
                   END                                                                                AS userSubscribeStatus,
               (select count(subscribeId) from Subscribe where wineId = Wine.wineId and status = "Y") as subscribeCount,
               (select count(reviewId) from Review where wineId = Wine.wineId)                        as reviewCount
        FROM Wine
        WHERE wineId IN (select wineId from ShopWine where shopId = ?);
    `;
    const [selectShopWineQueryRow] = await connection.query(selectShopWineQuery, [userId, shopId]);
    return selectShopWineQueryRow;
};

exports.selectWineByFiltering=async function(connection,sql,queryParams){
    const [wineFilteringRes]=await connection.query(sql,queryParams);
    return wineFilteringRes;
};