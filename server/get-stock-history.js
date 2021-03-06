
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
async function getData({ ts_code, name, industry, area }){
  await axios.post(`https://api.tushare.pro`, {
    api_name: 'daily',  // daily 接口可以用很多次
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
  stockList.forEach(async (item, idx) => {
    try {
      await getData(item)
      console.log('try - Object.values(temp).length', Object.values(temp).length)
      if (stockList.length === Object.values(temp).length) {
      // if (stockList.length === Object.keys(temp).length) {
      // if (stockList.length === Object.entries(temp).length) {
      
        let str = JSON.stringify(temp, null, "\t")
        fs.writeFileSync(stockHistoryPath, str);
        // console.log('errorList.length', errorList.length)
        // let str2 = JSON.stringify({
        //   ...errorCatchDatabase,
        //   [tradeDate]: errorList
        // }, null, "\t")
        // fs.writeFileSync(errorCatchPath, str2);
      }
    } catch (e) {
      // console.log('e',e )
      errorList.push(item)


      console.log('item', item)
      console.log('stockList.length', stockList.length)
      console.log('errorList.length', errorList.length)
      console.log('Object.values(temp).length', Object.values(temp).length)
      if (stockList.length === (Object.values(temp).length + errorList.length)) {
        const newArr = cloneDeep(errorList)
        errorList = [];
        patchFetchStock(newArr);
      }
      console.log('errorCatchDatabase[tradeDate]', errorCatchDatabase[tradeDate])
      // let str2 = JSON.stringify({
      //   ...errorCatchDatabase,
      //   [tradeDate]: [...errorCatchDatabase[tradeDate], {
      //     item,
      //     e,
      //   }]
      // }, null, "\t")
      // fs.writeFileSync(errorCatchPath, str2);
      // errorList.push(item)
      // console.log('error-item', item)
      // todo 递归 异常的时候 处理
    }
    // console.log(123)
  })
}
patchFetchStock(lowValuationsTsCodes);