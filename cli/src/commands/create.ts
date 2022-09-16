import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, BLOCKCHAINS } from "../constants"
import dotenv from 'dotenv';
dotenv.config({ path: '~/.gitanchor' });
const CoinGecko = require('coingecko-api');

export async function create(hash: string, silent: boolean, debug: boolean) {

    const blockchain = BLOCKCHAINS.find((chain) => chain.id === Number(process.env.CHAIN_ID));

    if(process.env.RPC_PROVIDER && process.env.SIGNER && process.env.CHAIN_ID && blockchain) {

        const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_PROVIDER);
        const signer = new ethers.Wallet(process.env.SIGNER, provider);
        const gitAnchorContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        try {
            if(!silent) { console.log(`Waiting for the transaction to complete...`); }
            let tx = await gitAnchorContract.setAnchor(hash);
            let receipt = await tx.wait();
            let feeInfo = `Gas used: ${receipt.gasUsed}`;
            if(receipt.effectiveGasPrice) {
                const CoinGeckoClient = new CoinGecko();
                let priceData = await CoinGeckoClient.simple.price({ ids: [blockchain.geckoApiId], vs_currencies: ['usd'] });
                const exchangeRage = parseFloat(priceData.data[blockchain.geckoApiId].usd);
                const usdPrice = parseFloat(ethers.utils.formatEther(receipt.gasUsed.mul(receipt.effectiveGasPrice))) * exchangeRage;
                let usdPricePretty: string;
                if(usdPrice < 0.01) { 
                    usdPricePretty = 'less than 0.01' 
                } else {
                    usdPricePretty = usdPrice.toFixed(2);
                }
                feeInfo = `Network fee: ${ethers.utils.formatEther(receipt.gasUsed.mul(receipt.effectiveGasPrice))} ${blockchain.coinSymbol} (${usdPricePretty} USD)`;
            }
            if(!silent) { 
                console.log(`The anchor for the hash ${hash} has been created`); 
                console.log(feeInfo);
                console.log(`Transaction details: ${blockchain.explorer.replace(/\/$/, '') }/tx/${receipt.transactionHash}#eventlog`);
            }
        } catch(error) {
            console.log('An error has occured');
            if(debug) { console.log(error); }
            process.exit(1);
        }
        process.exit(0);
    } else if(process.env.RPC_PROVIDER === undefined) {
        console.log(`No RPC_PROVIDER found in ~/.gitanchor config file`);
    } else if(process.env.SIGNER === undefined) {
        console.log(`No SIGNER found in ~/.gitanchor config file`);
    } else if(process.env.CHAIN_ID === undefined) {
        console.log(`No CHAIN_ID found in ~/.gitanchor config file`);
    } else if(blockchain === undefined) {
        console.log(`CHAIN_ID ${process.env.CHAIN_ID} as defined in ~/.gitanchor is not supported`);
    }

}