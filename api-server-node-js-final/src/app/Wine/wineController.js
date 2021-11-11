const jwtMiddleware = require("../../../config/jwtMiddleware");
const wineProvider = require("./wineProvider");
const wineService = require("./wineService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const {emit} = require("nodemon");

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
    const keyword=req.query.keyword;
    if(!keyword)
        return res.send(errResponse(baseResponse.ENTER_WINE_SEARCH_KEYWORD));
    const wineNameListRes=await wineProvider.retrieveWineNamesByKeyword(keyword);
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
    const {type,taste,flavors,foods,price}=req.query;
    console.log("쿼리 스트링 값");
    console.log("type\n",type);
    console.log("taste\n",taste);
    console.log("flavors\n",flavors);
    console.log("foods\n",foods);
    console.log("price\n",price);
    const getWineListByFilterRes=await wineProvider.retrieveWinesByFilter(userIdFromJWT,type,taste,flavors,foods,price);
    return res.send(getWineListByFilterRes);
};
