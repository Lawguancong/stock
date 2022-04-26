const { resolve } = require('path');
const axios = require('axios');
const fs = require('fs');
const getPathBySource = (...paths) => resolve(__dirname, '../', ...paths);
const allStockListPath = getPathBySource('./public/database/all-stock-list.json');
const allStockListDatabase = require('../public/database/all-stock-list.json');
const { token, tradeDate } = require('./config')
const { get, map } = require('loadsh');


axios.post(`https://api.tushare.pro`, {
    api_name: 'bak_basic', //  bak_basic: 每日最多20次；
    // api_name: 'bak_daily', // bak_daily: 每日最多50次请求
    token,
    params: {
        trade_date: tradeDate,
    },
    fields: null,
}).then(result => {
    const fields = get(result, 'data.data.fields'); // fields: ["ts_code", "symbol", "name", "area", "industry", "market", "list_date"]
    const items = get(result, 'data.data.items') // [["000001.SZ", "000001", "平安银行", "深圳", "银行", "主板", "19910403"]]
    const formatItems = map(items, item => {
        const obj = {}
        map(item, (key, idx) => {
            obj[fields[idx]] = key
        })
        return obj
    })
    console.log('result', result)
    // return
    const data = {
        ...allStockListDatabase,
        [tradeDate]: {
            // fields,
            // items,
            formatItems,
        }
    }
    let str = JSON.stringify(data, null, "\t")
    fs.writeFileSync(allStockListPath, str);
})



// 备用列表：bak_basic https://tushare.pro/document/2?doc_id=262

// 备用行情：bak_daily https://tushare.pro/document/2?doc_id=255

// 每日指标：daily_basic https://tushare.pro/document/2?doc_id=32