import React from 'react';
import axios from 'axios';
import { map, get, join, minBy, maxBy, reverse, sortBy, cloneDeep } from 'loadsh';
import moment from 'moment';
// const pkg = require('./database/all-stock-list.json');
// console.log('pkg', pkg)
// import pkg from '../database/all-stock-list.json'


// const trade_date = '20220303';

// const trade_date = '20220312'; // 大盘大跌
const trade_date = '20220408';
// const trade_date = '20210824';

// const trade_date = '20211207'; // ts_code = '600826.SH' dayNum = 500

// const trade_date = '20220308';
// const trade_date = '20211110';


      // const current_date =  moment().format('YYYYMMDD'); // 当前时间
      // console.log('current_date', current_date)
      // return
const dayNum = 1800; // 向前多少天，不是交易日；
// const recent_data_num = 40 // 最近交易区间

      // console.log(moment().subtract(1000, 'days').format('YYYYMMDD'))
export class FLexLayoutWrapper extends React.PureComponent {
    static defaultProps = {
    }

    constructor(props) {
        super(props);
        this.state = {
          buyPointStockItem: []
        };
    }
    async componentDidMount () {
      const lowValuationsStockList = await this.getLowValuationsStock(); // 过滤的低谷股票列表
      await this.foreacthItem(lowValuationsStockList[20220411]);

      
      return
      await this.getEachStockTrade({
        ts_code: '600606.SH',
        isLoop: true
      });
    }
    getLowValuationsStock = async () => {
      return await fetch('./database/low-valuations-stock-list.json', {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
          },
      })
      .then(response => response.json())
    }

    foreacthItem = async (lowValuationsStockList) => {
      console.log('lowValuationsStockList', lowValuationsStockList)
      console.log('lowValuationsStockList-format', map(lowValuationsStockList, ({ts_code}) => ts_code))
     return
      map(lowValuationsStockList, async ({ts_code}) => {
        await this.getEachStockTrade({
          ts_code,
          isLoop: true
        });
      })
    }
   
    formatResult =  ({
      result,
    }) => {
      const items = get(result, 'data.data.items') // [["000001.SZ", "000001", "平安银行", "深圳", "银行", "主板", "19910403"]]
      const fields = get(result, 'data.data.fields'); // fields: ["ts_code", "symbol", "name", "area", "industry", "market", "list_date"]
      const formatItems = map(items, item => {
        const obj = {}
        map(item, (key, idx) => {
          obj[fields[idx]] = key
        })
        return obj
      })
      return {
        items,
        fields,
        formatItems,
      }
    }

    getBuyPoint = async ({
      formatItems, 
      recent_trade_day = 600,// 先前多少个交易日
      trade_day_range = 600, // 样本范围
      isLoop = true,

    }) => { // 获取 buy 点机会
      console.log('isLoop', isLoop)
      let changeList = []
      // console.log('formatItems', formatItems)
      // console.log('recent_trade_day', recent_trade_day)
      // console.log([...formatItems].slice(-recent_trade_day - recent_trade_day, -recent_trade_day))
      
      for (let i = trade_day_range - 1; i >= 0; i--) {
        const date = [...formatItems].reverse();
        let rangeDate = []
        if (i === 0 || !isLoop) {
          rangeDate =  [...date].slice(-recent_trade_day);
        } else {
          rangeDate =  [...date].slice(-recent_trade_day - i, -i);
        }
        // console.log('rangeDate', rangeDate)
        const recent_40_trade = [...rangeDate].slice(-40); // 该交易日最近40交易日区间
        const recent_40_trade_max_high_obj = maxBy(recent_40_trade, 'high') || {};// 最近40个交易日的数据array

        const recent_100_trade = [...rangeDate].slice(-100); // 该交易日最近100交易日区间
        const recent_200_trade = [...rangeDate].slice(-200); // 该交易日最近100交易日区间

        const recent_100_trade_max_high_obj = maxBy(recent_100_trade, 'high') || {};// 最近40个交易日的数据array
        const recent_100_trade_max_vol_obj = maxBy(recent_100_trade, 'vol') || {};// 最近40个交易日的数据array

        const max_100_trade_max_price_obj = maxBy([recent_100_trade_max_high_obj, recent_100_trade_max_vol_obj], 'high'); // 最近100个交易日 的最高价；取最高价&最大成交量之前的最高价，用于筛选最近100交易日的最高点。


      

      // const rangeDate = sortBy(formatItems, ['trade_date']) // 最近500天的数据区间
      // const rangeDate = formatItems.sort((a,b) => a.trade_date - b.trade_date) // 最近500天的数据区间
      

      const pre_0_currentDate = rangeDate[rangeDate.length - 1] // 最近一个交易日的数据
      const pre_1_currentDate = rangeDate[rangeDate.length - 2] // 最近一个交易日的前1天
      const pre_2_currentDate = rangeDate[rangeDate.length - 3] // 最近一个交易日的前2天


      const pre_0_currentDate_pct_change = get(pre_0_currentDate, 'pct_chg') || 0// 涨跌幅
      // const pre_1_2_average_vol = (pre_1_currentDate.vol + pre_2_currentDate.vol) / 2

      const sort_min_vol = [...rangeDate].sort((a, b) => a.vol - b.vol) // vol 从小到大排序，然后去掉前10，取第【10】；前10可能太小 有误差
      // console.log('sort_min_vol', sort_min_vol)
      const min_vol_obj = minBy(rangeDate, 'vol') || {};// 最低 成交量 的交易日数据
      const min_low_obj = minBy(rangeDate, 'low') || {};// 最低 价格 的交易日数据
      const flat1 = (pre_0_currentDate.close / min_low_obj.low) // < 1.1; （最近一个交易日的收盘价 - 最低价） / 最低价；最近 dayNum
      const flat2 = (pre_0_currentDate.vol / min_low_obj.vol) //< 1.1；（最近一个交易日的成交量 - 最低价的成交量） / 最低价；最近 dayNum
      const flat3 = (pre_0_currentDate.vol / sort_min_vol[Math.floor(sort_min_vol.length / 10)].vol) //< 1.1； 最近 recent_trade_day TD相对比较低成交量
      const flat10 = (pre_0_currentDate.vol / recent_100_trade[Math.floor(recent_100_trade.length / 10)].vol) // 最近100 TD 相对比较低成交量

      const flat6 = (pre_2_currentDate.close > pre_2_currentDate.open) || (pre_2_currentDate.close === pre_2_currentDate.open && pre_2_currentDate.close > pre_2_currentDate.pre_close)//  真阳线 或者假阳线 1连阳
      const flat5 = (pre_1_currentDate.close > pre_1_currentDate.open) || (pre_1_currentDate.close === pre_1_currentDate.open && pre_1_currentDate.close > pre_1_currentDate.pre_close) //  真阳线 或者假阳线 2连阳
      const flat4 = pre_0_currentDate.close >= pre_0_currentDate.open//  真阳线 或者假阳线 3连阳

      const flat7 = pre_0_currentDate.close >= pre_1_currentDate.close  || pre_0_currentDate.close >= pre_2_currentDate.close || pre_0_currentDate.high > pre_2_currentDate.close //  pre_0 收盘价  >= pre_2 收盘价，保证趋势向上
      const flat8 = (recent_40_trade_max_high_obj.high - pre_0_currentDate.close) / recent_40_trade_max_high_obj.high // < 0.15 如果是急跌,则筑底不够稳
      const flat9 = ((pre_2_currentDate.vol <= pre_0_currentDate.vol) || (pre_1_currentDate.vol <= pre_0_currentDate.vol)) // 成交量至少要放量
      // todo W底判断。。 至少2重底 3重底

      if (rangeDate[rangeDate.length - 1].trade_date === "20220408" && false) {
        console.log('111111')
        
        console.log('rangeDate', rangeDate)
        console.log('pre_0_currentDate_pct_change', pre_0_currentDate_pct_change)
        console.log('recent_100_trade', recent_100_trade)
        console.log('recent_100_trade_max_high_obj', recent_100_trade_max_high_obj)
        console.log('recent_100_trade_max_vol_obj', recent_100_trade_max_vol_obj)
        console.log('max_100_trade_max_price_obj', max_100_trade_max_price_obj)
        console.log('sort_min_vol', sort_min_vol)
        console.log('min_low_obj', min_low_obj)
        console.log('pre_2_currentDate', pre_2_currentDate)
        console.log('pre_1_currentDate', pre_1_currentDate)
        console.log('pre_0_currentDate', pre_0_currentDate)

        console.log('flat1', flat1, flat1 < 1.10)
        console.log('flat2', flat2, flat2 < 1.10)
        console.log('flat3', flat3, flat3 < 1.10)
        console.log('flat10', flat10, flat10 < 1.10)
        console.log('1连阳', flat6)

        console.log('2连阳', flat5)
        console.log('3连阳', flat4)
        console.log('保证趋势向上', flat7)
        console.log('< 0.15 如果是急跌,则筑底不够稳', flat8, flat8 < 1.15)
        console.log('成交量逐渐放量', flat9)
        

      }

      // console.log('formatItems', formatItems)
      // console.log('rangeDate', rangeDate)
      // console.log('recent_trade_day', [...rangeDate].slice(-200))
      // console.log('recent_trade_day', [...rangeDate].slice(-200 -1, 0 - 1))
      // console.log('pre_0_currentDate', pre_0_currentDate)
      // console.log('min_vol_obj', min_vol_obj)
      // console.log('min_low_obj', min_low_obj)
      // console.log('flat1', `${flat1*100}% `)
      // console.log('flat2', `${flat2*100}% `)
      // console.log('flat3', `${flat3*100}% `)
      // console.log('flat1', flat1)
      // console.log('flat2', flat2)
      // console.log('flat3', flat3)
      // console.log('flat4', flat4)
      // console.log('flat5', flat5)
      // console.log('flat6', flat6)
      // console.log('flat7', flat7)
      // console.log('flat8', flat8)
      // console.log('flat9', flat9)
      

      // console.log('pre_0_currentDate', pre_0_currentDate.trade_date)

        if (
          flat2 < 1.10 && 
          (
            (flat1 < 1.10 && (flat3 < 1.10  || flat10 < 1.10))  || 
            (flat1 <= 1.125 && (flat3 <= 1.5 || flat10 < 1.5) && pre_0_currentDate_pct_change > 0.5) ||
            (flat1 <= 1.125 && (flat3 <= 2 || flat10 < 2) && pre_0_currentDate_pct_change > 1) ||
            (flat1 <= 1.125 && (flat3 <= 3 || flat10 < 3) && pre_0_currentDate_pct_change > 1) ||
            (flat1 <= 1.125 && (flat3 <= 4 || flat10 < 4) && pre_0_currentDate_pct_change > 2)
          ) &&
          flat4 && 
          flat5 && 
          flat6 &&
          flat7 && 
          flat8 < 0.15 &&
          flat9
          ){
          console.log('okkkkk', pre_0_currentDate)
          changeList.push(pre_0_currentDate)

          // console.log('recent_40_trade', recent_40_trade)
          // console.log('recent_40_trade_max_high_obj', recent_40_trade_max_high_obj)
          // console.log('pre_0_currentDate', pre_0_currentDate)
        }
        if (!isLoop){
          if (changeList.length) this.state.buyPointStockItem.push(changeList)
          return
        }
      }
      if (isLoop && changeList.length) {
        if (changeList.length) this.state.buyPointStockItem.push(changeList)
      }
    }

    getEachStockTrade = async ({
      ts_code = '600606.SH',
      isLoop = false,
    }) => {
      // const recent_trade_day = 600; // 最近 400 交易日 Buy 点
      const result = await axios.post(`https://api.tushare.pro`, {
        api_name: 'daily',  // daily 接口可以用很多次
        token: '570dcc44159a349b38caea234613cbdcecddc365716efd3335bf13cf',
        params: {
          ts_code: ts_code,
          start_date: moment().subtract(dayNum, 'days').format('YYYYMMDD'),
          end_date: trade_date
        },
        fields: null,
      })
      const { formatItems } = this.formatResult({ result });
      await this.getBuyPoint({
        formatItems, 
        // recent_trade_day,
        isLoop,
        // isLoop: false
      })
      let current_TD_BuyPoitItem = []
      map(this.state.buyPointStockItem, item => {
        if (item.length >= 2) current_TD_BuyPoitItem.push(item)
      })
      const formatBuyPointStockItem = map(this.state.buyPointStockItem, item => map(item, ({ trade_date, ts_code }) => ({ trade_date, ts_code })));
      this.setState({
        buyPointStockItem: [...this.state.buyPointStockItem],
        formatBuyPointStockItem,
        current_TD_BuyPoitItem,
      })
    }

   
    render() {

      console.log('render-this.state', this.state)
      // console.log('format-date', map(this.state.buyPointStockItem, item => map(item, ({ trade_date, ts_code }) => ({ trade_date, ts_code }))))

        return (
            <div>
              1
            </div>
        );
    }
}



export default FLexLayoutWrapper
