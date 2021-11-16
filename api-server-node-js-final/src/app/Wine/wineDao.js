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

exports.selectTodayWines = async function (connection, userId, wineIdx) {
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
        WHERE wineId = ?;
    `;
    const [selectTodayWinesQueryRow] = await connection.query(selectTodayWinesQuery, [userId, wineIdx]);
    return selectTodayWinesQueryRow;
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
        SELECT flavor
        FROM SubFlavorCategory
        WHERE subCategoryId in (SELECT subCategoryId FROM Flavor WHERE wineId = ?);
    `;
    const [selectWineFlavorQueryRow] = await connection.query(selectWineFlavorQuery, wineId);
    return selectWineFlavorQueryRow;
};

exports.selectPairingFood = async function (connection, wineId) {
    const selectPairingFoodQuery = `
        SELECT food
        From FoodCategory
        WHERE foodCategoryId IN (SELECT foodCategoryId FROM FoodPairing WHERE wineId = ?);
    `;
    const [selectPairingFoodQueryRow] = await connection.query(selectPairingFoodQuery, wineId);
    return selectPairingFoodQueryRow;
};

exports.selectWineReviewLimit3 = async function (connection, wineId) {
    const selectWineReviewLimit3Query = `
        SELECT rating,
               content,
               (select DATE_FORMAT(createdAt, '%Y.%m.%d'))              as createdAt,
               (select nickname from User where userId = Review.userId) as userName
        FROM Review
        WHERE wineId = ?
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
        WHERE sweetness = ?
          AND acidity = ?
          AND body = ?
          AND tannin = ?
            NOT IN (?);
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

exports.selectWineReviews = async function (connection, wineId) {
    const selectWineReviewsQuery = `
        SELECT rating,
               content,
               (select DATE_FORMAT(createdAt, '%Y.%m.%d'))              as createdAt,
               (select nickname from User where userId = Review.userId) as userName
        FROM Review
        WHERE wineId = ?
        ORDER BY createdAt DESC;
    `;
    const [selectWineReviewsQueryRow] = await connection.query(selectWineReviewsQuery, wineId);
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

exports.selectWineNameByKeyword = async function (connection, keyword) {
    const selectWineNameByKeywordQuery = `
        SELECT wineName
        FROM Wine
        WHERE wineName LIKE ?;
    `;
    const [selectWineNameByKeywordQueryRow] = await connection.query(selectWineNameByKeywordQuery, keyword);
    return selectWineNameByKeywordQueryRow;
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
               CASE
                   WHEN (select status from Subscribe where wineId = Wine.wineId and userId = ?) = "Y"
                       THEN "Y"
                   ELSE "N"
                   END AS userSubscribeStatus,
               (select count(subscribeId) from Subscribe where wineId = Wine.wineId and status = "Y") as subscribeCount,
               (select count(reviewId) from Review where wineId = Wine.wineId)                        as reviewCount
        FROM Wine
        WHERE wineName LIKE ?;
    `;
    const [selectWineByNameQueryRow] = await connection.query(selectWineByNameQuery, [userId, keyword]);
    return selectWineByNameQueryRow;
};

// exports.selectWineByFiltering = async function (connection, userId, typeList, tasteList, flavorList, foodList, priceScope) {
//     const selectWineByFilteringQuery = `
// drop procedure if exists filtering;
//
// create procedure filtering(sweetness int,acidity int,body int,tannin int,type int,subCategoryId int,foodCategoryId int,price int);
//
// begin
// declare whereClause varchar(1000);
// set @selectClause="select distinct w.wineId,w.wineImg,w.wineName,w.price,w.country,w.region,
//         IF((select status from Subscribe where wineId = w.wineId and userId = ?) = "Y", "Y", "N") AS userSubscribeStatus
//  from Wine w
//     join Flavor f
//     join FoodPairing p
//     on w.wineId = f.wineId and w.wineId = p.wineId and f.wineId = p.wineId";
//
// set whereClause="where w.sweetness = ? and w.acidity = ? and w.body = ? and w.tannin = ?";
// if(typeList is not null) then set whereClause=concat(whereClause,"and w.type=?");
// if(flavorsList is not null) then set whereClause=concat(whereClause,"and f.subCategoryId = ?");
// if(foodList is not null) then set whereClause=concat(whereClause,"and p.foodCategoryId=?");
// if (priceScope is not null) then set whereClause=concat(whereClause,"and cast(price as UNSIGNED) between ? and ?");
// end if;
//
// set @executeSql=concat(@selectClause,whereClause);
//
// prepare stmt from @executeSql;
//
// set @userId=userId;
// set @type=typeList[0];
// set @sweetness=tasteList[0];
// set @acidity=tasteList[1];
// set @body=tasteList[2];
// set @tannin=tasteList[3];
// set @subCategoryId=flavorList[0];
// set @foodCategoryId=foodList[0];
// set @bPrice=priceScope[0];
// set @ePrice=priceScope[1];
//
// execute stmt using @userId,@sweetness,@acidity,@body,@tannin,@type,@subCategoryId,@foodCategoryId,@price;
//
// deallocate prepare stmt;
// end
// `;
//
//
// //     const selectWineByFilteringQuery =`
// //         set @type=?;
// //         set @sweetness=?;
// //         set @acidity=?;
// //         set @body=?;
// //         set @tannin=?;
// //         set @subCategoryId=?;
// //         set @foodCategoryId=?;
// //         set @bPrice=?;
// //         set @ePrice=?;
// //
// //         SELECT distinct w.wineId,w.wineImg,w.wineName,w.price,w.country,w.region
// //         FROM Wine w join Flavor f join FoodPairing fp on w.wineId=f.wineId and w.wineId=fp.wineId and f.wineId=fp.wineId
// //         WHERE w.sweetness = ? and w.acidity = ? and w.body = ? and w.tannin = ?
// //                 if (typeList)
// //                     and type=?
// //                 if (flavorList)
// //                     and subCategoryId=?
// //                 if (foodList)
// //                     and foodCategoryId=?
// //                 if (price)
// //                     and price between ? and ?
// //             ;
// //     `;
//
//
//     const [selectWineByFilteringQueryRow] = await connection.query(selectWineByFilteringQuery, [userId, tasteList[0], tasteList[1], tasteList[2], tasteList[3], typeList[0]], typeList[0], flavorList[0], foodList[0], priceScope[0], priceScope[1]);
//     //const [selectWineByFilteringQueryRow] = await connection.query(selectWineByFilteringQuery,[typeList[0],tasteList[0],tasteList[1],tasteList[3],tasteList[3],flavorList[0],foodList[0],priceScope[0],priceScope[1]]);
//     return selectWineByFilteringQueryRow;
// };























