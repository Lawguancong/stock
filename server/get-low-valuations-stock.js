
const { resolve } = require('path');
const fs = require('fs');
const getPathBySource = (...paths) => resolve(__dirname, '../', ...paths);
const allStockListDatabase = require('../public/database/all-stock-list.json');
const lowValuationsStockListPath = getPathBySource('./public/database/low-valuations-stock-list.json');
const { tradeDate } = require('./config')
function getLowValuationsStock(stockList = []) {
    let lowValuationsStockList = []
    stockList.forEach((item) => {
      const { pe, pb, reserved = 0, reserved_pershare = 0, eps = 0, bvps = 0, rev_yoy = 0, profit_yoy = 0, gpr = 0, npr = 0, total_assets, liquid_assets, turn_over, industry = '', name = '' } = item;
      if (
        // 顺境企业 || 困境企业
        ((pe > 0 && pe < 6) && (pb > 0 && pb < 2) || (pe > 0 && pe < 40) && (pb > 0 && pb < 1))
        // 动态市盈率
        //  (pb > 0 && pb < 1)

        // && ((pb > 0 && pb < 0.9))
        // && reserved > 0//	float	Y	公积金
        // && reserved_pershare > 0//	float	Y	每股公积金
        // && eps > 0 //	float	Y	每股收益
        // && bvps > 0//	float	Y	每股净资产
        // && rev_yoy > 0  // rev_yoy	float	Y	收入同比（%）
        // && profit_yoy > 0  // profit_yoy	float	Y	利润同比（%）
        // && gpr > 20  // gpr	float	Y	毛利率（%）
        // && gpr > 20  // gpr	float	Y	毛利率（%）
        // && npr > 0 // npr	float	Y	净利润率（%）
        && (total_assets > 300 || liquid_assets > 300) // 总资产
        // && turn_over < 0.7 // 换手率
        // && !['银行'].includes(industry)
        && !/ST/.test(name)
        // todo 同行业比较 横向比较 纵向比较
      ) {
        lowValuationsStockList.push(item);
      }
    })
    return lowValuationsStockList
}
let str = JSON.stringify({
  [tradeDate]: getLowValuationsStock(allStockListDatabase[tradeDate].formatItems)
}, null, "\t")
fs.writeFileSync(lowValuationsStockListPath, str);
