const {pool} = require("../../../config/database");
const {logger} = require("../../../config/winston");

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
    //전체 와인 수 조회
    const wineNum = await wineDao.selectWineCount(connection);
    //와인 인덱스값 내에서 랜덤하게 번호 추출-6개
    const wineIdxList = [];
    while (wineIdxList.length < 6) {
        const randomNum = Math.floor(Math.random() * wineNum[0].wineNum) + 1;
        if (!wineIdxList.includes(randomNum))
            wineIdxList.push(randomNum);
    }
    console.log(wineIdxList);
    //해당 인덱스 와인(인덱스,이미지,이름,가격) 가져오기
    const todayWineList = [];
    for (let i = 0; i < wineIdxList.length; i++) {
        const wineIdx = wineIdxList[i];
        const wineRes = await wineDao.selectTodayWines(connection, userId, wineIdx);
        console.log(wineRes);
        todayWineList.push(wineRes);
    }
    console.log("오늘의 와인 조회 결과", todayWineList);
    connection.release();
    return response(baseResponse.SUCCESS, {todayWines: todayWineList});
};

exports.retrieveWineInfo = async function (wineId) {
    const connection = await pool.getConnection(async (conn) => conn);

    const wineStatusCheckRes = await wineDao.selectWineStatus(connection, wineId);
    if (wineStatusCheckRes.length < 1 || wineStatusCheckRes[0].status === "DELETED")
        return errResponse(baseResponse.WINE_NOT_EXIST);

    const wineInfo = await wineDao.selectWineInfo(connection, wineId);
    const wineShopRes=await wineDao.selectWineShopByWineId(connection,wineId);
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

    const retrieveWineReviewIdRes=await wineDao.selectWineReviewId(connection,wineId);

    const result=[];

    for(let i=0;i<retrieveWineReviewIdRes.length;i++){
        const reviewId=retrieveWineReviewIdRes[i].reviewId;
        const retrieveWineReviewsRes = await wineDao.selectWineReviews(connection,reviewId);
        const reviewTags=await wineDao.selectWineTags(connection,reviewId);
        const review=retrieveWineReviewsRes[0];
        const tags=reviewTags;
        result.push({review:review,tags:tags});
    }
    console.log("리뷰 검색 결과",result);
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

exports.retrieveWinesByFilter = async function (userId, keyword, type, taste, flavors, foods, price) {
    const connection = await pool.getConnection(async (conn) => conn);

    let typeList = [];
    let tasteList = [];
    let flavorList = [];
    let foodList = [];
    let priceScope = [];

    if(keyword){
        const keywordSplitList = keyword.split("");
        const repeatNum = keywordSplitList.length;
        for (let i = 0; i < repeatNum; i++) {
            keywordSplitList.splice(i * 2, 0, "%");
        }
        keywordSplitList.push("%");
        keyword = keywordSplitList.join("");
        console.log("keyword: ",keyword);
    }
    if (type) {
        typeList = type.split(',');
        for (let i in typeList) {
            typeList[i] = integer(typeList[i]);
        }
        console.log("1-1\n", typeList);
    }
    if (taste) {
        tasteList = taste.split(',');
        for (let i in tasteList) {
            tasteList[i] = integer(tasteList[i]);
        }
        console.log("2-1\n", tasteList);
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

    let queryParams=[];

    let sql = "SELECT distinct w.wineId,w.wineImg,w.wineName,w.price,w.quantity,w.country,w.region," +
        "CASE WHEN (select status from Subscribe where wineId = w.wineId and userId = ?) = 'Y' THEN 'Y' ELSE 'N' END AS userSubscribeStatus," +
        "(select count(subscribeId) from Subscribe where wineId=w.wineId) as subscribeCount," +
        "(select count(reviewId) from Review where wineId=w.wineId) as reviewCount," +
        "sweetness,acidity,body,tannin ";
    sql += "FROM Wine w,Flavor f,FoodPairing fp ";

    if(keyword){
        sql+="WHERE (w.wineName like ?) and (sweetness=? and acidity=? and body=? and tannin=?)";
        queryParams=[userId, keyword, tasteList[0], tasteList[1], tasteList[2], tasteList[3]];
    }
    else {
        sql += "WHERE (sweetness=? and acidity=? and body=? and tannin=?)";
        queryParams=[userId, tasteList[0], tasteList[1], tasteList[2], tasteList[3]];
    }

    if (type) {
        sql += " and (w.type in (?))";
        queryParams.push(typeList);
    }
    if (flavors) {
        sql += " and (f.subCategoryId in (select subCategoryId from SubFlavorCategory where mainCategoryId in (?)) and w.wineId=f.wineId)";
        queryParams.push(flavorList);
    }

    if (foods) {
        sql += " and (fp.foodCategoryId in (?) and fp.wineId=w.wineId)";
        queryParams.push(foodList);
    }
    if (price) {
        sql += " and (price !='-' and price >= ? and price <= ?)";
        queryParams.push(priceScope[0], priceScope[1]);
    }
    sql += ";";

    console.log("쿼리문: ", sql);
    console.log("쿼리 파라미터", queryParams);

    const [exec] = await connection.query(sql, queryParams);
    const resCount = exec.length;

    console.log("쿼리 결과\n", exec);

    connection.release();
    return response(baseResponse.SUCCESS, [{filteringResCount: resCount}].concat({filteringRes: exec}));
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
    return response(baseResponse.SUCCESS,[{wineShopCount:wineShopCount[0].shopNum}].concat({shopList: retrieveWineShopList}));
};

exports.retrieveWineShopByArea = async function (area) {
    const connection = await pool.getConnection(async (conn) => conn);
    area = "%" + area + "%";
    const wineShopCount = await wineDao.selectCountWineShopByArea(connection, area);
    const retrieveWineShopListByArea = await wineDao.selectWineShopByArea(connection, area);
    if (retrieveWineShopListByArea.length < 1)
        errResponse(baseResponse.WINE_SHOP_NOT_EXIST);
    connection.release();
    return response(baseResponse.SUCCESS, [{wineShopCount:wineShopCount[0].shopNum}].concat({shopList: retrieveWineShopListByArea}));
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
    for(let i=0;i<wineCheck.length;i++){
        wineCheck[i]=wineCheck[i].wineId;
    }
    console.log(wineCheck);
    const queryParams=[area,wineCheck];
    console.log(queryParams);
    const wineShopCount=await wineDao.selectCountWineShop(connection,queryParams);

    const retrieveWineShopRes=await wineDao.selectWineShopByAreaWineList(connection,queryParams);
    if(retrieveWineShopRes.length<1)
        errResponse(baseResponse.WINE_SHOP_NOT_EXIST_INCLUDING_THIS_WINE);

    connection.release();
    return response(baseResponse.SUCCESS, [{wineShopCount:wineShopCount[0].shopNum}].concat({shopList: retrieveWineShopRes}));
};

exports.retrieveShopDetail=async function(userId,shopId){
    const connection = await pool.getConnection(async (conn) => conn);
    //있는 와인샵 인덱스인지 확인
    const shopCheck=await wineDao.selectWineShop(connection,shopId);
    if(shopCheck.length<1||shopCheck.status==="DELETED")
        return errResponse(baseResponse.NOT_EXIST_SHOP);

    //상점 취급 와인 가져오기
    const selectShopWine=await wineDao.selectShopWine(connection,userId,shopId);

    //취급 와인 인덱스 리스트
    const shopWineList=[];
    for(let i=0;i<selectShopWine.length;i++){
        shopWineList.push(selectShopWine[i].wineId);
    }

    //해당 인덱스의 와인들 페어링 푸드 가져오기
    const selectFoodPairingList=await wineDao.selectPairingFoodList(connection,shopWineList);
    console.log(selectFoodPairingList);

    connection.release();
    return response(baseResponse.SUCCESS,[{wineCount:selectShopWine.length}].concat({wineList:selectShopWine}).concat({pairingFoodList:selectFoodPairingList}));
};