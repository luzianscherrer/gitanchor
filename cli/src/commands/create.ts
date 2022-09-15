import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../constants"
import dotenv from 'dotenv';
dotenv.config({ path: '~/.gitanchor' });

export async function create(hash: string, silent: boolean, debug: boolean) {
    if(process.env.RPC_PROVIDER && process.env.SIGNER && process.env.COIN_SYMBOL) {
        const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_PROVIDER);
        const signer = new ethers.Wallet(process.env.SIGNER, provider);
        const gitAnchorContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        try {
            if(!silent) { console.log(`Waiting for the transaction to complete...`); }
            let tx = await gitAnchorContract.setAnchor(hash);
            let receipt = await tx.wait();
            let feeInfo = `(gas used: ${receipt.gasUsed})`;
            if(receipt.effectiveGasPrice) {
                feeInfo = `(network fee: ${ethers.utils.formatEther(receipt.gasUsed.mul(receipt.effectiveGasPrice))} ${process.env.COIN_SYMBOL})`;
            }
            if(!silent) { console.log(`The anchor for the hash ${hash} has been created ${feeInfo}`); }
            if(process.env.BLOCK_EXPLORER) {
                if(!silent) console.log(`View on block explorer: ${process.env.BLOCK_EXPLORER.replace(/\/$/, '') }/tx/${receipt.transactionHash}#eventlog`);
            }    
        } catch(error) {
            console.log('An error has occured');
            if(debug) console.log(error);
            process.exit(1);
        }
        process.exit(0);
    } else if(process.env.RPC_PROVIDER === undefined) {
        console.log(`No RPC_PROVIDER found in ~/.gitanchor config file`);
    } else if(process.env.SIGNER === undefined) {
        console.log(`No SIGNER found in ~/.gitanchor config file`);
    } else if(process.env.SIGNER === undefined) {
        console.log(`No COIN_SYMBOL found in ~/.gitanchor config file`);
    }

}