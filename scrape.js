var request = require('request');
var cheerio = require('cheerio');

request('http://www.rscrevolution.com/', function (error, response, html) {
  if (!error && response.statusCode == 200) {
    console.log(html);
  }
});