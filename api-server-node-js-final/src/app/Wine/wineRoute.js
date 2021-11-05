module.exports = function(app){
    const wine = require('./wineController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    //와인 리스트 가져오기 api-query string
    app.get('/app/wines',wine.getWineList);

    //와인 상세 페이지 api
    app.get('/app/wines/:wineId',wine.getWineInfo);
};