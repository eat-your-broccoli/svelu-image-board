const {Sequelize} = require('sequelize');
const {Umzug, SequelizeStorage} = require('umzug');

let sequelize = null;
let umzug = null;


async function loadSequelize(params) {
    if(!sequelize) {
        sequelize = new Sequelize(params.dbName, params.username, params.password, {
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
          });
    }
    await sequelize.authenticate();
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

module.exports = {loadUmzug};