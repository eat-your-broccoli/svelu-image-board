const {Sequelize} = require('sequelize');
const {Umzug, SequelizeStorage} = require('umzug');

let sequelize = null;
let umzug = null;

const models = [];
const db = {};
async function loadSequelize(params) {
    if(params == null) {
      params = {};
      params.dbName = process.env.DB_NAME;
      params.password = process.env.DB_PASS;
      params.username = process.env.DB_USER;
      params.dbPort = process.env.DB_PORT;
      params.dbHost = process.env.DB_HOST;
    }

    const options = {
      dialect: 'mysql',
      dialectOptions: {
        host: params.dbHost,
        port: params.dbPort,
        ssl: 'Amazon RDS'
      },
      pool: {
          max: 2,
          min: 0,
          idle: 0,
          // Choose a small enough value that fails fast if a connection takes too long to be established.
          acquire: 3000
        }
    }

    if(params.dbHost == "localhost") {
      options.dialectOptions.ssl = {
        require: true,
        rejectUnauthorized: false
      }
    }

    if(!sequelize) {
        sequelize = new Sequelize(params.dbName, params.username, params.password, options);
    }
    await sequelize.authenticate();

    models.push(require('./models/comment')(sequelize, Sequelize));
    models.push(require('./models/user')(sequelize, Sequelize));
    models.push(require('./models/post')(sequelize, Sequelize));

    models.forEach(model => {
      db[model.name] = model;
    }) 

    Object.keys(db).forEach(modelName => {
      if (db[modelName].associate) {
        db[modelName].associate(db);
      }
    });
    sequelize._models = db;

    return sequelize;
}

async function loadUmzug(params) {
    await loadSequelize(params);
    umzug = new Umzug({
        migrations: { 
          glob: 'migrations/*.js',
        },
        context: sequelize.getQueryInterface(),
        storage: new SequelizeStorage({ sequelize }),
        logger: console,
      });
    return umzug;
}

module.exports = {loadUmzug, loadSequelize};