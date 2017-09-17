"use strict";

var Http = require("http");
var FeedService = require("./Modules/FeedService.js");
//var DataLayer = require("./Modules/DataLayer.js");
var Port = process.env.PORT || 1777;

FeedService.Run();
//var Dtaetest = new Date("2017-09-15");
//DataLayer.testConnection();
//var Test = {
//    rate: "4.5823",
//    currency: "udf"
//}

//DataLayer.handleExchangeRate(Test, "48F22B00-1C9B-E711-B6AF-0050B6CA2F85");


//var Returndata = DataLayer.handleExchangeDay(Test, (value) => {
//    console.log(value);
//});
//console.log(Returndata);
//Http.createServer(function (req, res) {
//    res.writeHead(200, { 'Content-Type': 'text/plain' });
//    res.end('Hello World\n');
//}).listen(Port);
