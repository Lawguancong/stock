const axios = require('axios');



axios.get(`https://danjuanapp.com/djapi/v3/filter/fund?type=1&order_by=1&size=20&page=1`,).then(result => {
    console.log('result', result)
})


