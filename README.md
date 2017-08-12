Extract critical css by using headless chrome through chrome debug protocol(CDP). Base on Chrome's code coverage functionality, introduced since version 59. Besides, the tool also extract relevant media query expressions.


### api 

``` javascript
const chromeCriticalCss = require('chrome-critical-css');
chromeCriticalCss('url-to-be-extract-css', 
	{
		deviceScaleFactor: 2,
		fitWindow: true,
		width: 375,
		height: 677,
		mobile: true
	}, 
	{
		custom-header: 'custom value'
	}, 
	{
	userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
	}
,true).then((criticalCss) =>{
	console.log(criticalCss);
}).catch(ex =>{
	console.err(ex);
})

```

