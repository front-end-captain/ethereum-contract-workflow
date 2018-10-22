const fs = require('fs-extra');
const path = require('path');
const solc = require('solc');
const Chalk = require('chalk');

const log = console.log;

// cleanup the compiled dir
const compiledPath = path.resolve(__dirname, '../compiled');
fs.removeSync(compiledPath);
fs.ensureDirSync(compiledPath);
log(Chalk.green('The compile dir is cleaned up'));

const contractFiles = fs.readdirSync(path.resolve(__dirname, '../contracts'));
contractFiles.forEach((contractFile) => {
  const contractPath = path.resolve(__dirname, '../contracts', contractFile);
  const contractSource = fs.readFileSync(contractPath, 'utf8');
  const result = solc.compile(contractSource, 1);

  log(Chalk.yellow(`contract file ${contractFile} compiled`));

  // check compile error
  if (Array.isArray(result.errors) && result.errors.length) {
    throw new Error(result.errors[0]);
  }

  // save to the disk
  Object.keys(result.contracts).forEach((name) => {
    const contractName = name.replace(/^:/, '');
    const filePath = path.resolve(
      __dirname,
      '../compiled',
      `${contractName}.json`,
    );
    fs.outputJsonSync(filePath, result.contracts[name]);
    log(
      Chalk.greenBright(
        `> save compiled contract ${Chalk.red(contractName)} to ${Chalk.red(
          filePath,
        )}`,
      ),
    );
  });
});
