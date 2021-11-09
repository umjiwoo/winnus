const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const wineDao = require("./wineDao");

const {response,errResponse} = require("../../../config/response");
const baseResponse = require("../../../config/baseResponseStatus");


// Provider: Read 비즈니스 로직 처리
exports.retrieveWineList=async function(){
    const connection=await pool.getConnection(async (conn) => conn);
    const wineList=await wineDao.selectWineList(connection);
    console.log(wineList);
    connection.release();
    return response(baseResponse.SUCCESS,wineList);
};

exports.retrieveWineListByType=async function(type){
    const connection=await pool.getConnection(async (conn) => conn);
    const wineList=await wineDao.selectWineListByType(connection,type);
    connection.release();
    return response(baseResponse.SUCCESS,wineList);
};

exports.retrieveWineInfo=async function(wineId){
    const connection=await pool.getConnection(async (conn) => conn);

    const wineStatusCheckRes=await wineDao.selectWineStatus(connection,wineId);
    if(wineStatusCheckRes.length<1 || wineStatusCheckRes[0].status==="DELETED")
        return errResponse(baseResponse.WINE_NOT_EXIST);

    const wineInfo=await wineDao.selectWineInfo(connection,wineId);
    const flavor=await wineDao.selectWineFlavor(connection,wineId);
    const pairingFood=await wineDao.selectPairingFood(connection,wineId);
    const reviews=await wineDao.selectWineReviewLimit3(connection,wineId);
    //같은 타입 와인 베스트 가져오기
    const wineType=wineInfo[0].typeId;
    const wineListByType=await wineDao.selectBestWineListByType(connection,wineType,wineId);

    //비슷한 와인 가져오기
    const sweetness=wineInfo[0].sweetness;
    const acidity=wineInfo[0].acidity;
    const body=wineInfo[0].body;
    const tannin=wineInfo[0].tannin;

    const similarWineList=await wineDao.selectSimilarWineList(connection,sweetness,acidity,body,tannin,wineId);
    console.log(similarWineList);

    connection.release();
    return response(baseResponse.SUCCESS,[{wineInfo:wineInfo}].concat({flavorList:flavor}).concat({pairingFoodList:pairingFood}).concat({reviews:reviews}).concat({bestWineListByType:wineListByType}).concat({similarWineList:similarWineList}));
};

exports.wineCheck=async function(wineId){
    const connection=await pool.getConnection(async (conn) => conn);
    const wineStatusCheckRes=await wineDao.selectWineStatus(connection,wineId);
    connection.release();
    return wineStatusCheckRes;
};

exports.retrieveWineReviews=async function(wineId){
    const connection=await pool.getConnection(async (conn) => conn);
    const wineStatusCheckRes=await wineDao.selectWineStatus(connection,wineId);
    if(wineStatusCheckRes.length<1 || wineStatusCheckRes[0].status==="DELETED")
        return errResponse(baseResponse.WINE_NOT_EXIST);

    const retrieveWineReviewsRes=await wineDao.selectWineReviews(connection,wineId);
    connection.release();
    return response(baseResponse.SUCCESS,{wineReviews:retrieveWineReviewsRes});
};