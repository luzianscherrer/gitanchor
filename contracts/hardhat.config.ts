import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  networks: {
    localhost: {
      accounts: [ process.env.GOERLI_KEY ?? 'unknown' ]
    },
    goerli: {
      url: process.env.GOERLI_URL ?? 'unknown',
      accounts: [ process.env.GOERLI_KEY ?? 'unknown' ]
    }
  }
};

export default config;
