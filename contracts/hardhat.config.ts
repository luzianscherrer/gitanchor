import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from 'dotenv';
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  networks: {
    localhost: {
      accounts: [ process.env.DEVELOPMENT_KEY ?? 'unknown' ]
    },
    goerli: {
      url: process.env.GOERLI_URL ?? 'unknown',
      accounts: [ process.env.DEVELOPMENT_KEY ?? 'unknown' ]
    },
    mumbai: {
      url: process.env.MUMBAI_URL ?? 'unknown',
      accounts: [ process.env.DEVELOPMENT_KEY ?? 'unknown' ]
    },
    'optimism-goerli': {
      url: process.env.OPTIMISM_GOERLI_URL ?? 'unknown',
      accounts: [ process.env.DEVELOPMENT_KEY ?? 'unknown' ]
    }
  }
};

export default config;
