
const { resolve } = require('path');
const fs = require('fs');
const getPathBySource = (...paths) => resolve(__dirname, '../', ...paths);
const stockHistoryDatabase = require('../public/database/stock-history.json');
const analyseStockPath = getPathBySource('./public/database/analyse-stock.json');
const { map, get, join, minBy, maxBy, reverse, sortBy, cloneDeep } =  require('loadsh');
const moment = require('moment');

let tsCodeList = []
for (const [key, value] of Object.entries(stockHistoryDatabase)) {
  tsCodeList.push(key)
}

let buyPointStockItem = []

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
}) {
  let trade_date_range = 800;// 样本范围
  let pre_trade_date = 1000;// 先前多少个交易日
  let isLoop = true;


  if (formatItems.length < trade_date_range) {
    trade_date_range = formatItems.length;
    pre_trade_date = formatItems.length;
    isLoop = false;
  } else if (formatItems.length < (trade_date_range + pre_trade_date)) {
    pre_trade_date = formatItems.length - trade_date_range;
  }
  let changeList = []
  for (let i = pre_trade_date ; i > 0; i--) {
    const sourceData = [...formatItems].reverse();
    let rangeDate = []
    if (i === 0 || !isLoop) {
      rangeDate =  [...sourceData].slice(-trade_date_range);
    } else {
      rangeDate =  [...sourceData].slice(-trade_date_range - i, -i);
    }
    const pre_0_currentDate = rangeDate[rangeDate.length - 1] || {} // 最近一个交易日的数据
    const flat_industry = ['银行'].includes(pre_0_currentDate.industry);
    if (flat_industry) continue;
    const pre_1_currentDate = rangeDate[rangeDate.length - 2] || {} // 最近一个交易日的前1天
    const pre_2_currentDate = rangeDate[rangeDate.length - 3] || {} // 最近一个交易日的前2天
    const pre_3_currentDate = rangeDate[rangeDate.length - 4] || {} // 最近一个交易日的前2天

    // const up_4 = (pre_3_currentDate.close > pre_3_currentDate.open) || (pre_3_currentDate.close === pre_3_currentDate.open && pre_3_currentDate.close > pre_3_currentDate.pre_close)//  
    const up_3 = (pre_2_currentDate.close > pre_2_currentDate.open) || (pre_2_currentDate.close === pre_2_currentDate.open && pre_2_currentDate.close > pre_2_currentDate.pre_close)//  
    const up_2 = (pre_1_currentDate.close > pre_1_currentDate.open) || (pre_1_currentDate.close === pre_1_currentDate.open && pre_1_currentDate.close > pre_1_currentDate.pre_close) // 
    const up_1 = pre_0_currentDate.close >= pre_0_currentDate.open 
    if (!(up_1 && up_2 && up_3)) continue;
    const recent_40_trade = [...rangeDate].slice(-40); // 该交易日最近40交易日区间
    const recent_40_trade_max_high_obj = maxBy(recent_40_trade, 'high') || {};// 最近40个交易日的数据array
    const recent_50_trade = [...rangeDate].slice(-50); // 该交易日最近100交易日区间
    const sort_min_vol = [...rangeDate].sort((a, b) => a.vol - b.vol) // vol 从小到大排序，然后去掉前10，取第【10】；前10可能太小 有误差
    const recent_100_trade = [...rangeDate].slice(-100); // 该交易日最近100交易日区间
    const half_trade_date_range = [...rangeDate].slice(-(trade_date_range / 2)); // 该交易日最近200交易日区间
    const pre_0_currentDate_pct_change = get(pre_0_currentDate, 'pct_chg') || 0 // 涨跌幅
    const min_low_obj = minBy(rangeDate, 'low') || {};// 最低 价格 的交易日数据
    const flat1 = (pre_0_currentDate.close / min_low_obj.low) // < 1.1; （最近一个交易日的收盘价 - 最低价） / 最低价；最近 dayNum
    const flat2 = (pre_0_currentDate.vol / min_low_obj.vol) //< 1.1；（最近一个交易日的成交量 - 最低价的成交量） / 最低价；最近 dayNum
    const flat3 = (pre_0_currentDate.vol / sort_min_vol[Math.floor(sort_min_vol.length / 50)].vol) //< 1.1； 最近 pre_trade_date TD相对比较低成交量
    const flat10 = (pre_0_currentDate.vol / half_trade_date_range[Math.floor(half_trade_date_range.length / 50)].vol) // 最近100 TD 相对比较低成交量
    const flat7 = pre_0_currentDate.close >= pre_1_currentDate.close  || pre_0_currentDate.close >= pre_2_currentDate.close || pre_0_currentDate.high > pre_2_currentDate.close //  pre_0 收盘价  >= pre_2 收盘价，保证趋势向上
    const flat8 = (recent_40_trade_max_high_obj.high - pre_0_currentDate.close) / recent_40_trade_max_high_obj.high // < 0.2 如果是急跌,则筑底不够稳
    const flat9 = ((pre_2_currentDate.vol <= pre_0_currentDate.vol) || (pre_1_currentDate.vol <= pre_0_currentDate.vol)) // 成交量至少要放量
    // todo W底判断。。 至少2重底 3重底

    const shouldConsole =  rangeDate[rangeDate.length - 1].ts_code === "000900.SZ" && rangeDate[rangeDate.length - 1].trade_date === "20210811" && true
    if (shouldConsole) {
      // console.log('flat1', flat1, flat1 < 1.10)
      // console.log('flat2', flat2, flat2 < 1.10)
      // console.log('flat3', flat3, flat3 < 1.10)
      // console.log('flat10', flat10, flat10 < 1.10)
      // console.log('1连阳', up_3)
      // console.log('2连阳', up_2)
      // console.log('3连阳', up_1)
      // console.log('保证趋势向上', flat7)
      // console.log('< 0.2 如果是急跌,则筑底不够稳', flat8, flat8 < 0.2)
      // console.log('成交量逐渐放量', flat9)
    }

    if (
      flat2 <= 1.10&& 
      (
        (flat1 <= 1.10&& (flat3 <= 1.10|| flat10 <= 1.10))
        || (flat1 <= 1.10&& (flat3 <= 1.25 || flat10 < 1.25) && pre_0_currentDate_pct_change > 1)
        || (flat1 <= 1.10&& (flat3 <= 1.5 || flat10 < 1.5) && pre_0_currentDate_pct_change > 1.5)
        || (flat1 <= 1.10&& (flat3 <= 1.75 || flat10 < 1.75) && pre_0_currentDate_pct_change > 2)
        || (flat1 <= 1.10&& (flat3 <= 2 || flat10 < 2) && pre_0_currentDate_pct_change > 2.5)
        || (flat1 <= 1.10&& (flat3 <= 2.25 || flat10 < 2.25) && pre_0_currentDate_pct_change > 3)
        || (flat1 <= 1.10&& (flat3 <= 2.5 || flat10 < 2.5) && pre_0_currentDate_pct_change > 3.5)
      )
      && up_1
      && up_2
      && up_3
      && flat7
      // &&flat8 < 0.15
      && flat9
      ){
        let re_day = -1;  // 回本天数
        let high_percent = -1;  // 涨幅比例(%)
        let high_day = -1; // 涨幅天数
        let low_percent = -1; // 回撤比例(%); [-1, 没回本] [0, 已回本] [>0:, 回本后,后续有更低的回撤点]
        let low_day = -1;  // 回撤天数
        const re_trade_date = sourceData.find(item => (item.trade_date > pre_0_currentDate.trade_date) && (item.close > pre_0_currentDate.close))// 回本的交易日
        const low_trade_date = sourceData.filter(item => (item.trade_date > pre_0_currentDate.trade_date) && (item.low < pre_0_currentDate.low)).sort((a, b) => a.low - b.low)[0] //  // 最低的交易日
        const high_trade_date = sourceData.filter(item => (item.trade_date > pre_0_currentDate.trade_date) && ((item.high > pre_0_currentDate.high))).sort((a, b) => b.high - a.high)[0] //  // 最高的交易日
      
        // todo 180 360天 涨幅 回撤？
        if (re_trade_date) {
          re_day = (moment(re_trade_date.trade_date).valueOf() - moment(pre_0_currentDate.trade_date).valueOf()) / (24 * 60 * 60 * 1000)
          low_percent = 0;
          low_day = 0
        } else {
          // high_percent
          // high_day
        }
      
        if (high_trade_date) {
          high_percent =  (((Number(high_trade_date.high) - Number(pre_0_currentDate.close)) / Number(pre_0_currentDate.close)) * 100)
          high_day = (moment(high_trade_date.trade_date).valueOf() - moment(pre_0_currentDate.trade_date).valueOf()) / (24 * 60 * 60 * 1000) 
        }

        if (low_trade_date) {
          low_percent =  (((Number(pre_0_currentDate.close) - Number(low_trade_date.low)) / Number(pre_0_currentDate.close)) * 100) 
          low_day = (moment(low_trade_date.trade_date).valueOf() - moment(pre_0_currentDate.trade_date).valueOf()) / (24 * 60 * 60 * 1000)

        }
        // console.log('low_percent', low_percent)
        // if (low_percent === 0) {

        // }

        // if (shouldConsole ){
        //   console.log('pre_0_currentDate', pre_0_currentDate)
        //   console.log('pre_0_currentDate', pre_0_currentDate)
        // }
       
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
})));


const data = {
  formatBuyPointStockItem,
}

let str = JSON.stringify(data, null, "\t")
fs.writeFileSync(analyseStockPath, str);