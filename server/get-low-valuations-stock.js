
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
      const { pe, pb, reserved = 0, reserved_pershare = 0, eps = 0, bvps = 0, rev_yoy = 0, profit_yoy = 0, gpr = 0, npr = 0, total_assets, liquid_assets, turn_over, industry = '' } = item;
      if (
        pe > 0 && pe < 10
        && pb > 0 && pb < 1.0
        && reserved > 0//	float	Y	公积金
        && reserved_pershare > 0//	float	Y	每股公积金
        && eps > 0 //	float	Y	每股收益
        && bvps > 0//	float	Y	每股净资产
        && rev_yoy > 5  // rev_yoy	float	Y	收入同比（%）
        && profit_yoy > 5  // profit_yoy	float	Y	利润同比（%）
        && gpr > 5  // gpr	float	Y	毛利率（%）
        && npr > 5 // npr	float	Y	净利润率（%）
        // && total_assets < 600 // 总资产
        // && liquid_assets < 600 // 流动资产
        // && turn_over < 0.7 // 换手率
        && !['银行'].includes(industry)
        // todo 同行业比较 横向比较 纵向比较
      ) {
        lowValuationsStockList.push(item);
      }
    })
    return lowValuationsStockList
}
let str = JSON.stringify({
  ...lowValuationsDatabase,
  [tradeDate]: getLowValuationsStock(allStockListDatabase[tradeDate].formatItems)
}, null, "\t")
fs.writeFileSync(lowValuationsStockListPath, str);
