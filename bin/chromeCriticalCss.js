#!/usr/bin/env node

const critical = require('../critical');
const argsParser = require('minimist');
const packageInfo = require('../package.json');

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


function run(){
    const args = argsParser(process.argv.slice(2));
    const url = args['u'] || args['url'] || args['_'][0]
    const version = args['version'] || args['v']
    if (url) {
        getCriticalCSS(url).then(criticalCss => {
            console.log(criticalCss);
        }).catch(ex => {
            console.log(ex);
        })
    }else if(version){
        console.log(packageInfo.version);
    }else {
        console.log('Usage:');
        console.log('-v --version [show version]');
        console.log('-u --url [Extract critical css for this page]');
    }
}

run();


