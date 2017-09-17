const Sequelize = require("sequelize");
//settings
const sqlSettings = {
    dataBaseName: "ExchangeRateCalculator",
    dataBasePassword: "4G3tM3N0t77*",
    userName: "sa",
    hostName: "MASTERTILT",
    instanceName: "DATATILT",
    connectionDialect: "mssql",
    sequelizeConnection: null,
    models: {},
    isConnection: false
};
//Functions
const init = function () {
    console.log("initialize connection");
    sqlSettings.sequelizeConnection = new Sequelize(sqlSettings.dataBaseName,
	  sqlSettings.userName,
	  sqlSettings.dataBasePassword,
	  {
	      host: sqlSettings.hostName,
	      dialect: sqlSettings.connectionDialect,
	      dialectOptions: {
	          instanceName: sqlSettings.instanceName,
	      },
	      pool: {
	          max: 10,
	          min: 0,
	          idle: 10000
	      },
	      omitNull: true
	  });
};
const initProperties = function (properties) {
    console.log("set proerties");
    function setProperty(properties, propertyName) {
        if (properties.hasOwnProperty(propertyName)) {
            sqlSettings[propertyName] = properties[propertyName];
        }
    }
    if (properties !== undefined & typeof properties === "object") {
        setProperty(properties, "dataBaseName");
        setProperty(properties, "dataBasePassword");
        setProperty(properties, "userName");
        setProperty(properties, "hostName");
    }
    init();
};
const initModels = function () {
    console.log("initialize models");
    sqlSettings.models.exchangeRateModel = sqlSettings.sequelizeConnection.define(
		"ExchangeRate",
		{
		    ID: {
		        type: Sequelize.UUID,
		        primaryKey: true
		    },
		    ExchangeRateDayID: {
		        type: Sequelize.UUID
		    },
		    Currency: {
		        type: Sequelize.STRING
		    },
		    Rate: {
		        type: Sequelize.DECIMAL(16, 1)
		    }
		},
		{
		    timestamps: false
		});
    sqlSettings.models.exchangeRateDayModel = sqlSettings.sequelizeConnection.define(
        "ExchangeRateDay",
        {
            ID: {
                type: Sequelize.UUID,
                primaryKey: true
            },
            ExchnageRateDay: {
                type: Sequelize.DATEONLY,
                unique: true
            }
        },
        {
            timestamps: false
        });
    //sqlSettings.models.exchangeRateDayModel.hasMany(sqlSettings.models.exchangeRateModel, {
    //	foreignKey: {
    //		name: "ID",
    //		allowNull: false
    //	}
    //});
};
const connectionTester = function () {
    sqlSettings.sequelizeConnection
        .authenticate()
        .then(() => {
            console.log("Connection has been established successfully.");
            sqlSettings.isConnection = true;
        })
        .catch(err => {
            console.error("Unable to connect to the database:", err);
        });
};

//Initiate Connection
init();
initModels();
connectionTester();
//exportModel
module.exports = {
    get dataBaseName() {
        return sqlSettings.dataBaseName;
    },
    set dataBaseName(value) {
        sqlSettings.dataBaseName = value;
    },
    get dataBasePassword() {
        return sqlSettings.dataBasePassword;
    },
    set dataBasePassword(value) {
        sqlSettings.dataBasePassword = value;
    },
    get userName() {
        return sqlSettings.userName;
    },
    set userName(value) {
        sqlSettings.userName = value;
    },
    get hostName() {
        return sqlSettings.hostName;
    },
    set hostName(value) {
        sqlSettings.hostName = value;
    },
    initConnection: function (properties) {
        initProperties(properties);
        init();
    },
    testConnection: function () {
        connectionTester();
    },
    handleExchangeDay: function (exchangeDayValue, callBack) {
        console.log(exchangeDayValue.day);
        return sqlSettings.sequelizeConnection.transaction(function (t) {
            sqlSettings.models
		        .exchangeRateDayModel
		        .findOrCreate({
		            where: {
		                ExchnageRateDay: exchangeDayValue.day
		            },
		            defaults: {
		                ExchnageRateDay: exchangeDayValue.day
		            }
		        })
		        .spread((exchangeDay, created) => {
		            return {
		                data: exchangeDay.get({ plain: true }),
		                created: created
		            };
		        })
                .then((result) => {
                    callBack(result, exchangeDayValue.exchangeRates);
                })
                .catch(function (err) {
                    console.log(err);
                });
        }).then(function (result) {
            //callBack(result, exchangeDayValue.exchangeRates);
        }).catch(function (err) {
            console.log(err);
        });
    },
    handleExchangeRate: function (exchangeRate, foreignKey) {
        return sqlSettings.sequelizeConnection.transaction(function (t) {
            sqlSettings.models
				.exchangeRateModel
				.findOrCreate({
				    where: {
				        ExchangeRateDayID: foreignKey
				    },
				    defaults: {
				        ExchnageRateDay: foreignKey,
				        Currency: exchangeRate.currency,
				        Rate: exchangeRate.rate
				    }
				});
        }).catch(function (err) {
            console.log(err);
        });
    },
    handleBulkExchangeRate: function (exchangeRateArray) {
        return sqlSettings.sequelizeConnection.transaction(function (t) {
            sqlSettings.models
		        .exchangeRateModel
		        .bulkCreate(exchangeRateArray)
				.then(() => {
				    console.log("bulk this");
				});
        }).catch(function (err) {
            console.log(err);
        });
    }
};