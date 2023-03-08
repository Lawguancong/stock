



module.exports = {
    token: '570dcc44159a349b38caea234613cbdcecddc365716efd3335bf13cf',
    preDay: 2000, // 向前多少天 非交易日；超过2000，分析报告失真，以前可能是高估值的
    tradeDate: '20230307',
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
  
