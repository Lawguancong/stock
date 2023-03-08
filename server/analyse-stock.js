
const { resolve } = require('path');
const fs = require('fs');
const getPathBySource = (...paths) => resolve(__dirname, '../', ...paths);
const stockHistoryDatabase = require('../public/database/stock-history.json');
const analyseStockPath = getPathBySource('./public/database/analyse-stock.json');
const { map, get, join, minBy, maxBy, reverse, sortBy, cloneDeep } =  require('loadsh');
const moment = require('moment');


const dayTimes = (24 * 60 * 60 * 1000);

const { 
  tradeDate, 
  preDay, 
  token,
  ts_code_key,
  trade_date_key,
  vol_key,
  open_key,
  close_key,
  pre_close_key,
  high_key,
  low_key,
  pct_chg_key,
} = require('./config')
const tsCodeList = Object.keys(stockHistoryDatabase)
let buyPointStockItem = []
function analyseEachStock ({
  formatItems
}) {
  getBuyPoint({
    formatItems, 
  })
}
function getBuyPoint({
  formatItems, 
}) {
  let trade_date_range = 800;// 样本范围
  let pre_trade_date = 100;// 先前多少个交易日；太多没意义，可能不符合 低估的
  if (formatItems.length < trade_date_range) {
    trade_date_range = formatItems.length;
    pre_trade_date = 0;
  } else if (formatItems.length < (trade_date_range + pre_trade_date)) {
    pre_trade_date = formatItems.length - trade_date_range;
  }
  let changeList = [];
  let sellPointList = [];
  for (let i = pre_trade_date ; i >= 0; i--) {
    const sourceData = [...formatItems].reverse();
    let rangeDate = []
    if (i === 0) {
      rangeDate = [...sourceData].slice(-trade_date_range);
    } else { 
      rangeDate = [...sourceData].slice(-trade_date_range - i, -i);
    }
    // console.log('_____________________')
    // console.log('trade_date_range', trade_date_range)
    // console.log('pre_trade_date', pre_trade_date)
    // console.log('rangeDate', rangeDate[0].trade_date)
    // console.log('rangeDate', rangeDate[rangeDate.length-1].trade_date)
    


    const pre_0_currentDate = rangeDate[rangeDate.length - 1] || {} // 最近一个交易日的数据
    // console.log('pre_0_currentDate', pre_0_currentDate[trade_date_key])
    // const flat_industry = ['银行'].includes(pre_0_currentDate.industry); // 过滤特殊行业
    // if (flat_industry) continue;
    const pre_1_currentDate = rangeDate[rangeDate.length - 2] || {} // 最近一个交易日的前1天
    const pre_2_currentDate = rangeDate[rangeDate.length - 3] || {} // 最近一个交易日的前2天
    const up_3 = (pre_2_currentDate[close_key] > pre_2_currentDate[open_key]) || (pre_2_currentDate[close_key] === pre_2_currentDate[open_key] && pre_2_currentDate[close_key] > pre_2_currentDate[pre_close_key])//  阳线
    const up_2 = (pre_1_currentDate[close_key] > pre_1_currentDate[open_key]) || (pre_1_currentDate[close_key] === pre_1_currentDate[open_key] && pre_1_currentDate[close_key] > pre_1_currentDate[pre_close_key]) // 阳线
    const up_1 = pre_0_currentDate[close_key] >= pre_0_currentDate[open_key] // 阳线
    const flat7 = pre_0_currentDate[close_key] >= pre_1_currentDate[close_key]  || pre_0_currentDate[close_key] >= pre_2_currentDate[close_key] || pre_0_currentDate[high_key] > pre_2_currentDate[close_key] //  pre_0 收盘价  >= pre_2 收盘价，保证趋势向上
    const flat9 = ((pre_2_currentDate[vol_key] <= pre_0_currentDate[vol_key]) || (pre_1_currentDate[vol_key] <= pre_0_currentDate[vol_key])) // 成交量至少要放量
    if (!(up_1 && up_2 && up_3)) continue;
    if (!flat7) continue;
    if (!flat9) continue;
    const sort_min_vol = [...rangeDate].sort((prev, next) => prev[vol_key] - next[vol_key]) // vol 从小到大排序，然后去掉前10，取第【10】；前10可能太小 有误差
    const sort_min_vol_half_trade_date_range = [...rangeDate].slice(-trade_date_range / 2).sort((prev, next) => prev[vol_key] - next[vol_key]); // 该交易日最近200交易日区间
    const pre_0_currentDate_pct_change = pre_0_currentDate[pct_chg_key] || 0 // 涨跌幅
    const min_low_obj = [...rangeDate].sort((prev, next) => prev[low_key] - next[low_key])[0]
    const flat1 = (pre_0_currentDate[close_key] / min_low_obj[low_key]) // < 1.1; （最近一个交易日的收盘价 / 最低价）；最近 dayNum
    const flat2 = (pre_0_currentDate[vol_key] / min_low_obj[vol_key]) //< 1.1；（最近一个交易日的成交量 / 最低价的成交量）；最近 dayNum
    const flat3 = (pre_0_currentDate[vol_key] / sort_min_vol[Math.floor(sort_min_vol.length / 10)][vol_key]) //< 1.1； 最近 pre_trade_date TD相对比较低成交量
    const flat10 = (pre_0_currentDate[vol_key] / sort_min_vol_half_trade_date_range[Math.floor(sort_min_vol_half_trade_date_range.length / 10)][vol_key]) // 
    // todo W底判断。。 至少2重底 3重底
    if(!(
      flat1 <= 1.10
      && flat2 <= 1.10
      &&  
      (
        flat3 <= 1.10
        || ((flat3 <= 1.25) && pre_0_currentDate_pct_change > 1)
        || ((flat3 <= 1.5) && pre_0_currentDate_pct_change > 1.5)
        || ((flat3 <= 1.75) && pre_0_currentDate_pct_change > 2)
        || ((flat3 <= 2) && pre_0_currentDate_pct_change > 2.5)
        || ((flat3 <= 2.25) && pre_0_currentDate_pct_change > 3)
        || ((flat3 <= 2.5) && pre_0_currentDate_pct_change > 3.5)

        // || ((flat3 <= 1.10 || flat10 <= 1.10))
        // || ((flat3 <= 1.25 || flat10 <= 1.25) && pre_0_currentDate_pct_change > 1)
        // || ((flat3 <= 1.5 || flat10 <= 1.5) && pre_0_currentDate_pct_change > 1.5)
        // || ((flat3 <= 1.75 || flat10 <= 1.75) && pre_0_currentDate_pct_change > 2)
        // || ((flat3 <= 2 || flat10 <= 2) && pre_0_currentDate_pct_change > 2.5)
        // || ((flat3 <= 2.25 || flat10 <= 2.25) && pre_0_currentDate_pct_change > 3)
        // || ((flat3 <= 2.5 || flat10 <= 2.5) && pre_0_currentDate_pct_change > 3.5)
      )
    )) continue;

    const shouldConsole =  (
      rangeDate[rangeDate.length - 1][ts_code_key] === "002853.SZ"
      // && rangeDate[rangeDate.length - 1][trade_date_key] === "20200618" 
      && true
      )
   
    // if (shouldConsole) {

    //   const trade_date_range_100 = [...rangeDate].slice(-20).map(item => item[vol_key]); // 该交易日最近200交易日区间
    //   const vol_total = trade_date_range_100.reduce((prev, next) => prev + next, 0);
   
  
    //   const vol_average = vol_total / trade_date_range_100.length
    //   const fangcha = trade_date_range_100.reduce((prev, next) => {
    //       return prev + ((next - vol_average) * (next - vol_average))
    //   }, 0)
    //   const xxx = fangcha / (vol_average * vol_average)
  
    //     // console.log('trade_date_range_100', trade_date_range_100)
    //   console.log('---------------------------------')
    //   console.log('rangeDate[rangeDate.length - 1][trade_date_key]', rangeDate[rangeDate.length - 1][trade_date_key])
    //   // console.log('trade_date_range_1 ', trade_date_range_100[0])
    //   // console.log('trade_date_range_100[trade_date_range_100.length-1], ', trade_date_range_100[trade_date_range_100.length-1])
    //   // console.log('vol_totalobj', vol_total)
    //   // console.log('vol_average', vol_average)
    //   // console.log('fangcha', fangcha)
    //   console.log('xxx', xxx)
    //   if (xxx > 3) continue;
  
    //     // console.log('flat1', flat1, flat1 < 1.10)
    //     // console.log('flat2', flat2, flat2 < 1.10)
    //     // console.log('flat3', flat3, flat3 < 1.10)
    //     // console.log('flat10', flat10, flat10 < 1.10)
    //     // console.log('1连阳', up_3)
    //     // console.log('2连阳', up_2)
    //     // console.log('3连阳', up_1)
    //     // console.log('保证趋势向上', flat7)
    //     // console.log('< 0.2 如果是急跌,则筑底不够稳', flat8, flat8 < 0.2)
    //     // console.log('成交量逐渐放量', flat9)
    //     // if (
    //     //   flat3 >= 10
    //     //   && pre_0_currentDate[pct_chg_key] < 0
    //     //   && (pre_0_currentDate[open_key] < pre_0_currentDate[pre_close_key])
    //     //   ) {
    
    //     //     console.log('放量跌', pre_0_currentDate)
    //     //   }
  
    //   }
    let re_day = -1;  // 回本天数
    let high_percent = -1;  // 涨幅比例(%)
    let high_day = -1; // 涨幅天数
    let low_percent = -1; // 回撤比例(%); [-1, 没回本] [0, 已回本] [>0:, 回本后,后续有更低的回撤点]
    let low_day = -1;  // 回撤天数
    const re_trade_date = sourceData.find(item => (item[trade_date_key] > pre_0_currentDate[trade_date_key]) && (item[close_key] > pre_0_currentDate[close_key]))// 回本的交易日
    const low_trade_date = sourceData.filter(item => (item[trade_date_key] > pre_0_currentDate[trade_date_key]) && (item[low_key] < pre_0_currentDate[low_key])).sort((prev, next) => prev[low_key] - next[low_key])[0] //  // 最低的交易日
    const high_trade_date = sourceData.filter(item => (item[trade_date_key] > pre_0_currentDate[trade_date_key]) && ((item[high_key] > pre_0_currentDate[high_key]))).sort((prev, next) => next[high_key] - prev[high_key])[0] //  // 最高的交易日
  
    const current_trade_date = sourceData[sourceData.length - 1];



    const current_yield = ((current_trade_date[close_key] / pre_0_currentDate[close_key]) - 1) * 100;
    const current_hold_day = (moment(current_trade_date[trade_date_key]).valueOf() - moment(pre_0_currentDate[trade_date_key]).valueOf()) / (dayTimes)
    // console.log('current_hold_day', current_hold_day)


    // 在买点持有到 当前trade_date 收益率 平均 最高 最低
    // 在买点持有到 当前trade_date 回撤率 平均 最高 最低


    // todo 180 360天 涨幅 回撤？
    if (re_trade_date) {
      re_day = (moment(re_trade_date[trade_date_key]).valueOf() - moment(pre_0_currentDate[trade_date_key]).valueOf()) / (dayTimes)
      low_percent = 0;
      low_day = 0
    }
    if (high_trade_date) {
      high_percent =  (((Number(high_trade_date[high_key]) - Number(pre_0_currentDate[close_key])) / Number(pre_0_currentDate[close_key])) * 100)
      high_day = (moment(high_trade_date[trade_date_key]).valueOf() - moment(pre_0_currentDate[trade_date_key]).valueOf()) / (dayTimes) 
    }
    if (low_trade_date) {
      low_percent =  (((Number(pre_0_currentDate[close_key]) - Number(low_trade_date[low_key])) / Number(pre_0_currentDate[close_key])) * 100) 
      low_day = (moment(low_trade_date[trade_date_key]).valueOf() - moment(pre_0_currentDate[trade_date_key]).valueOf()) / (dayTimes)
    }
    const params = {
      chinese_desc: '买点交易日',
      re_trade_date: {
        ...re_trade_date,
        chinese_desc: '回本交易日',
        re_day: {
          value: re_day,
          chinese_desc: '回本天数',
        }
      },
      low_trade_date: {
        ...low_trade_date,
        chinese_desc: '最低价格交易日',
        low_percent: {
          value: low_percent,
          chinese_desc: '回撤比例(%)',
        },
        low_day: {
          value: low_day,
          chinese_desc: '回撤天数',
        }
      },
      high_trade_date: {
        ...high_trade_date,
        chinese_desc: '最高价格交易日',
        high_percent: {
          value: high_percent,
          chinese_desc: '涨幅比例(%)',
        },
        high_day: {
          value: high_day,
          chinese_desc: '涨幅天数',
        }
      },
      current_trade_date: {
        ...current_trade_date,
        current_yield: {
          chinese_desc: `在买点持有到 当前${tradeDate}交易日 总(+收益率)/(-回撤率)(%)`,
          value: current_yield,
        },
        current_hold_day : {
          value: current_hold_day,
          chinese_desc: `在买点持有到 当前${tradeDate}交易日 持有天数`,
        },
        current_daily_yield: {
          value: current_yield / current_hold_day,
          chinese_desc: `在买点持有到 当前${tradeDate}交易日 平均每天(+收益率)/(-回撤率)(%)`,
        }
      }
    }
    changeList.push({
      ...pre_0_currentDate,
      ...params,
    })
  }
  if (changeList.length) buyPointStockItem.push(changeList);
}
tsCodeList.map(ts_code => {
  analyseEachStock({
    formatItems: stockHistoryDatabase[ts_code].formatItems
  })
})

const formatBuyPointStockItem = map(buyPointStockItem, item => map(item, ({
  name,
  industry,
  area,
  trade_date,
  ts_code,
  close,
  re_trade_date,
  low_trade_date,
  high_trade_date,
  current_trade_date,
 }) => ({
  name,
  industry,
  area,
  buy_point_date: trade_date,
  // trade_date,
  close,
  chinese_desc: '买点交易日',
  ts_code,
  re_trade_date,
  low_trade_date,
  high_trade_date,
  current_trade_date,
})));


const data = {
  formatBuyPointStockItem,
}

let str = JSON.stringify(data, null, "\t")
fs.writeFileSync(analyseStockPath, str);
// fs.writeFile(analyseStockPath, str, function (err) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log('analyseStockPath 写入完成' + analyseStockPath);
//   }
// });