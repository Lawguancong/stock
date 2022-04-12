const { resolve } = require('path');
const axios = require('axios');
const fs = require('fs');
const getPathBySource = (...paths) => resolve(__dirname, '../', ...paths);
const allStockListPath = getPathBySource('./public/database/all-stock-list.json');
const allStockListDatabase = require('../public/database/all-stock-list.json');
const { token, tradeDate } = require('./config')
const { get, map } = require('loadsh');


axios.post(`https://api.tushare.pro`, {
    api_name: 'bak_basic', // bak_daily: 每日最多50次请求
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
    const data = {
        ...allStockListDatabase,
        [tradeDate]: {
            fields,
            items,
            formatItems,
        }
    }
    let str = JSON.stringify(data, null, "\t")
    fs.writeFileSync(allStockListPath, str);
})



// https://tushare.pro/document/2?doc_id=262
// 接口：bak_basic
// 描述：获取备用基础列表
// 限量：单次最大5000条，可以根据日期参数循环获取历史，正式权限需要5000积分。
    
// 输入参数
    // 名称	类型	必选	描述
    // trade_date	str	N	交易日期
    // ts_code	str	N	股票代码

    
// 输出参数
    // 名称	类型	默认显示	描述
    // trade_date	str	Y	交易日期
    // ts_code	str	Y	TS股票代码
    // name	str	Y	股票名称
    // industry	str	Y	行业
    // area	str	Y	地域
    // pe	float	Y	市盈率（动）
    // float_share	float	Y	流通股本（亿）
    // total_share	float	Y	总股本（亿）
    // total_assets	float	Y	总资产（亿）
    // liquid_assets	float	Y	流动资产（亿）
    // fixed_assets	float	Y	固定资产（亿）
    // reserved	float	Y	公积金
    // reserved_pershare	float	Y	每股公积金
    // eps	float	Y	每股收益
    // bvps	float	Y	每股净资产
    // pb	float	Y	市净率
    // list_date	str	Y	上市日期
    // undp	float	Y	未分配利润
    // per_undp	float	Y	每股未分配利润
    // rev_yoy	float	Y	收入同比（%）
    // profit_yoy	float	Y	利润同比（%）
    // gpr	float	Y	毛利率（%）
    // npr	float	Y	净利润率（%）
    // holder_num	int	Y	股东人数