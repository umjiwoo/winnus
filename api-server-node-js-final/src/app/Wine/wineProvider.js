const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const wineDao = require("./wineDao");

const {response,errResponse} = require("../../../config/response");
const baseResponse = require("../../../config/baseResponseStatus");


// Provider: Read 비즈니스 로직 처리
exports.retrieveWineList=async function(){
    const connection=await pool.getConnection(async (conn) => conn);
    const wineList=await wineDao.selectWineList(connection);
    console.log("실시간 인기 와인-전체\n",wineList);
    connection.release();
    return response(baseResponse.SUCCESS,wineList);
};

exports.retrieveWineListByType=async function(type){
    const connection=await pool.getConnection(async (conn) => conn);
    const wineList=await wineDao.selectWineListByType(connection,type);
    console.log("실시간 인기 와인-타입별\n",wineList);
    connection.release();
    return response(baseResponse.SUCCESS,wineList);
};

exports.retrieveTodayWineList=async function(){
    const connection=await pool.getConnection(async (conn) => conn);
    //전체 와인 수 조회
    const wineNum=await wineDao.selectWineCount(connection);
    //와인 인덱스값 내에서 랜덤하게 번호 추출-6개
    const wineIdxList=[];
    while(wineIdxList.length<6){
        const randomNum=Math.floor(Math.random()*wineNum[0].wineNum)+1;
        if(!wineIdxList.includes(randomNum))
            wineIdxList.push(randomNum);
    }
    console.log(wineIdxList);
    //해당 인덱스 와인(인덱스,이미지,이름,가격) 가져오기
    const todayWineList=[];
    for(let i=0;i<wineIdxList.length;i++) {
        const wineIdx=wineIdxList[i];
        const wineRes = await wineDao.selectTodayWines(connection, wineIdx);
        console.log(wineRes);
        todayWineList.push(wineRes);
    }
    console.log("오늘의 와인 조회 결과",todayWineList);
    connection.release();
    return response(baseResponse.SUCCESS,{todayWines:todayWineList});
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

    console.log("와인 상세정보 조회 결과\n",[{wineInfo:wineInfo}].concat({flavorList:flavor}).concat({pairingFoodList:pairingFood}).concat({reviews:reviews}).concat({bestWineListByType:wineListByType}).concat({similarWineList:similarWineList}));

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
    console.log("와인 리뷰 조회 결과\n",retrieveWineReviewsRes);
    connection.release();
    return response(baseResponse.SUCCESS,{wineReviews:retrieveWineReviewsRes});
};

exports.retrieveWineListByTheme=async function(theme){
    const connection=await pool.getConnection(async (conn) => conn);
    if(theme==="floral"){
        const floralWineList=await wineDao.selectFloralWines(connection);
        if(floralWineList.length<1)
            return errResponse(baseResponse.WINE_NOT_EXIST_FOR_THIS_THEME);
        console.log("플로럴 아로마 와인 리스트\n",floralWineList);
        connection.release();
        return response(baseResponse.SUCCESS,{themeWineList:floralWineList});
    }
    if(theme==="homeParty"){
        const homePartyWineList=await wineDao.selectWinesForHomeParty(connection);
        if(homePartyWineList.length<1)
            return errResponse(baseResponse.WINE_NOT_EXIST_FOR_THIS_THEME);
        console.log("홈파티를 위한 와인 리스트\n",homePartyWineList);
        connection.release();
        return response(baseResponse.SUCCESS,{themeWineList:homePartyWineList});
    }
    if(theme==="autumn"){
        const wineListForAutumn=await wineDao.selectWinesForAutumn(connection);
        if(wineListForAutumn.length<1)
            return errResponse(baseResponse.WINE_NOT_EXIST_FOR_THIS_THEME);
        console.log("가을에 어울리는 와인 리스트\n",wineListForAutumn);
        connection.release();
        return response(baseResponse.SUCCESS,{themeWineList:wineListForAutumn});
    }
};

exports.retrieveWineNamesByKeyword=async function(keyword){
    const connection=await pool.getConnection(async (conn) => conn);
    const keywordSplitList=keyword.split("");
    const repeatNum=keywordSplitList.length;
    //문자 사이사이 와일드카드 삽입
    for(let i=0;i<repeatNum;i++){
        keywordSplitList.splice(i*2,0,"%");
    }
    //맨 마지막에 와일드카드 추가해주기
    keywordSplitList.push("%");
    //배열 문자열로 합치기
    //여기서 join.("%")했어도 됨
    keyword=keywordSplitList.join("");

    const wineNamesRes=await wineDao.selectWineNameByKeyword(connection,keyword);
    if(wineNamesRes.length<1)
        return errResponse(baseResponse.WINE_NOT_EXIST_INCLUDE_THIS_KEYWORD);

    console.log("키워드로 와인 이름 조회\n",wineNamesRes);

    connection.release();
    return response(baseResponse.SUCCESS,{wineNames:wineNamesRes});
};

exports.retrieveWineByName=async function(wineName){
    const connection=await pool.getConnection(async (conn) => conn);
    const retrieveWineRes=await wineDao.selectWineByName(connection,wineName);
    if(retrieveWineRes.length<1)
        return errResponse(baseResponse.WINE_NOT_EXIST_FOR_THIS_NAME);
    connection.release();
    return response(baseResponse.SUCCESS,retrieveWineRes);
};