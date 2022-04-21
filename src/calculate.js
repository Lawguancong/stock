import React from 'react';
import axios from 'axios';
import { map, get, join, minBy, maxBy, reverse, sortBy, cloneDeep, isEmpty } from 'loadsh';
import moment from 'moment';


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
      const lowStockList = await this.getLowStock();
      console.log("lowStockList", lowStockList)
      // console.log("lowStockList.lenght", lowStockList[tradeDate].length)

      const stockHistoryList = await this.getStockHistory();
      console.log("stockHistoryList", stockHistoryList)
      console.log("stockHistoryList.length", Object.values(stockHistoryList))


      // console.log("stockHistoryList", stockHistoryList['002067.SZ'])

      const analyseStock = await this.getAnalyseStock();
      console.log("analyseStock", analyseStock)
      console.log('analyseStock.length', this.deepFlatten(analyseStock.formatBuyPointStockItem).length)


      const buyPointReportList = await this.getBuyPointReport();
      console.log('buyPointReportList', buyPointReportList)
      
    }

    deepFlatten = arr => [].concat(...arr.map(v => (Array.isArray(v) ? this.deepFlatten(v) : v)))    


    getLowStock = async () => {
      return await fetch('./database/low-valuations-stock-list.json', {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
          },
      })
      .then(response => response.json())
    }

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
              量化趋势分析
            </div>
        );
    }
}



export default FLexLayoutWrapper
