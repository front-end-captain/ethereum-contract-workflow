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

// compile
const contractPath = path.resolve(__dirname, '../contracts', 'Car.sol');
const contractSource = fs.readFileSync(contractPath, 'utf8');
const result = solc.compile(contractSource, 1);

// check compile error
if (Array.isArray(result.errors) && result.errors.length) {
  throw new Error(result.errors[0]);
}

log(Chalk.yellow('Compile over !!!'));

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
    Chalk.greenBright(`save compiled contract ${contractName} to ${filePath}`),
  );
});
