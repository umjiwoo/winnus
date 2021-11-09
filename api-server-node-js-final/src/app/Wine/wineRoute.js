module.exports = function(app){
    const wine = require('./wineController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    //와인 리스트 가져오기 api-query string
    app.get('/app/wines/hot',jwtMiddleware,wine.getWineList);

    //와인 상세 페이지 api
    app.get('/app/wines/:wineId',jwtMiddleware,wine.getWineInfo);

    //와인 리뷰 조회 api
    app.get('/app/reviews/:wineId',jwtMiddleware,wine.getWineReviews);
};