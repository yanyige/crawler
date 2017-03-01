var http = require('http');

var cheerio = require('cheerio');

var charset = require('superagent-charset');

var superagent = require('superagent');

var eventproxy = require('eventproxy');

var assert = require('assert');

var async = require('async');

var url = 'http://search.jd.com/Search?keyword=time&enc=utf-8';

var ep = new eventproxy();

var ids = [];

charset(superagent);

// http.get(url, (res) => {
// 	var html = '';

// 	res.on('data', (data) => {
// 		html += data;
// 	});

// 	res.on('end', () => {
// 		console.log(html);
// 	});
// }).on('error', () => {
// 	console.log('加载出错!');
// });

superagent.get(url).charset('gbk').end((err, pres) => {
	// console.log(pres.text);

	var $ = cheerio.load(pres.text);

	var _ids = $('.gl-item');


	for(var item in _ids) {
		if(_ids.hasOwnProperty(item)) {
			if(!isNaN(+item)) {
				ids.push(_ids[+item].attribs['data-sku']);

				ep.emit('saveUrl', _ids[+item].attribs['data-sku']);
			}
		}
	};

});

// ep.after('saveUrl', 30, (urls) => {
// 	urls.map((_id) => {

// 		var _url = 'https://club.jd.com/comment/productPageComments.action?score=0&sortType=5&productId=' + _id + '&page=5&pageSize=10';
// 		console.log(_id);
// 		superagent.get(_url).charset('gbk').end((err, pres) => {
// 			var _content = JSON.parse(pres.text);
// 			for(var item in _content) {
// 				// console.log(_content.comments);
// 				for(var _item in _content.comments) {
// 					console.log(_content.comments[_item].content);
// 				}
// 			}
// 		});
// 	});
// });

ep.after('saveUrl', 30, function(urls){

    var curCount = 0;
    var reptileMove = function(url,callback){
        //延迟毫秒数
	    var delay = parseInt((Math.random() * 30000000) % 1000, 10);
	    var _ans = [];
		curCount++;

		var _url = 'https://club.jd.com/comment/productPageComments.action?score=0&sortType=5&productId=' + url + '&page=5&pageSize=10';
		console.log('现在的并发数是', curCount, '，正在抓取的是', _url, '，耗时' + delay + '毫秒');

	    superagent.get(_url).charset('gbk').end(function(err,pres){
            var _content = JSON.parse(pres.text);
			for(var item in _content) {
				// console.log(_content.comments);
				for(var _item in _content.comments) {
					// console.log(_content.comments[_item].content);
					_ans.push(_content.comments[_item].content);
				}
			}
        });

	    setTimeout(function() {
	        curCount--;
	        callback(null, _ans);
	    }, delay);
    };

// 使用async控制异步抓取
// mapLimit(arr, limit, iterator, [callback])
// 异步回调
	async.mapLimit(urls, 5 ,function (url, callback) {
      reptileMove(url, callback);
    }, function (err,result) {
        // 4000 个 URL 访问完成的回调函数
        // ...
        console.log(result);
    });
});