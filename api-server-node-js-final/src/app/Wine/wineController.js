const jwtMiddleware = require("../../../config/jwtMiddleware");
const wineProvider = require("./wineProvider");
const wineService = require("./wineService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const {emit} = require("nodemon");

exports.getWineList=async function(req,res){
    const type=req.query.type;
    if(!type) {
        const wineList = await wineProvider.retrieveWineList();
        return res.send(wineList);
    }
    else{
        const wineList=await wineProvider.retrieveWineListByType(type);
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