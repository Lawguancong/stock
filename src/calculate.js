import React from 'react';
import axios from 'axios';
import { map, get, join, minBy, maxBy, reverse, sortBy, cloneDeep } from 'loadsh';
import moment from 'moment';


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
const dayNum = 1500; // 向前多少天，不是交易日；
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
    fetchAllStockList = async () => {
      const result = await axios.post(`https://api.tushare.pro`, {
        api_name: 'bak_basic', // bak_daily: 每日最多50次请求
        token: '570dcc44159a349b38caea234613cbdcecddc365716efd3335bf13cf',
        params: {
          trade_date,
        },
        fields: null,
      })
      const { formatItems } = this.formatResult({ result });
      console.log('bak_basic- formatItems',formatItems)
      return formatItems

    }

    getLowValuationsStock = (allStockList) => {
      let lowValuationsStockList = []
      map(allStockList, (item) => {
        const { pe, pb, rev_yoy, profit_yoy, gpr, npr} = item
        if (
          pe > 0 && pe < 20 && 
          pb > 0 && pb < 1.5 && 
          rev_yoy > 0 &&  // rev_yoy	float	Y	收入同比（%）
          profit_yoy > 0 && // profit_yoy	float	Y	利润同比（%）
          gpr > 30 && // gpr	float	Y	毛利率（%）
          npr > 6 // npr	float	Y	净利润率（%）
        ) lowValuationsStockList.push(item)
      })

      return lowValuationsStockList
    }
    foreacthItem = async (lowValuationsStockList) => {
      console.log('lowValuationsStockList-format', map(lowValuationsStockList, ({ts_code}) => ts_code))
      // ['601512.SH', '600533.SH', '600984.SH', '002109.SZ', '600123.SH', '601101.SH', '600075.SH', '601699.SH', '601678.SH', '000776.SZ', '600823.SH', '601881.SH', '600018.SH', '601688.SH', '600030.SH', '600548.SH', '600173.SH', '601166.SH', '600901.SH', '002233.SZ', '600705.SH', '001965.SZ', '601211.SH', '000728.SZ', '600020.SH', '601555.SH', '600035.SH', '000686.SZ', '601518.SH', '000166.SZ', '601128.SH', '600694.SH', '000923.SZ', '601788.SH', '600350.SH', '600909.SH', '600926.SH', '601188.SH', '601577.SH', '600269.SH', '601326.SH', '601009.SH', '600854.SH', '601998.SH', '600837.SH', '600928.SH', '601018.SH', '601377.SH', '600979.SH', '600971.SH', '002002.SZ', '001872.SZ', '600999.SH', '600919.SH', '000885.SZ', '002736.SZ', '000783.SZ', '600377.SH', '002966.SZ', '000685.SZ', '002818.SZ', '000006.SZ', '002111.SZ', '601939.SH', '000828.SZ', '002807.SZ', '601169.SH', '003816.SZ', '600033.SH', '601288.SH', '601988.SH', '601229.SH', '601077.SH', '000598.SZ', '600012.SH', '000026.SZ', '300664.SZ', '002958.SZ', '000715.SZ', '601528.SH', '600908.SH', '601398.SH', '002345.SZ', '603323.SH', '601298.SH', '002035.SZ', '601828.SH', '601838.SH', '601949.SH', '600373.SH', '002853.SZ', '000156.SZ', '002435.SZ', '601963.SH', '601811.SH', '600828.SH', '601019.SH', '603797.SH', '601928.SH', '603900.SH', …]

      // const list = [
        
      //   '600823.SH',
      //   '601688.SH',
      //   '600548.SH',
      //   '601166.SH',
      //   '600705.SH',
      //   '001965.SZ',
      //   '601211.SH',
      //   '600020.SH',
      //   '600035.SH',
      //   '600694.SH',
      //   '600350.SH',
      //   '601577.SH',
      //   '600269.SH',
      //   '601009.SH',
      //   '601998.SH',
      //   '600837.SH',
      //   '600928.SH',
      //   '600971.SH',
      //   '600919.SH',
      //   '002966.SZ',
      //   '000685.SZ',
      //   '000006.SZ',
      //   '601939.SH',
      //   '002807.SZ',
      //   '601169.SH',
      //   '600033.SH',
      //   '601288.SH',
      //   '601988.SH',
      //   '601229.SH',
      //   '601077.SH',
      //   '002958.SZ',
      //   '600908.SH',
      //   '601398.SH',
      //   '603323.SH',
      //   '601298.SH',
      //   '600373.SH',
      //   '601963.SH',
      //   '601811.SH',
      //   '002382.SZ',
      //   '000719.SZ',
      //   '600707.SH',
      //   '600368.SH',
      //         ]
      // const list = map()
      map(lowValuationsStockList, async ({ts_code}) => {
      // console.log('ts_code', ts_code)
        await this.getEachStockTrade({
          ts_code,
          isLoop: true
        });
      })
    }
    getBuyPoint = async ({
      formatItems, 
      recent_trade_day,
      isLoop = true,

    }) => { // 获取 buy 点机会
      console.log('isLoop', isLoop)
      let changeList = []
      // console.log('formatItems', formatItems)
      // console.log('recent_trade_day', recent_trade_day)
      // console.log([...formatItems].slice(-recent_trade_day - recent_trade_day, -recent_trade_day))
      
      for (let i = recent_trade_day - 1; i >= 0; i--) {
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
      const recent_trade_day = 600; // 最近 400 交易日 Buy 点
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
        recent_trade_day,
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

    
    async componentDidMount () {
      return
      const allStockList = await this.fetchAllStockList(); // 获取所有的股票列表->ts_code
      const lowValuationsStockList = await this.getLowValuationsStock(allStockList); // 过滤的低谷股票列表
      console.log('lowValuationsStockList', lowValuationsStockList)
      await this.foreacthItem(lowValuationsStockList);

      return
      await this.getEachStockTrade({
        ts_code: '600606.SH',
        isLoop: true
      });

      
      


      

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
