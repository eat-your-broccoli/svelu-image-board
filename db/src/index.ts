// index.js
import { Sequelize } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';

const dbName = 'svelu'; // this name needs to be consistent with the terraform rds_db_name variable
const username = 'root';
const password = 'p4ssword1234!!!!';

const dbConfig = {
    port: 3306,
    host: 'localhost'
}

const sequelize = new Sequelize(dbName, username, password, {
    dialect: 'mysql',
    dialectOptions: {
      ...dbConfig,
    }
  })

const umzug = new Umzug({
  migrations: { glob: 'migrations/*.js' },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

(async () => {
  // Checks migrations and run them if they are not already applied. To keep
  // track of the executed migrations, a table (and sequelize model) called SequelizeMeta
  // will be automatically created (if it doesn't exist already) and parsed.
  await umzug.up();
})();