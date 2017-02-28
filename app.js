var http = require('http');

var cheerio = require('cheerio');

var charset = require('superagent-charset');

var spagent = require('superagent');

var eventproxy = require('eventproxy');

var assert = require('assert');

var url = 'http://search.jd.com/Search?keyword=time&enc=utf-8';

var ep = new eventproxy();

var ids = [];

charset(spagent);

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

spagent.get(url).charset('gbk').end((err, pres) => {
	// console.log(pres.text);

	var $ = cheerio.load(pres.text);

	var _ids = $('.gl-item');


	// ids.forEach((item,id) => {
	// 	console.log(item+'|'+id);
	// });
	for(var item in _ids) {
		if(_ids.hasOwnProperty(item)) {
			if(!isNaN(+item)) {
				ids.push(_ids[+item].attribs['data-sku']);

				ep.emit('saveUrl', _ids[+item].attribs['data-sku']);
			}
		}
	};

});

ep.after('saveUrl', 30, (urls) => {
	urls.map((_id) => {

		var _url = 'https://club.jd.com/comment/productPageComments.action?score=0&sortType=5&productId=' + _id + '&page=5&pageSize=10';
		console.log(_id);
		spagent.get(_url).charset('gbk').end((err, pres) => {
			var _content = JSON.parse(pres.text);
			for(var item in _content) {
				// console.log(_content.comments);
				for(var _item in _content.comments) {
					console.log(_content.comments[_item].content);
				}
			}
		});
	});
});