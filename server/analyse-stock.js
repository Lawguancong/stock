
const { resolve } = require('path');
const fs = require('fs');
const getPathBySource = (...paths) => resolve(__dirname, '../', ...paths);
const stockHistoryPath = getPathBySource('./public/database/stock-history.json');
const stockHistoryDatabase = require('../public/database/stock-history.json');
const analyseStockPath = getPathBySource('./public/database/analyse-stock.json');
const { tradeDate } = require('./config')
const { map, get, join, minBy, maxBy, reverse, sortBy, cloneDeep } =  require('loadsh');
const moment = require('moment');


// console.log('stockHistoryDatabase', stockHistoryDatabase)

let tsCodeList = []
for (const [key, value] of Object.entries(stockHistoryDatabase)) {
  tsCodeList.push(key)
}

// let tsCodeList = ['002067.SZ']
// console.log('tsCodeList', tsCodeList)


let current_TD_BuyPoitItem = []
let buyPointStockItem = []
// let formatBuyPointStockItem = []



function analyseEachStock ({
  formatItems
}) {
  getBuyPoint({
    formatItems, 
    isLoop: true
  })
}

function getBuyPoint({
  formatItems, 
  // trade_day_range = 600, // 样本范围
  // recent_trade_day = 600,// 先前多少个交易日
  // isLoop = true,

}) { // 获取 buy 点机会
  let trade_day_range = 600;// 样本范围
  let recent_trade_day = 600;// 先前多少个交易日
  let isLoop = true;


  // if (formatItems.length < recent_trade_day || formatItems.length < trade_day_range) return ;
  if (formatItems.length < trade_day_range) {
    trade_day_range = formatItems.length;
    recent_trade_day = formatItems.length;
    isLoop = false;
  } else if (formatItems.length < (trade_day_range + recent_trade_day)) {

    recent_trade_day = formatItems.length - trade_day_range;


    // console.log('formatItems.length', formatItems.length)
    // console.log('trade_day_range', recent_trade_day)
    // console.log('recent_trade_day', recent_trade_day)
    // isLoop = true;

  }
  let changeList = []
  for (let i = trade_day_range - 1; i >= 0; i--) {
    const date = [...formatItems].reverse();
    let rangeDate = []
    if (i === 0 || !isLoop) {
      rangeDate =  [...date].slice(-recent_trade_day);
    } else {
      rangeDate =  [...date].slice(-recent_trade_day - i, -i);
    }
    const recent_40_trade = [...rangeDate].slice(-40); // 该交易日最近40交易日区间
    const recent_40_trade_max_high_obj = maxBy(recent_40_trade, 'high') || {};// 最近40个交易日的数据array
    const recent_100_trade = [...rangeDate].slice(-100); // 该交易日最近100交易日区间
    const recent_200_trade = [...rangeDate].slice(-200); // 该交易日最近100交易日区间
    const recent_100_trade_max_high_obj = maxBy(recent_100_trade, 'high') || {};// 最近40个交易日的数据array
    const recent_100_trade_max_vol_obj = maxBy(recent_100_trade, 'vol') || {};// 最近40个交易日的数据array
    const max_100_trade_max_price_obj = maxBy([recent_100_trade_max_high_obj, recent_100_trade_max_vol_obj], 'high'); // 最近100个交易日 的最高价；取最高价&最大成交量之前的最高价，用于筛选最近100交易日的最高点。
    const pre_0_currentDate = rangeDate[rangeDate.length - 1] || {} // 最近一个交易日的数据
    const pre_1_currentDate = rangeDate[rangeDate.length - 2] || {} // 最近一个交易日的前1天
    const pre_2_currentDate = rangeDate[rangeDate.length - 3] || {} // 最近一个交易日的前2天
    const pre_0_currentDate_pct_change = get(pre_0_currentDate, 'pct_chg') || 0// 涨跌幅
    const sort_min_vol = [...rangeDate].sort((a, b) => a.vol - b.vol) // vol 从小到大排序，然后去掉前10，取第【10】；前10可能太小 有误差
    const min_vol_obj = minBy(rangeDate, 'vol') || {};// 最低 成交量 的交易日数据
    const min_low_obj = minBy(rangeDate, 'low') || {};// 最低 价格 的交易日数据
    const flat1 = (pre_0_currentDate.close / min_low_obj.low) // < 1.1; （最近一个交易日的收盘价 - 最低价） / 最低价；最近 dayNum
    const flat2 = (pre_0_currentDate.vol / min_low_obj.vol) //< 1.1；（最近一个交易日的成交量 - 最低价的成交量） / 最低价；最近 dayNum
    const flat3 = (pre_0_currentDate.vol / sort_min_vol[Math.floor(sort_min_vol.length / 20)].vol) //< 1.1； 最近 recent_trade_day TD相对比较低成交量
    const flat10 = (pre_0_currentDate.vol / recent_100_trade[Math.floor(recent_100_trade.length / 20)].vol) // 最近100 TD 相对比较低成交量
    const flat6 = (pre_2_currentDate.close > pre_2_currentDate.open) || (pre_2_currentDate.close === pre_2_currentDate.open && pre_2_currentDate.close > pre_2_currentDate.pre_close)//  真阳线 或者假阳线 1连阳
    const flat5 = (pre_1_currentDate.close > pre_1_currentDate.open) || (pre_1_currentDate.close === pre_1_currentDate.open && pre_1_currentDate.close > pre_1_currentDate.pre_close) //  真阳线 或者假阳线 2连阳
    const flat4 = pre_0_currentDate.close >= pre_0_currentDate.open//  真阳线 或者假阳线 3连阳
    const flat7 = pre_0_currentDate.close >= pre_1_currentDate.close  || pre_0_currentDate.close >= pre_2_currentDate.close || pre_0_currentDate.high > pre_2_currentDate.close //  pre_0 收盘价  >= pre_2 收盘价，保证趋势向上
    const flat8 = (recent_40_trade_max_high_obj.high - pre_0_currentDate.close) / recent_40_trade_max_high_obj.high // < 0.15 如果是急跌,则筑底不够稳
    const flat9 = ((pre_2_currentDate.vol <= pre_0_currentDate.vol) || (pre_1_currentDate.vol <= pre_0_currentDate.vol)) // 成交量至少要放量
    // todo W底判断。。 至少2重底 3重底

    const shouldConsole =  rangeDate[rangeDate.length - 1].ts_code === "600033.SH" && rangeDate[rangeDate.length - 1].trade_date === "20210210" && true
    if (shouldConsole) {
      // console.log('ts_code', rangeDate[rangeDate.length - 1].ts_code)
      // console.log('trade_date', rangeDate[rangeDate.length - 1].trade_date)
      // console.log('recent_40_trade_max_high_obj', recent_40_trade_max_high_obj)
      // console.log('pre_0_currentDate', pre_0_currentDate)
      
      // // console.log('rangeDate', rangeDate)
      // // console.log('pre_0_currentDate_pct_change', pre_0_currentDate_pct_change)
      // // console.log('recent_100_trade', recent_100_trade)
      // // console.log('recent_100_trade_max_high_obj', recent_100_trade_max_high_obj)
      // // console.log('recent_100_trade_max_vol_obj', recent_100_trade_max_vol_obj)
      // // console.log('max_100_trade_max_price_obj', max_100_trade_max_price_obj)
      // // console.log('sort_min_vol', sort_min_vol)
      // // console.log('min_low_obj', min_low_obj)
      // // console.log('pre_2_currentDate', pre_2_currentDate)
      // // console.log('pre_1_currentDate', pre_1_currentDate)
      // // console.log('pre_0_currentDate', pre_0_currentDate)

      // console.log('flat1', flat1, flat1 < 1.10)
      // console.log('flat2', flat2, flat2 < 1.10)
      // console.log('flat3', flat3, flat3 < 1.10)
      // console.log('flat10', flat10, flat10 < 1.10)
      // console.log('1连阳', flat6)

      // console.log('2连阳', flat5)
      // console.log('3连阳', flat4)
      // console.log('保证趋势向上', flat7)
      // console.log('< 0.15 如果是急跌,则筑底不够稳', flat8, flat8 < 0.10)
      // console.log('成交量逐渐放量', flat9)
      

    }

    if (
      flat2 < 1.10 && 
      (
        (flat1 < 1.10 && (flat3 < 1.10  || flat10 < 1.10))
        // || (flat1 <= 1.125 && (flat3 <= 1.5 || flat10 < 1.5) && pre_0_currentDate_pct_change > 0.5)
        // || (flat1 <= 1.125 && (flat3 <= 2 || flat10 < 2) && pre_0_currentDate_pct_change > 1)
        // || (flat1 <= 1.125 && (flat3 <= 3 || flat10 < 3) && pre_0_currentDate_pct_change > 1)
        // ||(flat1 <= 1.125 && (flat3 <= 4 || flat10 < 4) && pre_0_currentDate_pct_change > 2)
      ) &&
      flat4 && 
      flat5 && 
      flat6 &&
      flat7 && 
      // flat8 < 0.10 &&
      flat9
      ){
        const endItem = {
          ...changeList[changeList.length-1]
        }
        const re_trade_date = date.find(item => (item.trade_date > endItem.trade_date) && (item.close > endItem.close))// 回本的
        const low_trade_date = date.filter(item => (item.trade_date > endItem.trade_date) && (item.low < endItem.low)).sort((a, b) => a.low - b.low)[0] //  // 最低的
        const high_trade_date = date.filter(item => (item.trade_date > endItem.trade_date) && ((item.high > endItem.high))).sort((a, b) => b.high - a.high)[0] //  // 最高的
        let re_day = -1;
        if (re_trade_date) {
          re_day = (moment(re_trade_date.trade_date).valueOf() - moment(endItem.trade_date).valueOf()) / (24 * 60 * 60 * 1000) // 回本天数
        }
        let high_percent = -1;
        let high_day = -1;
        if (high_trade_date) {
          high_percent =  (((Number(high_trade_date.high) - Number(endItem.close)) / Number(endItem.close)) * 100) // 涨幅比例(%)
          high_day = (moment(high_trade_date.trade_date).valueOf() - moment(endItem.trade_date).valueOf()) / (24 * 60 * 60 * 1000) // 涨幅天数
        }

        let low_percent = -1;
        let low_day = -1;

        if (low_trade_date) {
          low_percent =  (((Number(endItem.close) - Number(low_trade_date.low)) / Number(endItem.close)) * 100) // 回撤比例(%)
          low_day = (moment(low_trade_date.trade_date).valueOf() - moment(endItem.trade_date).valueOf()) / (24 * 60 * 60 * 1000) // 回撤天数

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
        }
        changeList[changeList.length-1] = {
          ...endItem,
          ...params,

        }
        changeList.push({
          ...pre_0_currentDate,
          ...params,
        })
    }
    if (!isLoop){
      if (changeList.length) buyPointStockItem.push(changeList)
      return
    }
  }
  if (isLoop && changeList.length) {
    if (changeList.length) buyPointStockItem.push(changeList)
  }
}

tsCodeList.map(ts_code => {
  analyseEachStock({
    formatItems: stockHistoryDatabase[ts_code].formatItems
  })
})

buyPointStockItem.map(item => {
  // if (item.length >= 2) current_TD_BuyPoitItem.push(item)
})
// console.log('buyPointStockItem', buyPointStockItem)
const formatBuyPointStockItem = map(buyPointStockItem, item => map(item, ({
  name,
  industry,
  area,
  trade_date,
  ts_code,
  re_trade_date,
  low_trade_date,
  high_trade_date,
 }) => ({
  name,
  industry,
  area,
  buy_point_date: trade_date,
  // trade_date,
  chinese_desc: '买点交易日',
  ts_code,
  re_trade_date,
  low_trade_date,
  high_trade_date,
})));


const data = ({
  // buyPointStockItem,
  formatBuyPointStockItem,
  // current_TD_BuyPoitItem,
})
// console.log('data', data)

let str = JSON.stringify(data, null, "\t")
fs.writeFileSync(analyseStockPath, str);