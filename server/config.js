



module.exports = {
    token: '570dcc44159a349b38caea234613cbdcecddc365716efd3335bf13cf',
    tradeDate: '20220418',
    preDay: 2000, // 向前多少天 非交易日

};
  

// 适用于 股票除权价格
// 步骤
// 设置 token
// 设置 trade_date
// node server/get-all-stock-list.js  
// node server/get-low-valuations-stock.js
// node server/get-stock-history.js
// node server/analyse-stock.js
// node server/buy-point-report.js 
// yar start