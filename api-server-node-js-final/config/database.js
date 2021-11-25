const mysql = require('mysql2/promise');
const {logger} = require('./winston');

// TODO: 본인의 DB 계정 입력
const pool = mysql.createPool({
    host: 'winnus.cme4mxoaurtt.ap-northeast-2.rds.amazonaws.com',
    user: 'admin',
    port: '3306',
    password: 'Jiwoo4092!',
    database: 'winnus_db'
});

module.exports = {
    pool: pool
};