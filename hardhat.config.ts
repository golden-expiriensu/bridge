import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

import { NetworkUserConfig } from 'hardhat/types';
import '@nomiclabs/hardhat-waffle';
import "@nomiclabs/hardhat-ethers";
import "./tasks"

const chainIds = {
  ganache: 1337,
  goerli: 5,
  hardhat: 31337,
  kovan: 42,
  mainnet: 1,
  rinkeby: 4,
  ropsten: 3,
};

let mnemonic: string;
if (!process.env.MNEMONIC) {
  throw new Error('Please set your MNEMONIC in a .env file' + " " + process.env.MNEMONIC);
} else {
  mnemonic = process.env.MNEMONIC;
}

let infuraApiKey:string;
if (!process.env.INFURA_API_KEY) {
  throw new Error('Please set your INFURA_API_KEY in a .env file');
} else {
  infuraApiKey = process.env.INFURA_API_KEY;
}

function createNetworkConfig(
  network: keyof typeof chainIds,
): NetworkUserConfig {
  const url: string = `https://${network}.infura.io/v3/${infuraApiKey}`;
  return {
    accounts: {
      count: 10,
      initialIndex: 0,
      mnemonic,
      path: "m/44'/60'/0'/0",
    },
    chainId: chainIds[network],
    gas: "auto",
    gasPrice: 120000000000, // gwei
    url,
  };
}

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      accounts: {
        mnemonic,
      },
      chainId: chainIds.hardhat,
    },
    mainnet: createNetworkConfig('mainnet'),
    goerli: createNetworkConfig('goerli'),
    kovan: createNetworkConfig('kovan'),
    rinkeby: createNetworkConfig('rinkeby'),
    ropsten: createNetworkConfig('ropsten'),
    
    bsctestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gas: 2100000,
      gasPrice: 10000000000,
      accounts: {mnemonic: mnemonic},
    },

    mumbai: {
    	url: "https://rpc-mumbai.maticvigil.com",
      chainId: 80001,
    	accounts: { mnemonic: mnemonic },
  	},

    matic: {
    	url: "https://rpc-mainnet.maticvigil.com",
      chainId: 137,
    	accounts: { mnemonic: mnemonic },
  	},

    fantom: {
    	url: "https://rpc.testnet.fantom.network",
      chainId:  0xfa2,
    	accounts: { mnemonic: mnemonic },
  	},

    bscmainnet: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      gasPrice: 10000000000,
      accounts: {mnemonic: mnemonic}
    }
  },

  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  paths: {
    artifacts: './artifacts',
    cache: './cache',
    sources: './contracts',
    tests: './test',
    tasks: './tasks',
  },
  mocha: {
    timeout: 20000
  },
  solidity: {
    compilers: [
      {
        version: '0.8.4',
        settings: {
          optimizer: {
            enabled: true,
            runs: 400,
          },
        },
      },
    ],
  },
};