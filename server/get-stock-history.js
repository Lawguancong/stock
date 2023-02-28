
const { resolve } = require('path');
const axios = require('axios');
const fs = require('fs');
const moment = require('moment');
const { map, get, join, minBy, maxBy, reverse, sortBy, cloneDeep } = require('loadsh');
const { tradeDate, preDay, token } = require('./config')

const getPathBySource = (...paths) => resolve(__dirname, '../', ...paths);
const stockHistoryPath = getPathBySource('./public/database/stock-history.json');
const errorCatchPath = getPathBySource('./public/database/error-catch.json');
const errorCatchDatabase = require('../public/database/error-catch.json');
const lowValuationsDatabase = require('../public/database/low-valuations-stock-list.json');

const lowValuationsTsCodes = lowValuationsDatabase[tradeDate].map(({ ts_code, name, industry, area }) => ({ ts_code, name, industry, area }))
let errorList = []
let temp = {}
const intialLength = lowValuationsTsCodes.length;
async function getData({ ts_code, name, industry, area }){
  await axios.post(`https://api.tushare.pro`, {
    api_name: 'daily',  // daily 接口每天可以用很多次
    token,
    params: {
      ts_code,
      start_date: moment(tradeDate).subtract(preDay, 'days').format('YYYYMMDD'),
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
  console.log('stockList.length', stockList.length)
  stockList.forEach(async (item, idx) => {
    try {
      await getData(item)
      console.log('try - Object.values(temp).length', Object.values(temp).length)
      if (intialLength === Object.values(temp).length) {
        let str = JSON.stringify(temp, null, "\t")
        fs.writeFileSync(stockHistoryPath, str);
      }
    } catch (e) {
      errorList.push(item)
      console.log('item', item)
      console.log('errorList.length', errorList.length)
      console.log('errorList', errorList)
      console.log('Object.values(temp).length', Object.values(temp).length)
      if (errorList.length > 0 && (stockList.length === (Object.values(temp).length + errorList.length))) {
        const newArr = [...errorList]
        errorList = [];
        patchFetchStock(newArr);
      }
    }
  })
}
patchFetchStock(lowValuationsTsCodes);