



module.exports = {
    token: '570dcc44159a349b38caea234613cbdcecddc365716efd3335bf13cf',
    preDay: 2000, // 向前多少天 非交易日；超过2000，分析报告失真，以前可能是高估值的
    latest_trade_date: '20220422',
    tradeDate: '20220426',
    // tradeDate: '20210224',
    // tradeDate: '20201019',
    // tradeDate: '20200331',
    // tradeDate: '20200110',


    // tradeDate: '20190403',

    // tradeDate: '20190122',
    // tradeDate: '20190110',



    ts_code_key: 'ts_code', // 股票codekey
    trade_date_key: 'trade_date', // 交易日 key
    vol_key: 'vol', // 成交量 key
    open_key: 'open', // 开盘价 key
    close_key: 'close', // 收盘价 key
    pre_close_key: 'pre_close', // 前一个收盘价 key
    high_key: 'high', // 最高价 key
    low_key: 'low', // 最低价 key
    pct_chg_key: 'pct_chg', // 涨幅 key
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
// yarn start