import React from 'react';
import axios from 'axios';
import { map, get, join, minBy, maxBy, reverse, sortBy, cloneDeep, isEmpty } from 'loadsh';
import moment from 'moment';

const trade_date = '20220412';

const dayNum = 1800; // 向前多少天，不是交易日；
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
      const stockHistoryList = await this.getStockHistory(); // 过滤的低谷股票列表
      console.log("stockHistoryList", stockHistoryList)// 低估股票历史数据
      // console.log("stockHistoryList", stockHistoryList['002067.SZ'])// 低估股票历史数据

      const analyseStock = await this.getAnalyseStock(); // 过滤的低谷股票列表
      console.log("analyseStock", analyseStock)// 低估股票历史数据


      const buyPointReportList = await this.getBuyPointReport(); // 过滤的低谷股票列表
      console.log('buyPointReportList', buyPointReportList)
      console.log('length', this.deepFlatten(analyseStock.formatBuyPointStockItem).length)
      
    }

    deepFlatten = arr => [].concat(...arr.map(v => (Array.isArray(v) ? this.deepFlatten(v) : v)))    


    getStockHistory = async () => {
      return await fetch('./database/stock-history.json', {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
          },
      })
      .then(response => response.json())
    }
    getAnalyseStock = async () => {
      return await fetch('./database/analyse-stock.json', {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
          },
      })
      .then(response => response.json())
    }
    getBuyPointReport = async () => {
      return await fetch('./database/buy-point-report.json', {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
          },
      })
      .then(response => response.json())
    }

    render() {
        return (
            <div>
              1
            </div>
        );
    }
}



export default FLexLayoutWrapper
