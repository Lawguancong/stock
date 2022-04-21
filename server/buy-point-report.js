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

const cc = flat_array.reduce((prev, next, idx, initialArray) => {
    // console.log('prev', prev)
    // console.log('next', next)

    const re_day_value = next.re_trade_date.re_day.value
    const low_percent_value = next.low_trade_date.low_percent.value
    const low_day_value = next.low_trade_date.low_day.value
    const high_percent_value = next.high_trade_date.high_percent.value
    const high_day_value = next.high_trade_date.high_day.value

    const current_yield_value = next.current_trade_date.current_yield.value
    const hold_day_value = next.current_trade_date.current_hold_day.value
    const average_yield_value = next.current_trade_date.current_average_day_yield.value

    const is_invalid = (high_percent_value < low_percent_value) && (high_percent_value && low_percent_value)

    return {
      re_day_total: re_day_value !== -1 ? prev.re_day_total + re_day_value : prev.re_day_total,
      re_day_num: re_day_value !== -1 ? prev.re_day_num + 1 :  prev.re_day_num,

      low_percent_total: low_percent_value !== -1 ? prev.low_percent_total + low_percent_value : prev.low_percent_total,
      low_percent_num: low_percent_value !== -1 ? prev.low_percent_num + 1 :  prev.low_percent_num,
      low_percent_0_num: low_percent_value === 0 ? prev.low_percent_0_num + 1 : prev.low_percent_0_num,
      low_percent_0_trade_date: low_percent_value === 0 ? [...prev.low_percent_0_trade_date, next] : prev.low_percent_0_trade_date,

      low_day_total: low_day_value !== -1 ? prev.low_day_total + low_day_value : prev.low_day_total,
      low_day_num: low_day_value !== -1 ? prev.low_day_num + 1 :  prev.low_day_num,

      high_percent_total: high_percent_value !== -1 ? prev.high_percent_total + high_percent_value : prev.high_percent_total,
      high_percent_num: high_percent_value !== -1 ? prev.high_percent_num + 1 :  prev.high_percent_num,

      high_day_total: high_day_value !== -1 ? prev.high_day_total + high_day_value : prev.high_day_total,
      high_day_num: high_day_value !== -1 ? prev.high_day_num + 1 :  prev.high_day_num,

      invalid_num: is_invalid ? prev.invalid_num + 1 :  prev.invalid_num,
      invalid_trade_date: is_invalid ? [...prev.invalid_trade_date, next] : prev.invalid_trade_date,

      current_yield_total: prev.current_yield_total + current_yield_value,
      current_yield_num: prev.current_yield_num + 1,

      hold_day_total: prev.hold_day_total + hold_day_value,
      hold_day_num: prev.hold_day_num + 1,

      
      average_yield_total: prev.average_yield_total + average_yield_value,
      average_yield_num: prev.average_yield_num + 1,
     
    }
  }, {
    re_day_total: 0, // re_day 总量
    re_day_num: 0, // re_day 数量

    low_percent_total: 0, // low_percent 总量
    low_percent_num: 0, // low_percent 数量
    low_percent_0_num: 0, // 回撤为0的数量
    low_percent_0_trade_date: [],


    low_day_total: 0, // low_day 总量
    low_day_num: 0, // low_day 数量

    high_percent_total: 0, // high_percent 总量
    high_percent_num: 0, // high_percent 数量

    high_day_total: 0, // high_day 总量
    high_day_num: 0, // high_day 数量

    invalid_num: 0, // 最差买点数量
    invalid_trade_date: [],

    current_yield_total: 0,
    current_yield_num: 0,

    hold_day_total: 0,
    hold_day_num: 0,

    average_yield_total: 0,
    average_yield_num: 0,
  })

  console.log(cc)
  
//   console.log(hold_day_sort[0])
//   console.log(hold_day_sort[hold_day_sort.length - 1])


const current_yield_sort = flat_array.sort((prev, next) => prev.current_trade_date.current_yield.value - next.current_trade_date.current_yield.value)
const hold_day_sort = flat_array.sort((prev, next) => prev.current_trade_date.current_hold_day.value - next.current_trade_date.current_hold_day.value)
const average_yield_sort = flat_array.sort((prev, next) => prev.current_trade_date.current_average_day_yield.value - next.current_trade_date.current_average_day_yield.value)


  const keyItems = ['name', 'ts_code', 'area', 'industry', 'chinese_desc', 'trade_date']
  const re_day_max = flat_array.filter(item => item.re_trade_date.re_day.value > 0).sort((prev,next) => next.re_trade_date.re_day.value - prev.re_trade_date.re_day.value)[0]

    const data = {
        other: {
            invalid: {
                chinese_desc: '最差买点（最大收益<最大回撤）',
                invalid_num: cc.invalid_num,
                invalid_trade_date: cc.invalid_trade_date
                // buy_point_trade_date_num: flat_array.length,
                // buy_point_trade_date_percent: (cc.invalid_num / flat_array.length) * 100,
            },
            low_percent_0_num: {
                chinese_desc: '最佳买点（无回撤）',
                value: cc.low_percent_0_num,
                low_percent_0_trade_date: cc.low_percent_0_trade_date
            },
        },
        average: {
            current_average_day_yield: {
                chinese_desc: `buy_point_date持有到 当前${tradeDate}交易日 平均每天(+收益率)/(-回撤率)(%)`,
                value: cc.average_yield_total / cc.average_yield_num,
            },
            current_yield_average: {
                chinese_desc: `buy_point_date持有到 当前${tradeDate}交易日 平均(+收益率)/(-回撤率)(%)`,
                value: cc.current_yield_total / cc.current_yield_num,
            },
            hold_day_average: {
                chinese_desc: `买点交易日持有到 当前${tradeDate}交易日 平均-持有天数`,
                value: cc.hold_day_total / cc.hold_day_num,
            },
            re_day_average: {
                value: cc.re_day_total / cc.re_day_num,
                chinese_desc: '平均-回本天数'
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
            average_yield_max: {
                chinese_desc: `buy_point_date持有到 当前${tradeDate}交易日 最高(+收益率)/(-回撤率)(%)`,
                value: average_yield_sort[average_yield_sort.length - 1]
            },
            current_yield_max: {
                chinese_desc: `buy_point_date持有到 当前${tradeDate}交易日 最大-(+收益率)/(-回撤率)(%)`,
                value: current_yield_sort[current_yield_sort.length - 1]
            },
            hold_day_max: {
                chinese_desc: `买点交易日持有到 当前${tradeDate}交易日 最大-持有天数`,
                value: hold_day_sort[hold_day_sort.length - 1]
            },
            re_day_max: {
                value: flat_array.filter(item => item.re_trade_date.re_day.value > 0).sort((prev,next) => next.re_trade_date.re_day.value - prev.re_trade_date.re_day.value)[0],
                // value: {
                //     ...pick(re_day_max, [].concat(keyItems, ['buy_point_date'])),
                //     re_trade_date: pick(re_day_max.re_trade_date, [].concat(keyItems, ['re_day']))
                // },
                chinese_desc: '最大-回本天数'
            },
            low_percent_max: {
                value: flat_array.filter(item => item.low_trade_date.low_percent.value > 0).sort((prev,next) => next.low_trade_date.low_percent.value - prev.low_trade_date.low_percent.value)[0],
                chinese_desc: '最大-回撤比例(%)'
            },
            low_day_max: {
                value: flat_array.filter(item => item.low_trade_date.low_day.value > 0).sort((prev,next) => next.low_trade_date.low_day.value - prev.low_trade_date.low_day.value)[0],
                chinese_desc: '最大-回撤天数'
            },
            high_percent_max: {
                value: flat_array.filter(item => item.high_trade_date.high_percent.value > 0).sort((prev,next) => next.high_trade_date.high_percent.value - prev.high_trade_date.high_percent.value)[0],
                chinese_desc: '最大-涨幅比例(%)'
            },
            high_day_max: {
                value: flat_array.filter(item => item.high_trade_date.high_day.value > 0).sort((prev,next) => next.high_trade_date.high_day.value - prev.high_trade_date.high_day.value)[0],
                chinese_desc: '最大-涨幅天数'
            },
        },
        min:{ 
            average_yield_min: {
                chinese_desc: `buy_point_date持有到 当前${tradeDate}交易日 最小-(+收益率)/(-回撤率)(%)`,
                value: average_yield_sort[0]
            },
            current_yield_min: {
                chinese_desc: `buy_point_date持有到 当前${tradeDate}交易日 最小-(+收益率)/(-回撤率)(%)`,
                value: current_yield_sort[0]
            },
            hold_day_min: {
                chinese_desc: `买点交易日持有到 当前${tradeDate}交易日 最小-持有天数`,
                value: hold_day_sort[0]
            },
            re_day_min: {
                value: flat_array.filter(item => item.re_trade_date.re_day.value > 0).sort((prev,next) => prev.re_trade_date.re_day.value - next.re_trade_date.re_day.value)[0],
                chinese_desc: '最小-回本天数'
            },
            low_percent_min: {
                value: flat_array.filter(item => item.low_trade_date.low_percent.value > 0).sort((prev,next) => prev.low_trade_date.low_percent.value - next.low_trade_date.low_percent.value)[0],
                chinese_desc: '最小-回撤比例(%)'
            },
            low_day_min: {
                value: flat_array.filter(item => item.low_trade_date.low_day.value > 0).sort((prev,next) => prev.low_trade_date.low_day.value - next.low_trade_date.low_day.value)[0],
                chinese_desc: '最小-回撤天数'
            },
            high_percent_min: {
                value: flat_array.filter(item => item.high_trade_date.high_percent.value > 0).sort((prev,next) => prev.high_trade_date.high_percent.value - next.high_trade_date.high_percent.value)[0],
                chinese_desc: '最小-涨幅比例(%)'
            },
            high_day_min: {
                value: flat_array.filter(item => item.high_trade_date.high_day.value > 0).sort((prev,next) => prev.high_trade_date.high_day.value - next.high_trade_date.high_day.value)[0],
                chinese_desc: '最小涨幅天数'
            },
        }
    }

let str = JSON.stringify(data, null, "\t")
fs.writeFileSync(buyPointReportPath, str);