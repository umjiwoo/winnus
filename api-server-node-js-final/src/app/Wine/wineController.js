const jwtMiddleware = require("../../../config/jwtMiddleware");
const wineProvider = require("./wineProvider");
const wineService = require("./wineService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const {emit} = require("nodemon");
const {insertKeyword} = require("../User/userDao");

exports.getWineList=async function(req,res){
    const userId=req.verifiedToken.userId;
    const type=req.query.type;
    if(!type) {
        const wineList = await wineProvider.retrieveWineList(userId);
        return res.send(wineList);
    }
    else{
        const wineList=await wineProvider.retrieveWineListByType(userId,type);
        return res.send(wineList);
    }
};

exports.getWineInfo=async function(req,res){
    const wineId=req.params.wineId;
    if(!wineId)
        return res.send(errResponse(baseResponse.WINE_ID_NULL));
    const wineInfo=await wineProvider.retrieveWineInfo(wineId);
    return res.send(wineInfo);
};

exports.getWineReviews=async function(req,res){
    const wineId=req.params.wineId;
    if(!wineId)
        return res.send(errResponse(baseResponse.WINE_ID_NULL));
    const reviewList=await wineProvider.retrieveWineReviews(wineId);
    return res.send(reviewList);
};

exports.getTodayWineList=async function(req,res){
    const userId=req.verifiedToken.userId;
    const todayWines=await wineProvider.retrieveTodayWineList(userId);
    return res.send(todayWines);
};

exports.getWineListByTheme=async function(req,res){
    const userId=req.verifiedToken.userId;
    const theme=req.query.theme;
    if(!theme)
        return res.send(errResponse(baseResponse.SELECT_THEME_TO_GET));
    const wineListByThemeRes=await wineProvider.retrieveWineListByTheme(userId,theme);
    return res.send(wineListByThemeRes);
};

exports.getWineNames=async function(req,res){
    const wineNameListRes=await wineProvider.retrieveWineNamesByKeyword();
    return res.send(wineNameListRes);
};

exports.getWineByName=async function(req,res){
    const userIdFromJWT=req.verifiedToken.userId;
    const wineName=req.query.wineName;
    if(!wineName)
        return res.send(errResponse(baseResponse.ENTER_WINE_NAME));
    const getWineRes=await wineProvider.retrieveWineByName(userIdFromJWT,wineName);
    return res.send(getWineRes);
};

exports.getWineListByFilter=async function(req,res){
    const userIdFromJWT=req.verifiedToken.userId;
    const {keyword,type,sweetness,acidity,body,tannin,flavors,foods,price,page,orderBy}=req.query;

    if(!keyword&&!type&&!sweetness&&!acidity&&!body&&!tannin&&!flavors&&!foods&&!price)
        return res.send(errResponse(baseResponse.CHOOSE_FILTERING_ITEM));

    if(!page)
        return res.send(errResponse(baseResponse.ENTER_PAGE_NUMBER_TO_GET));
    if(page<1)
        return res.send(errResponse(baseResponse.PAGE_NUMBER_BEGIN_WITH_1));

    const getWineListByFilterRes=await wineProvider.retrieveWinesByFilter(userIdFromJWT,keyword,type,sweetness,acidity,body,tannin,flavors,foods,price,page,orderBy);
    return res.send(getWineListByFilterRes);
};


exports.getAromaList=async function(req,res){
    const getAromaListRes=await wineProvider.retrieveWineAromaList();
    return res.send(getAromaListRes);
};

exports.getFoodList=async function(req,res){
    const getFoodListRes=await wineProvider.retrieveWineFoodList();
    return res.send(getFoodListRes);
};

exports.getShops=async function(req,res){
    const {wineName,area}=req.query;
    let getShopRes;
    if(!wineName&&!area){ //이름과 지역 지정x -> 전체 와인샵 조회
        getShopRes=await wineProvider.retrieveAllWineShop();
    }
    else if(!wineName){ //이름 지정x -> 지역 와인샵 조회
        getShopRes=await wineProvider.retrieveWineShopByArea(area);
    }
    else if(!area){
        return res.send(errResponse(baseResponse.GOTO_WINE_SEARCH));
    }
    else{
        getShopRes=await wineProvider.retrieveWineShop(wineName,area);
    }
    return res.send(getShopRes);
};


exports.getShopDetail=async function(req,res){
    const userIdFromJWT=req.verifiedToken.userId;
    const shopId=req.params.shopId;
    if(!shopId)
        return res.send(errResponse(baseResponse.ENTER_SHOP_ID_TO_SHOW));
    const getShopDetailRes=await wineProvider.retrieveShopDetail(userIdFromJWT,shopId);
    return res.send(getShopDetailRes);
};