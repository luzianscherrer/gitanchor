import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../constants"
import dotenv from 'dotenv';
dotenv.config({ path: '~/.gitanchor' });

export async function verify(hash: string, silent: boolean, debug: boolean) {
    if(process.env.RPC_PROVIDER) {
        const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_PROVIDER);
        const gitAnchorContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        let value: any;
        try {
            value = await gitAnchorContract.getAnchor(hash);
        } catch(error) {
            console.log('An error has occured');
            if(debug) console.log(error);
            process.exit(1);
        }
        if(value[0].toNumber() !== 0) {
            let displayDate = new Date(value[0].toNumber() * 1000).toLocaleString('EN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
            if(!silent) console.log(`The hash ${hash} has been anchored on ${displayDate}`);
        } else {
            if(!silent) console.log(`The hash ${hash} is not anchored`);
            process.exit(2);
        }
        if(process.env.BLOCK_EXPLORER) {
            try {
                const queryResults = await gitAnchorContract.queryFilter(gitAnchorContract.filters.Anchored(hash), 0);
                for(let event of queryResults) {
                    if(!silent) console.log(`View on block explorer: ${process.env.BLOCK_EXPLORER.replace(/\/$/, '') }/tx/${event.transactionHash}#eventlog`);
                }            
            } catch(error) {
                console.log('The transaction log entry could not be retrieved')
                if(debug) console.log(error);
            }
        }
        process.exit(0);
    } else {
        console.log(`No RPC_PROVIDER found in ~/.gitanchor config file`);
    }

}