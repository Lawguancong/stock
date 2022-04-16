
const { resolve } = require('path');
const axios = require('axios');
const fs = require('fs');
const moment = require('moment');
const { map, get, join, minBy, maxBy, reverse, sortBy, cloneDeep } = require('loadsh');
const { tradeDate, preDay, token } = require('./config')

const getPathBySource = (...paths) => resolve(__dirname, '../', ...paths);
const stockHistoryPath = getPathBySource('./public/database/stock-history.json');
const stockHistoryDatabase = require('../public/database/stock-history.json');
const lowValuationsDatabase = require('../public/database/low-valuations-stock-list.json');

const lowValuationsTsCodes = lowValuationsDatabase[tradeDate].map(({ ts_code, name, industry, area }) => ({ ts_code, name, industry, area }))
// const lowValuationsTsCodes = ['601898.SH', '600551.SH']


let temp = {}
async function getData({ ts_code, name, industry, area }){
  await axios.post(`https://api.tushare.pro`, {
    api_name: 'daily',  // daily 接口可以用很多次
    token,
    params: {
      ts_code,
      start_date: moment().subtract(preDay, 'days').format('YYYYMMDD'),
      end_date: tradeDate
    },
    fields: null,
  }).then(result => {
    const fields = get(result, 'data.data.fields');
    const items = get(result, 'data.data.items')
    const formatItems = map(items, item => {
      const params = {
        name,
        industry,
        area,
      }
      map(item, (key, idx) => {
          params[fields[idx]] = key
      })
      return params
    })
    temp = {
      ...temp,
      [ts_code]: {
          formatItems,
      }
    }
  })
}


function patchFetchStock(stockList) {
  stockList.forEach(async (item, idx) => {
    try {
      await getData(item)
      if (stockList.length === idx+1) {
        const combineData = {
          ...stockHistoryDatabase,
          ...temp,
        }
        let str = JSON.stringify(combineData, null, "\t")
        fs.writeFileSync(stockHistoryPath, str);
      }
    } catch (e) {
      console.log('e',e )
      // console.log('error-item', item)
      // todo 递归 异常的时候 处理
    }
  })
}
patchFetchStock(lowValuationsTsCodes);