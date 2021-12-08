const express = require('./config/express');
const {logger} = require('./config/winston');
const schedule = require('node-schedule');

exports.wineIdxList=[];
const job = schedule.scheduleJob('0 0 24 * *', function () {
//와인 인덱스값 내에서 랜덤하게 번호 추출-6개
    let wineIdxList=[];
    while (wineIdxList.length < 6) {
        const randomNum = Math.floor(Math.random() * 1008) + 1;
        if (!wineIdxList.includes(randomNum))
            wineIdxList.push(randomNum);
    }
    const today=new Date();
    console.log(`${today.getFullYear()}/${today.getMonth()+1}/${today.getDate()} 오늘의 와인 인덱스 `,wineIdxList);
});
//job.cancel();

const port = 3001;
express().listen(port);
logger.info(`${process.env.NODE_ENV} - API Server Start At Port ${port}`);