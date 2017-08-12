const critical = require('../critical');
const discardDuplicate = require('postcss-discard-duplicates');
const postCss = require('postcss');

const batchURLs = [
	'https://live.sparta.html5.qq.com/omgLive?liveId=46590790',
	'https://live.sparta.html5.qq.com/omgLive?liveId=46651850',
	'https://live.sparta.html5.qq.com/omgLive?liveId=46646077',
	'https://live.sparta.html5.qq.com/omgLive?liveId=46649402'
];

function getCriticalCSS(remoteUrl){
   return critical(remoteUrl, {
        deviceScaleFactor: 2,
        fitWindow: true,
        width: 375,
        height: 677,
        mobile: true
    }, {}, {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
    },/^win/.test(process.platform) ? false : true)
}

function getBatchCriticalCSS(urls){
    let cirticalArr = [];
    urls.forEach((url) => {
        cirticalArr.push(getCriticalCSS(url));
    });
    Promise.all(cirticalArr).then((criticalArrRes) => {
        let allCriticalCSS = '';
        criticalArrRes.forEach(criticalContent => {
            allCriticalCSS += criticalContent;
        });
        postCss([discardDuplicate]).process(allCriticalCSS).then(result => {
            console.log(result.css);
        });
    }).catch((ex) => {
        console.log(ex);
    });
}

getBatchCriticalCSS(batchURLs);
