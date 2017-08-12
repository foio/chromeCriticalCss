const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');
const postCss = require('postcss');

function getCriticalCSS(url, emulationOptions, extHeaders, userAgent,kill) {
    return new Promise((resolve, reject) => {
        let chromeFlags = ['--headless', '--disable-gpu'];
        //windows版本暂时不支持headless
        if (/^win/.test(process.platform)) {
            chromeFlags = [];
        }
        chromeLauncher.launch({chromeFlags: chromeFlags}).then(chrome => {
            const chromeDebugPort = chrome.port;
            CDP({port: chromeDebugPort}, (client) => {
                const {CSS, DOM, Emulation, Runtime, Page, Network} = client;
                Page.domContentEventFired(() => {
                    if(!CSS.takeCoverageDelta){
                        console.err('please upate you system chrome versionlog!');
                    }
                    Promise.all([CSS.getMediaQueries(), CSS.takeCoverageDelta()]).then(cssRes => {
                        const mediaQueries = cssRes[0].medias;
                        const rules = cssRes[1];
                        const styleSheetIds = {};
                        const styleSheetMap = {};
                        const cirticalCssArr = [];
                        let mediaQueriesCss = '';
                        const usedRules = rules.coverage.filter((rule) => {
                            styleSheetIds[rule.styleSheetId] = 1;
                            return rule.used;
                        });
                        const stylesSheetsPromises = [];
                        Object.keys(styleSheetIds).forEach(styleSheetId => {
                            stylesSheetsPromises.push(
                                CSS.getStyleSheetText({
                                    styleSheetId: styleSheetId
                                }).then(stylesheet => {
                                    styleSheetMap[styleSheetId] = stylesheet.text || '';
                                })
                            )
                        })
                        Promise.all(stylesSheetsPromises).then(() => {
                            //提取critical css
                            for (const usedRule of usedRules) {
                                const curStyleId = usedRule.styleSheetId;
                                const styleSeg = styleSheetMap[curStyleId].slice(usedRule.startOffset, usedRule.endOffset);
                                //收集关键样式
                                cirticalCssArr.push(styleSeg);
                            }
                            const cirticalStyle = cirticalCssArr.join('');
                            const allStyle = Object.keys(styleSheetMap).reduce((preStyle, curIdx) => {
                                return preStyle + styleSheetMap[curIdx];
                            }, '');

                            const allStyleParser = postCss.parse(allStyle);
                            allStyleParser.walkAtRules(rule => {
                                let isCritical = false;
                                if (rule.name.match(/^media/)) {
                                    //只选取关键的media query
                                    rule.each((subRule) => {
                                        const selector = subRule.selector;
                                        if(cirticalStyle.indexOf(selector) > 0){
                                            isCritical = true;
                                        }else{
                                            subRule.remove();
                                        }
                                    });
                                    if(isCritical){
                                        mediaQueriesCss += rule.toString();
                                    }
                                }
                            })
                            //关键样式+MediaQuery为最终首屏核心样式
                            const coveredStyle = cirticalStyle + mediaQueriesCss;
                            //清除content内容
                            const coveredStyleParser = postCss.parse(coveredStyle);
                            coveredStyleParser.walkDecls('content', decl => {
                                decl.value = '""';
                            });
                            const pureCoveredStyle = coveredStyleParser.toString();
                            if(kill){
                                chrome.kill().then(() => {
                                    resolve(pureCoveredStyle);
                                }).catch(ex => {
                                    reject(ex);
                                });
                            }else{
                                resolve(coveredStyle);
                            }
                        });
                    }).catch(ex => {
                        reject(ex)
                    });
                });
                Promise.all([
                    DOM.enable(),
                    CSS.enable(),
                    Network.enable(),
                    Page.enable(),
                    Runtime.enable()
                ]).then(() => {
                    Emulation.setDeviceMetricsOverride(emulationOptions);
                    Network.setExtraHTTPHeaders({ headers: extHeaders });
                    Network.setUserAgentOverride(userAgent);
                    CSS.startRuleUsageTracking();
                    Page.navigate({ url: url });
                }).catch((ex) => {
                    reject(ex)
                });
            }).on('error', (ex) => {
                reject(ex);
            });
        }).catch((ex) => {
            reject(ex);
        });
    });
}

module.exports = getCriticalCSS;
