const mongoose = require("mongoose");
const chalk = require("chalk");
const DBConfig = require("../Config/DBConfig.js");
const { Admin } = require("./../Model/index.js");

mongoose.set('bufferCommands', false);

async function connectDB() {
  const options = {
    useNewUrlParser: true,
    useCreateIndex: true,
    bufferMaxEntries: 0,
    autoReconnect: true,
    poolSize: 5,
  };

  const { user, pass, host, port, db } = DBConfig;

  const uri = `mongodb://${user}:${pass}@${host}:${port}/${db}`;
  await connectMongodb(uri, options);
  await initialSuperAdmin();
}

function initialSuperAdmin() {
  return new Promise(async (resolve, reject) => {
    const { superUsername, superPassword, email, phone } = DBConfig;
    const superAdmin = await Admin.find({ username: superUsername });

    if (superAdmin.length === 0) {
      const user = new Admin({
        username: superUsername,
        password: superPassword,
        power: [],
        email,
        phone,
        superAdmin: true,
      });
      await user.save();
      resolve();
    } else {
      reject();
    }
  });
}

function connectMongodb(uri, options) {
  return new Promise((resolve, reject) => {
    mongoose.connect(uri, options).then(
      () => {
        console.log(chalk.green("The database connection successful!"));
        resolve();
      },
      (error) => {
        console.error(error);
        console.log(chalk.red("The database connection fail"));
        reject(error);
        process.exit(1);
      },
    );
  });
}

module.exports = connectDB;
