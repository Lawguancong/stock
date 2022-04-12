
const { resolve } = require('path');
const fs = require('fs');
const getPathBySource = (...paths) => resolve(__dirname, '../', ...paths);
const lowValuationsStockListPath = getPathBySource('./public/database/low-valuations-stock-list.json');
const lowValuationsDatabase = require('../public/database/low-valuations-stock-list.json');
const allStockListDatabase = require('../public/database/all-stock-list.json');
const { tradeDate } = require('./config')
function getLowValuationsStock(stockList = []) {
    let lowValuationsStockList = []
    stockList.forEach((item) => {
      const { pe, pb, rev_yoy, profit_yoy, gpr, npr} = item;
      if (
        pe > 0 && pe < 13 && 
        pb > 0 && pb < 1.1 && 
        rev_yoy > 5 &&  // rev_yoy	float	Y	收入同比（%）
        profit_yoy > 5 && // profit_yoy	float	Y	利润同比（%）
        gpr > 5 && // gpr	float	Y	毛利率（%）
        npr > 5 // npr	float	Y	净利润率（%）
      ) {
        lowValuationsStockList.push(item);
      }
    })
    return lowValuationsStockList
}
const data = {
    ...lowValuationsDatabase,
    [tradeDate]: getLowValuationsStock(allStockListDatabase[tradeDate].formatItems)
}
let str = JSON.stringify(data, null, "\t")
fs.writeFileSync(lowValuationsStockListPath, str);
