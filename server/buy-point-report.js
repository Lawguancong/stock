// 股票买点分析报告
const { resolve } = require('path');
const fs = require('fs');
const getPathBySource = (...paths) => resolve(__dirname, '../', ...paths);
const analyseStockPath = getPathBySource('./public/database/analyse-stock.json');
const analyseStockDatabase = require('../public/database/analyse-stock.json');
const buyPointReportPath = getPathBySource('./public/database/buy-point-report.json');

const { tradeDate } = require('./config')
const { map, get, join, minBy, maxBy, reverse, sortBy, cloneDeep } =  require('loadsh');
const moment = require('moment');

// console.log('analyseStockDatabase', analyseStockDatabase)



const flat_array = deepFlatten(analyseStockDatabase.formatBuyPointStockItem)

function deepFlatten (arr) {
    return [].concat(...arr.map(v => (Array.isArray(v) ? deepFlatten(v) : v)))    
}

// console.log('flat_array', flat_array)

const cc = flat_array.reduce((pre, next, idx, initialArray) => {
    // console.log('pre', pre)
    // console.log('next', next)

    const re_day_value = next.re_trade_date.re_day.value
    const low_percent_value = next.low_trade_date.low_percent.value
    const low_day_value = next.low_trade_date.low_day.value
    const high_percent_value = next.high_trade_date.high_percent.value
    const high_day_value = next.high_trade_date.high_day.value



    return {
      re_day_total: re_day_value !== -1 ? pre.re_day_total + re_day_value : pre.re_day_total,
      re_day_num: re_day_value !== -1 ? pre.re_day_num + 1 :  pre.re_day_num,

      low_percent_total: low_percent_value !== -1 ? pre.low_percent_total + low_percent_value : pre.low_percent_total,
      low_percent_num: low_percent_value !== -1 ? pre.low_percent_num + 1 :  pre.low_percent_num,

      low_day_total: low_day_value !== -1 ? pre.low_day_total + low_day_value : pre.low_day_total,
      low_day_num: low_day_value !== -1 ? pre.low_day_num + 1 :  pre.low_day_num,

      high_percent_total: high_percent_value !== -1 ? pre.high_percent_total + high_percent_value : pre.high_percent_total,
      high_percent_num: high_percent_value !== -1 ? pre.high_percent_num + 1 :  pre.high_percent_num,

      high_day_total: high_day_value !== -1 ? pre.high_day_total + high_day_value : pre.high_day_total,
      high_day_num: high_day_value !== -1 ? pre.high_day_num + 1 :  pre.high_day_num,
     
    }
  }, {
    re_day_total: 0, // re_day 总量
    re_day_num: 0, // re_day 数量

    low_percent_total: 0, // low_percent 总量
    low_percent_num: 0, // low_percent 数量

    low_day_total: 0, // low_day 总量
    low_day_num: 0, // low_day 数量

    high_percent_total: 0, // high_percent 总量
    high_percent_num: 0, // high_percent 数量

    high_day_total: 0, // high_day 总量
    high_day_num: 0, // high_day 数量
  })
const objjj = {
re_day_average: {
    value: cc.re_day_total / cc.re_day_num,
    chinese_desc: '平均回本天数'
},
re_day_min: {
    value: flat_array.filter(item => item.re_trade_date.re_day.value > 0).sort((pre,next) => pre.re_trade_date.re_day.value - next.re_trade_date.re_day.value)[0],
    chinese_desc: '最小回本天数'
},
re_day_max: {
    value: flat_array.filter(item => item.re_trade_date.re_day.value > 0).sort((pre,next) => next.re_trade_date.re_day.value - pre.re_trade_date.re_day.value)[0],
    chinese_desc: '最大回本天数'
},
low_percent_average: {
    value: cc.low_percent_total / cc.low_percent_num,
    chinese_desc: '平均-回撤比例(%)'
},
low_percent_min: {
    value: flat_array.filter(item => item.low_trade_date.low_percent.value > 0).sort((pre,next) => pre.low_trade_date.low_percent.value - next.low_trade_date.low_percent.value)[0],
    chinese_desc: '最小-回撤比例(%)'
},
low_percent_max: {
    value: flat_array.filter(item => item.low_trade_date.low_percent.value > 0).sort((pre,next) => next.low_trade_date.low_percent.value - pre.low_trade_date.low_percent.value)[0],
    chinese_desc: '最大-回撤比例(%)'
},
low_day_average: {
    value: cc.low_day_total / cc.low_day_num,
    chinese_desc: '平均-回撤天数'
},
low_day_min: {
    value: flat_array.filter(item => item.low_trade_date.low_day.value > 0).sort((pre,next) => pre.low_trade_date.low_day.value - next.low_trade_date.low_day.value)[0],
    chinese_desc: '最小-回撤天数'
},
low_day_max: {
    value: flat_array.filter(item => item.low_trade_date.low_day.value > 0).sort((pre,next) => next.low_trade_date.low_day.value - pre.low_trade_date.low_day.value)[0],
    chinese_desc: '最大-回撤天数'
},
high_percent_average: {
    value: cc.high_percent_total / cc.high_percent_num,
    chinese_desc: '平均-涨幅比例(%)'
},
high_percent_min: {
    value: flat_array.filter(item => item.high_trade_date.high_percent.value > 0).sort((pre,next) => pre.high_trade_date.high_percent.value - next.high_trade_date.high_percent.value)[0],
    chinese_desc: '最小-涨幅比例(%)'
},
high_percent_max: {
    value: flat_array.filter(item => item.high_trade_date.high_percent.value > 0).sort((pre,next) => next.high_trade_date.high_percent.value - pre.high_trade_date.high_percent.value)[0],
    chinese_desc: '最大-涨幅比例(%)'
},
high_day_average: {
    value: cc.high_day_total / cc.high_day_num,
    chinese_desc: '平均-涨幅天数'
},
high_day_min: {
    value: flat_array.filter(item => item.high_trade_date.high_day.value > 0).sort((pre,next) => pre.high_trade_date.high_day.value - next.high_trade_date.high_day.value)[0],
    chinese_desc: '最小涨幅天数'
},
high_day_max: {
    value: flat_array.filter(item => item.high_trade_date.high_day.value > 0).sort((pre,next) => next.high_trade_date.high_day.value - pre.high_trade_date.high_day.value)[0],
    chinese_desc: '最大-涨幅天数'
},
}


const data = {
    ...objjj,
}

let str = JSON.stringify(data, null, "\t")
fs.writeFileSync(buyPointReportPath, str);