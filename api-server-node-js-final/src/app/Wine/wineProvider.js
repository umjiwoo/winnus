const {pool} = require("../../../config/database");
const {logger} = require("../../../config/winston");
const index=require("../../../index");

const wineDao = require("./wineDao");

const {response, errResponse} = require("../../../config/response");
const baseResponse = require("../../../config/baseResponseStatus");
const {integer} = require("twilio/lib/base/deserialize");
const {query} = require("winston");


// Provider: Read 비즈니스 로직 처리
exports.retrieveWineList = async function (userId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const wineList = await wineDao.selectWineList(connection, userId);
    console.log("실시간 인기 와인-전체\n", wineList);
    connection.release();
    return response(baseResponse.SUCCESS, wineList);
};

exports.retrieveWineListByType = async function (userId, type) {
    const connection = await pool.getConnection(async (conn) => conn);
    const wineList = await wineDao.selectWineListByType(connection, userId, type);
    console.log("실시간 인기 와인-타입별\n", wineList);
    connection.release();
    return response(baseResponse.SUCCESS, wineList);
};

exports.retrieveTodayWineList = async function (userId) {
    const connection = await pool.getConnection(async (conn) => conn);

    let queryParams=[userId];
    let wineIdList=[];
    if(index.wineIdxList.length!=0) {
        console.log("오늘의 와인 인덱스: ", index.wineIdxList);
        //해당 인덱스 와인(인덱스,이미지,이름,가격) 가져오기
        queryParams.push(index.wineIdxList);
    }
    else{
        while (wineIdList.length < 6) {
            const randomNum = Math.floor(Math.random() * 1008) + 1;
            if (!wineIdList.includes(randomNum))
                wineIdList.push(randomNum);
        }
        queryParams.push(wineIdList);
    }
    console.log(queryParams);

    const wineRes=await wineDao.selectTodayWineInfo(connection,queryParams);
    console.log("오늘의 와인 조회 결과", wineRes);
    connection.release();
    return response(baseResponse.SUCCESS, {todayWines: wineRes});
};

exports.retrieveWineInfo = async function (wineId) {
    const connection = await pool.getConnection(async (conn) => conn);

    const wineStatusCheckRes = await wineDao.selectWineStatus(connection, wineId);
    if (wineStatusCheckRes.length < 1 || wineStatusCheckRes[0].status === "DELETED")
        return errResponse(baseResponse.WINE_NOT_EXIST);

    const wineInfo = await wineDao.selectWineInfo(connection, wineId);
    const wineShopRes = await wineDao.selectWineShopByWineId(connection, wineId);
    const flavor = await wineDao.selectWineFlavor(connection, wineId);
    const pairingFood = await wineDao.selectPairingFood(connection, wineId);
    const reviews = await wineDao.selectWineReviewLimit3(connection, wineId);
    //같은 타입 와인 베스트 가져오기
    const wineType = wineInfo[0].typeId;
    const wineListByType = await wineDao.selectBestWineListByType(connection, wineType, wineId);

    //비슷한 와인 가져오기
    const sweetness = wineInfo[0].sweetness;
    const acidity = wineInfo[0].acidity;
    const body = wineInfo[0].body;
    const tannin = wineInfo[0].tannin;

    const similarWineList = await wineDao.selectSimilarWineList(connection, sweetness, acidity, body, tannin, wineId);

    console.log("와인 상세정보 조회 결과\n", wineInfo, wineShopRes, flavor, pairingFood, reviews, wineListByType, similarWineList);

    connection.release();
    return response(baseResponse.SUCCESS, [{wineInfo: wineInfo}].concat({wineShops: wineShopRes}).concat({flavorList: flavor}).concat({pairingFoodList: pairingFood}).concat({reviews: reviews}).concat({bestWineListByType: wineListByType}).concat({similarWineList: similarWineList}));
};

exports.wineCheck = async function (wineId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const wineStatusCheckRes = await wineDao.selectWineStatus(connection, wineId);
    connection.release();
    return wineStatusCheckRes;
};

exports.retrieveWineReviews = async function (wineId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const wineStatusCheckRes = await wineDao.selectWineStatus(connection, wineId);
    if (wineStatusCheckRes.length < 1 || wineStatusCheckRes[0].status === "DELETED")
        return errResponse(baseResponse.WINE_NOT_EXIST);

    const retrieveWineReviewIdRes = await wineDao.selectWineReviewId(connection, wineId);

    const result = [];

    for (let i = 0; i < retrieveWineReviewIdRes.length; i++) {
        const reviewId = retrieveWineReviewIdRes[i].reviewId;
        const retrieveWineReviewsRes = await wineDao.selectWineReviews(connection, reviewId);
        const reviewTags = await wineDao.selectWineTags(connection, reviewId);
        const review = retrieveWineReviewsRes[0];
        const tags = reviewTags;
        result.push({review: review, tags: tags});
    }
    console.log("리뷰 검색 결과", result);
    connection.release();
    return response(baseResponse.SUCCESS, {wineReviews: result});
};

exports.retrieveWineListByTheme = async function (userId, theme) {
    const connection = await pool.getConnection(async (conn) => conn);
    if (theme === "floral") {
        const floralWineList = await wineDao.selectFloralWines(connection, userId);
        if (floralWineList.length < 1)
            return errResponse(baseResponse.WINE_NOT_EXIST_FOR_THIS_THEME);
        console.log("플로럴 아로마 와인 리스트\n", floralWineList);
        connection.release();
        return response(baseResponse.SUCCESS, {themeWineList: floralWineList});
    }
    if (theme === "homeParty") {
        const homePartyWineList = await wineDao.selectWinesForHomeParty(connection, userId);
        if (homePartyWineList.length < 1)
            return errResponse(baseResponse.WINE_NOT_EXIST_FOR_THIS_THEME);
        console.log("홈파티를 위한 와인 리스트\n", homePartyWineList);
        connection.release();
        return response(baseResponse.SUCCESS, {themeWineList: homePartyWineList});
    }
    if (theme === "autumn") {
        const wineListForAutumn = await wineDao.selectWinesForAutumn(connection, userId);
        if (wineListForAutumn.length < 1)
            return errResponse(baseResponse.WINE_NOT_EXIST_FOR_THIS_THEME);
        console.log("가을에 어울리는 와인 리스트\n", wineListForAutumn);
        connection.release();
        return response(baseResponse.SUCCESS, {themeWineList: wineListForAutumn});
    } else {
        return response(errResponse(baseResponse.WRONG_THEME));
    }
};

exports.retrieveWineNamesByKeyword = async function () {
    const connection = await pool.getConnection(async (conn) => conn);
    const wineNamesRes = await wineDao.selectWineNames(connection);
    connection.release();
    return response(baseResponse.SUCCESS, {wineNames: wineNamesRes});
};

exports.retrieveWineByName = async function (userId, keyword) {
    const connection = await pool.getConnection(async (conn) => conn);

    const keywordSplitList = keyword.split("");
    const repeatNum = keywordSplitList.length;
    //문자 사이사이 와일드카드 삽입
    for (let i = 0; i < repeatNum; i++) {
        keywordSplitList.splice(i * 2, 0, "%");
    }
    //맨 마지막에 와일드카드 추가해주기
    keywordSplitList.push("%");
    //배열 문자열로 합치기
    //여기서 join.("%")했어도 됨
    keyword = keywordSplitList.join("");

    const getWineNum = await wineDao.selectWineCountByName(connection, keyword);
    const retrieveWineRes = await wineDao.selectWineByName(connection, userId, keyword);
    if (retrieveWineRes.length < 1)
        return errResponse(baseResponse.WINE_NOT_EXIST_FOR_THIS_KEYWORD);

    console.log("키워드로 와인 검색\n", retrieveWineRes);

    connection.release();
    return response(baseResponse.SUCCESS, [{wineCount: getWineNum}].concat({retrieveWineRes: retrieveWineRes}));
};

exports.retrieveWinesByFilter = async function (userId, keyword, type, sweetness, acidity, body, tannin, flavors, foods, price, page,orderBy) {
    const connection = await pool.getConnection(async (conn) => conn);

    let typeList = [];
    let flavorList = [];
    let foodList = [];
    let priceScope = [];

    if (keyword) {
        const keywordSplitList = keyword.split("");
        const repeatNum = keywordSplitList.length;
        for (let i = 0; i < repeatNum; i++) {
            keywordSplitList.splice(i * 2, 0, "%");
        }
        keywordSplitList.push("%");
        keyword = keywordSplitList.join("");
        console.log("keyword: ", keyword);
    }
    if (sweetness)
        sweetness = integer(sweetness);

    if (acidity)
        acidity = integer(acidity);

    if (body)
        body = integer(body);

    if (tannin)
        tannin = integer(tannin);

    if (type) {
        typeList = type.split(',');
        for (let i in typeList) {
            typeList[i] = integer(typeList[i]);
        }
        console.log("1-1\n", typeList);
    }

    if (flavors) {
        flavorList = flavors.split(',');
        for (let i in flavorList) {
            flavorList[i] = integer(flavorList[i]);
        }
        console.log("3-1\n", flavorList);
    }
    if (foods) {
        foodList = foods.split(',');
        for (let i in foodList) {
            foodList[i] = integer(foodList[i]);
        }
        console.log("4-1\n", foodList);
    }
    if (price) {
        priceScope = price.split('~');
        for (let i in priceScope) {
            priceScope[i] = integer(priceScope[i]);
        }
        console.log("5-1\n", priceScope);
    }

    //let queryParams = [userId];
    let queryParams = [];

    // let sql = "SELECT distinct w.wineId,w.wineImg,w.wineName,w.price,w.quantity,w.country,w.region," +
    //     "CASE WHEN (select status from Subscribe where wineId = w.wineId and userId = ?) = 'Y' THEN 'Y' ELSE 'N' END AS userSubscribeStatus," +
    //     "(select count(subscribeId) from Subscribe where wineId=w.wineId) as subscribeCount," +
    //     "(select count(reviewId) from Review where wineId=w.wineId) as reviewCount," +
    //     "sweetness,acidity,body,tannin";
    let sql = "SELECT distinct w.wineId";
    sql += " FROM Wine w,Flavor f,FoodPairing fp";

    let whereClause = " where";

    if (keyword) {
        whereClause += " (w.wineName like ?)";
        whereClause += " and";
        queryParams.push(keyword);
    }

    if (sweetness) {
        whereClause += " sweetness=?";
        whereClause += " and";
        queryParams.push(sweetness);
    }

    if (acidity) {
        whereClause += " acidity=?";
        whereClause += " and";
        queryParams.push(acidity);
    }

    if (body) {
        whereClause += " body=?";
        whereClause += " and";
        queryParams.push(body);
    }

    if (tannin) {
        whereClause += " tannin=?";
        whereClause += " and";
        queryParams.push(tannin);
    }

    if (type) {
        whereClause += " (w.type in (?))";
        whereClause += " and";
        queryParams.push(typeList);
    }
    if (flavors) {
        whereClause += " (f.subCategoryId in (select subCategoryId from SubFlavorCategory where mainCategoryId in (?)) and w.wineId=f.wineId)";
        whereClause += " and";
        queryParams.push(flavorList);
    }

    if (foods) {
        whereClause += " (fp.foodCategoryId in (?) and fp.wineId=w.wineId)";
        whereClause += " and";
        queryParams.push(foodList);
    }
    if (price) {
        whereClause += " (price !='-' and price >= ? and price <= ?)";
        queryParams.push(priceScope[0], priceScope[1]);
    }

    whereClause = whereClause.split(" ");

    if (whereClause[whereClause.length - 1] === "and") {
        whereClause.pop();
        whereClause = whereClause.join(" ");
    } else {
        whereClause = whereClause.join(" ");
    }

    sql += whereClause;

    let countSql=sql+";";

    if(orderBy=="high")
        sql+=" order by w.price desc";
    else if(orderBy=="low")
        sql+=" order by w.price";


    sql += " limit 10 offset ";
    sql += (page - 1) * 10;
    sql += ";";

    console.log("쿼리문: ", sql);
    console.log("쿼리 파라미터", queryParams);

    //const resultCount=await connection.
    //const [exec] = await connection.query(sql, queryParams);
    const resultCount=await wineDao.selectWineByFiltering(connection,countSql,queryParams);
    const exec=await wineDao.selectWineByFiltering(connection,sql,queryParams);

    console.log("쿼리 결과\n", exec);

    //exec.forEach((value, index) => console.log(value.wineId));

    let result = [];

    for (let i = 0; i < exec.length; i++) {
        console.log(exec[i].wineId);
        const wineRes = await wineDao.selectSimpleWineInfo(connection, userId, exec[i].wineId);
        result.push(wineRes);
    }

    console.log("result\n", result);
    connection.release();
    return response(baseResponse.SUCCESS, [{filteringResCount: resultCount.length}].concat({filteringRes: result}));
};

exports.retrieveWineAromaList = async function () {
    const connection = await pool.getConnection(async (conn) => conn);
    const retrieveWineAromaListRes = await wineDao.selectWineAromas(connection);
    return response(baseResponse.SUCCESS, retrieveWineAromaListRes);
};

exports.retrieveWineFoodList = async function () {
    const connection = await pool.getConnection(async (conn) => conn);
    const retrieveWineFoodListRes = await wineDao.selectWineFoods(connection);
    return response(baseResponse.SUCCESS, retrieveWineFoodListRes);
};

exports.retrieveAllWineShop = async function () {
    const connection = await pool.getConnection(async (conn) => conn);
    const wineShopCount = await wineDao.selectCountAllWineShop(connection);
    const retrieveWineShopList = await wineDao.selectAllWineShop(connection);

    connection.release();
    return response(baseResponse.SUCCESS, [{wineShopCount: wineShopCount[0].shopNum}].concat({shopList: retrieveWineShopList}));
};

exports.retrieveWineShopByArea = async function (area) {
    const connection = await pool.getConnection(async (conn) => conn);
    area = "%" + area + "%";
    const wineShopCount = await wineDao.selectCountWineShopByArea(connection, area);
    const retrieveWineShopListByArea = await wineDao.selectWineShopByArea(connection, area);
    if (retrieveWineShopListByArea.length < 1)
        errResponse(baseResponse.WINE_SHOP_NOT_EXIST);
    connection.release();
    return response(baseResponse.SUCCESS, [{wineShopCount: wineShopCount[0].shopNum}].concat({shopList: retrieveWineShopListByArea}));
};

exports.retrieveWineShop = async function (wineName, area) {
    const connection = await pool.getConnection(async (conn) => conn);

    //와인 진짜 있는 와인인지,와인 인덱스 알아오기
    const nameSplitList = wineName.split("");
    const repeatNum = nameSplitList.length;

    for (let i = 0; i < repeatNum; i++) {
        nameSplitList.splice(i * 2, 0, "%");
    }
    nameSplitList.push("%");
    wineName = nameSplitList.join("");

    const wineCheck = await wineDao.selectWineIdByName(connection, wineName);
    if (wineCheck.length < 1)
        return errResponse(baseResponse.WINE_SEARCH_BY_NAME_NOT_EXIST);

    console.log(wineCheck);
    //const wineId=wineCheck[0].wineId;

    area = "%" + area + "%";
    for (let i = 0; i < wineCheck.length; i++) {
        wineCheck[i] = wineCheck[i].wineId;
    }
    console.log(wineCheck);
    const queryParams = [area, wineCheck];
    console.log(queryParams);
    const wineShopCount = await wineDao.selectCountWineShop(connection, queryParams);

    const retrieveWineShopRes = await wineDao.selectWineShopByAreaWineList(connection, queryParams);
    if (retrieveWineShopRes.length < 1)
        errResponse(baseResponse.WINE_SHOP_NOT_EXIST_INCLUDING_THIS_WINE);

    connection.release();
    return response(baseResponse.SUCCESS, [{wineShopCount: wineShopCount[0].shopNum}].concat({shopList: retrieveWineShopRes}));
};

exports.retrieveShopDetail = async function (userId, shopId) {
    const connection = await pool.getConnection(async (conn) => conn);
    //있는 와인샵 인덱스인지 확인
    const shopCheck = await wineDao.selectWineShop(connection, shopId);
    if (shopCheck.length < 1 || shopCheck.status === "DELETED")
        return errResponse(baseResponse.NOT_EXIST_SHOP);

    //상점 취급 와인 가져오기
    const selectShopWines = await wineDao.selectShopWine(connection, userId, shopId);

    if (selectShopWines.length < 1)
        return errResponse(baseResponse.SHOP_WINE_NOT_EXIST);

    //취급 와인 인덱스 리스트
    const shopWineIdList = [];
    for (let i = 0; i < selectShopWines.length; i++) {
        shopWineIdList.push(selectShopWines[i].wineId);
    }
    console.log(shopWineIdList);


    //해당 인덱스의 와인들 페어링 푸드 가져오기
    const selectFoodPairingList = await wineDao.selectPairingFoodList(connection, shopWineIdList);
    console.log(selectFoodPairingList);

    connection.release();
    return response(baseResponse.SUCCESS, [{wineCount: selectShopWines.length}].concat({wineList: selectShopWines}).concat({pairingFoodList: selectFoodPairingList}));
};