const critical = require('../critical');
const argsParser = require('minimist');

function getCriticalCSS(remoteUrl){
   return critical(remoteUrl, {
        deviceScaleFactor: 2,
        fitWindow: true,
        width: 375,
        height: 677,
        mobile: true
    }, {}, {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
    },true)
}

getCriticalCSS('https://www.baidu.com').then(criticalCss => {
    console.log(criticalCss);
}).catch(ex => {
    console.log(ex);
})
