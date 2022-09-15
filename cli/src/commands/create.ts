import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../constants"
import dotenv from 'dotenv';
dotenv.config({ path: '~/.gitanchor' });

export async function create(hash: string, silent: boolean) {
    if(process.env.RPC_PROVIDER) {
        const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_PROVIDER);
        const gitAnchorContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        try {
            let tx = await gitAnchorContract.setAnchor(hash);
            await tx.wait(0);
            if(!silent) console.log(`The anchor for the hash ${hash} has been created with transaction ${tx.transactionHash}`);
            if(process.env.BLOCK_EXPLORER) {
                if(!silent) console.log(`View on block explorer: ${process.env.BLOCK_EXPLORER.replace(/\/$/, '') }/tx/${tx.transactionHash}`);
            }    
        } catch(error) {
            console.log('An error has occured');
            process.exit(1);
        }
        process.exit(0);
    } else {
        console.log(`No RPC_PROVIDER found in ~/.gitanchor config file`);
    }

}