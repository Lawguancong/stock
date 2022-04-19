// 股票买点分析报告
const { resolve } = require('path');
const fs = require('fs');
const getPathBySource = (...paths) => resolve(__dirname, '../', ...paths);
const analyseStockPath = getPathBySource('./public/database/analyse-stock.json');
const analyseStockDatabase = require('../public/database/analyse-stock.json');
const buyPointReportPath = getPathBySource('./public/database/buy-point-report.json');

const { tradeDate } = require('./config')
const { pick } = require('./utils')
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

    const is_invalid = (high_percent_value < low_percent_value) && (high_percent_value && low_percent_value)

    return {
      re_day_total: re_day_value !== -1 ? pre.re_day_total + re_day_value : pre.re_day_total,
      re_day_num: re_day_value !== -1 ? pre.re_day_num + 1 :  pre.re_day_num,

      low_percent_total: low_percent_value !== -1 ? pre.low_percent_total + low_percent_value : pre.low_percent_total,
      low_percent_num: low_percent_value !== -1 ? pre.low_percent_num + 1 :  pre.low_percent_num,
      low_percent_0_num: low_percent_value === 0 ? pre.low_percent_0_num + 1 : pre.low_percent_0_num,
      low_percent_0_trade_date: low_percent_value === 0 ? [...pre.low_percent_0_trade_date, next] : pre.low_percent_0_trade_date,

      low_day_total: low_day_value !== -1 ? pre.low_day_total + low_day_value : pre.low_day_total,
      low_day_num: low_day_value !== -1 ? pre.low_day_num + 1 :  pre.low_day_num,

      high_percent_total: high_percent_value !== -1 ? pre.high_percent_total + high_percent_value : pre.high_percent_total,
      high_percent_num: high_percent_value !== -1 ? pre.high_percent_num + 1 :  pre.high_percent_num,

      high_day_total: high_day_value !== -1 ? pre.high_day_total + high_day_value : pre.high_day_total,
      high_day_num: high_day_value !== -1 ? pre.high_day_num + 1 :  pre.high_day_num,

      invalid_num: is_invalid ? pre.invalid_num + 1 :  pre.invalid_num,
      invalid_trade_date: is_invalid ? [...pre.invalid_trade_date, next] : pre.invalid_trade_date,
     
    }
  }, {
    re_day_total: 0, // re_day 总量
    re_day_num: 0, // re_day 数量

    low_percent_total: 0, // low_percent 总量
    low_percent_num: 0, // low_percent 数量
    low_percent_0_num: 0, // 回撤为0的数量
    low_percent_0_trade_date: [],

    invalid_num: 0, // 无效买点数量
    invalid_trade_date: [],


    low_day_total: 0, // low_day 总量
    low_day_num: 0, // low_day 数量

    high_percent_total: 0, // high_percent 总量
    high_percent_num: 0, // high_percent 数量

    high_day_total: 0, // high_day 总量
    high_day_num: 0, // high_day 数量
  })


  const keyItems = ['name', 'ts_code', 'area', 'industry', 'chinese_desc', 'trade_date']
  const re_day_max = flat_array.filter(item => item.re_trade_date.re_day.value > 0).sort((pre,next) => next.re_trade_date.re_day.value - pre.re_trade_date.re_day.value)[0]

    const data = {
        other: {
            invalid: {
                chinese_desc: '无效买点（现价<买价）',
                invalid_num: cc.invalid_num,
                invalid_trade_date: cc.invalid_trade_date
                // buy_point_trade_date_num: flat_array.length,
                // buy_point_trade_date_percent: (cc.invalid_num / flat_array.length) * 100,
            },
          
            low_percent_0_num: {
                // chinese_desc: '无回撤数量',
                chinese_desc: '有效买点（无回撤）',

                value: cc.low_percent_0_num,
                low_percent_0_trade_date: cc.low_percent_0_trade_date
            },
          
        },
        average: {
            re_day_average: {
                value: cc.re_day_total / cc.re_day_num,
                chinese_desc: '平均回本天数'
            },
            low_percent_average: {
                value: cc.low_percent_total / cc.low_percent_num,
                chinese_desc: '平均-回撤比例(%)'
            },
            low_day_average: {
                value: cc.low_day_total / cc.low_day_num,
                chinese_desc: '平均-回撤天数'
            },
            high_percent_average: {
                value: cc.high_percent_total / cc.high_percent_num,
                chinese_desc: '平均-涨幅比例(%)'
            },
            high_day_average: {
                value: cc.high_day_total / cc.high_day_num,
                chinese_desc: '平均-涨幅天数'
            },
            high_conversion_rate: {
                value: (cc.high_percent_total / cc.high_percent_num) / (cc.high_day_total / cc.high_day_num),
                chinese_desc: '平均-每天涨幅(%)'
            },
            low_conversion_rate: {
                value: (cc.low_percent_total / cc.low_percent_num) / (cc.low_day_total / cc.low_day_num),
                chinese_desc: '平均-每天回撤(%)'
            },

        },
        max: {
            re_day_max: {
                value: flat_array.filter(item => item.re_trade_date.re_day.value > 0).sort((pre,next) => next.re_trade_date.re_day.value - pre.re_trade_date.re_day.value)[0],
                // value: {
                //     ...pick(re_day_max, [].concat(keyItems, ['buy_point_date'])),
                //     re_trade_date: pick(re_day_max.re_trade_date, [].concat(keyItems, ['re_day']))
                // },
                chinese_desc: '最大-回本天数'
            },
            low_percent_max: {
                value: flat_array.filter(item => item.low_trade_date.low_percent.value > 0).sort((pre,next) => next.low_trade_date.low_percent.value - pre.low_trade_date.low_percent.value)[0],
                chinese_desc: '最大-回撤比例(%)'
            },
            low_day_max: {
                value: flat_array.filter(item => item.low_trade_date.low_day.value > 0).sort((pre,next) => next.low_trade_date.low_day.value - pre.low_trade_date.low_day.value)[0],
                chinese_desc: '最大-回撤天数'
            },
            high_percent_max: {
                value: flat_array.filter(item => item.high_trade_date.high_percent.value > 0).sort((pre,next) => next.high_trade_date.high_percent.value - pre.high_trade_date.high_percent.value)[0],
                chinese_desc: '最大-涨幅比例(%)'
            },
            high_day_max: {
                value: flat_array.filter(item => item.high_trade_date.high_day.value > 0).sort((pre,next) => next.high_trade_date.high_day.value - pre.high_trade_date.high_day.value)[0],
                chinese_desc: '最大-涨幅天数'
            },
        },
        min:{ 
            re_day_min: {
                value: flat_array.filter(item => item.re_trade_date.re_day.value > 0).sort((pre,next) => pre.re_trade_date.re_day.value - next.re_trade_date.re_day.value)[0],
                chinese_desc: '最小-回本天数'
            },
            low_percent_min: {
                value: flat_array.filter(item => item.low_trade_date.low_percent.value > 0).sort((pre,next) => pre.low_trade_date.low_percent.value - next.low_trade_date.low_percent.value)[0],
                chinese_desc: '最小-回撤比例(%)'
            },
            low_day_min: {
                value: flat_array.filter(item => item.low_trade_date.low_day.value > 0).sort((pre,next) => pre.low_trade_date.low_day.value - next.low_trade_date.low_day.value)[0],
                chinese_desc: '最小-回撤天数'
            },
            high_percent_min: {
                value: flat_array.filter(item => item.high_trade_date.high_percent.value > 0).sort((pre,next) => pre.high_trade_date.high_percent.value - next.high_trade_date.high_percent.value)[0],
                chinese_desc: '最小-涨幅比例(%)'
            },
            high_day_min: {
                value: flat_array.filter(item => item.high_trade_date.high_day.value > 0).sort((pre,next) => pre.high_trade_date.high_day.value - next.high_trade_date.high_day.value)[0],
                chinese_desc: '最小涨幅天数'
            },
        }
    }

let str = JSON.stringify(data, null, "\t")
fs.writeFileSync(buyPointReportPath, str);