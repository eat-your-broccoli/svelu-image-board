import { Sequelize } from "sequelize/types";
const dbName = 'svelu'; // this name needs to be consistent with the terraform rds_db_name variable
const username = 'root';
const password = 'p4ssword1234!!!!';

const dbConfigDev = {
    port: 3306,
    host: 'localhost'
}

const dbConfigProd = {
    port: 3306,
    host: 'terraform-20220607102642140600000001.cot6blumzzfi.eu-central-1.rds.amazonaws.com'
}



let sequelize: Sequelize = null;

async function loadSequelize(context = 'develop'): Promise<{sequelize: Sequelize}> {
    
    return new Promise((resolve, reject) => {
        switch (context) {
            case 'develop': sequelize = loadSequelizeDev(); break;
            case 'production': sequelize = loadSequelizeProd(); break;
        }
        resolve({sequelize});
    })
}

function loadSequelizeDev() {
    sequelize = new Sequelize(dbName, username, password, {
        dialect: 'mysql',
        dialectOptions: {
          ...dbConfigDev,
        }
      })
      return sequelize;
}

function loadSequelizeProd() {
    sequelize = new Sequelize(dbName, username, password, {
        dialect: 'mysql',
        dialectOptions: {
          ...dbConfigProd,
        },
        pool: {
            max: 2,
            min: 0,
            idle: 0,
            acquire: 3000,
        }
      })
      return sequelize;
}