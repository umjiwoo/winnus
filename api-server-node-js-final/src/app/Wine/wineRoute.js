const jwtMiddleware = require("../../../config/jwtMiddleware");
const wine = require("./wineController");
module.exports = function(app){
    const wine = require('./wineController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    //실시간 인기 와인 리스트 가져오기 api-query string
    app.get('/app/wines/hot',jwtMiddleware,wine.getWineList);
    //오늘의 와인 리스트 가져오기 api
    app.get('/app/wines/today',jwtMiddleware,wine.getTodayWineList);

    //테마별 와인 리스트 가져오기 api
    app.get('/app/wines/theme',jwtMiddleware,wine.getWineListByTheme);

    //필터 검색 api
    app.get('/app/wines/filter',jwtMiddleware,wine.getWineListByFilter);

    //필터 검색을 위한 향,음식 리스트 내보내주기
    app.get('/app/aromas',wine.getAromaList);
    app.get('/app/foods',wine.getFoodList);

    //와인 상세 페이지 api
    app.get('/app/wines/:wineId',jwtMiddleware,wine.getWineInfo);

    //와인 리뷰 조회 api
    app.get('/app/reviews/:wineId',jwtMiddleware,wine.getWineReviews);

    //일부 키워드로 와인 이름 조회 api
    app.get('/app/wineNames',jwtMiddleware,wine.getWineNames);

    //와인 이름 검색 api
    app.get('/app/wines',jwtMiddleware,wine.getWineByName);

    //와인 상점 검색
    app.get('/app/shops',jwtMiddleware,wine.getShops);

    //상점 상세 조회 api
    app.get('/app/shops/:shopId',jwtMiddleware,wine.getShopDetail);
};