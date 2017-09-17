var DataLayer = require(__dirname + "/DataLayer.js");
const globalSetting = {
    CronSchedule: require("node-schedule"),
    timer: "*/1 * * * *",
    feedService: null,
    feedUrl: "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml",
    async: true
};

function parseExhangeRateFeed(feedUrl) {
    const https = require("https");
    const xml2Js = require("xml2js");
    var concat = require("concat-stream");
    const parser = new xml2Js.Parser();

    parser.on("error", function (err) {
        //console.log("Parser error", err);
    });
    https.get(feedUrl, function (resp) {
        resp.on("error", function (err) {
            console.log("Error while reading", err);
        });
        resp.pipe(concat(function (buffer) {
            const str = buffer.toString();
            parser.parseString(str, function (err, result) {
                saveJsonData(result);
                //console.log("Finished parsing:", err, result);
            });
        }));
    });
}
function parseExchangeRateFeedAsync(feedUlr) {
    const eyes = require("eyes");
    const https = require("https");
    const async = require("async");
    const xml2Js = require("xml2js");

    async.waterfall([
        function (callback) {
            https.get(feedUlr, function (res) {
                var responseData = "";
                res.setEncoding("utf8");
                res.on("data", function (chunk) {
                    responseData += chunk;
                });
                res.on("end", function () {
                    callback(null, responseData);
                });
                res.on("error", function (err) {
                    callback(err);
                });
            });
        },
        function (xml, callback) {
            const parser = new xml2Js.Parser();
            parser.parseString(xml, function (err, result) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, result);
                }
            });
        },
        function (json, callback) {
            eyes.inspect(json);
            //saveJsonData(json);
            fomrmatExchangeRateData(json["gesmes:Envelope"]["Cube"][0]["Cube"]);
            callback();
        }
    ], function (err, result) {
        if (err) {
            console.log("Got error");
            console.log(err);
        } else {
            console.log("Done.");
        }
    });
}

function fomrmatExchangeRateData(jsonValue) {
    function mapChildExchangeRate(jsonValue) {
        var returnValue = {
            currency: "",
            rate: ""
        };
        returnValue.currency = jsonValue["$"].currency;
        returnValue.rate = jsonValue["$"].rate;
        return returnValue;
    }

    function mapJsonParent(jsonValue) {
        var returnValue = {
            day: "",
            exchangeRates: []
        };
        returnValue.day = new Date(jsonValue["$"].time).toISOString().slice(0, 10); ;
        for (var j = 0; j <= jsonValue["Cube"].length - 1; j++) {
            returnValue.exchangeRates.push(mapChildExchangeRate(jsonValue["Cube"][j]));
        }
        return returnValue;
    }

    for (let i = 0; i <= jsonValue.length - 1; i++) {
        console.log(i);
        saveData(mapJsonParent(jsonValue[i]));
    }
}

function saveData(exchangeRate) {
    try {
        DataLayer.handleExchangeDay(exchangeRate, (returnValue, originalData) => {
            console.log(returnValue.created);
            //if (returnValue.created) {
            //    for (let i = 0; i <= originalData.length - 1; i++) {
            //        originalData[i].ExchangeRateDayID = returnValue.Data.ID;
            //    }
            //    DataLayer.handleBulkExchangeRate(originalData);
            //}
        });    
    } catch (e) {
        console.error(e);
    } 
    //console.log(exchangeRate);
    
};
//function saveJsonData(parsedJson) {
//    fomrmatExchangeRateData(parsedJson["gesmes:Envelope"]["Cube"][0]["Cube"]);
//}

module.exports = {
    get timer() {
        return globalSetting.timer;
    },
    set timer(value) {
        globalSetting.timer = value;
    },
    get feedUrl() {
        return globalSetting.timer;
    },
    set feedUrl(value) {
        globalSetting.feedUrl = value;
    },
    get async() {
        return globalSetting.async;
    },
    set async(value) {
        globalSetting.async = value;
    },
    Run: function () {
        globalSetting.feedService = globalSetting.CronSchedule.scheduleJob(globalSetting.timer, function () {
            console.log("Running the Background service!");
            if (globalSetting.async) {
                parseExchangeRateFeedAsync(globalSetting.feedUrl);
            } else {
                parseExhangeRateFeed(globalSetting.feedUrl);
            }
        });
    }
};