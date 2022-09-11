import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../constants"
import dotenv from 'dotenv';
dotenv.config({ path: '~/.gitanchor' });

export async function verify(hash: string) {

    if(process.env.RPC_PROVIDER) {
        const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_PROVIDER);
        const gitAnchorContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        const value = await gitAnchorContract.getAnchor(hash);
        if(value[0].toNumber() !== 0) {
            let displayDate = new Date(value[0].toNumber() * 1000).toLocaleString('EN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
            console.log(`The hash ${hash} has been anchored on ${displayDate}`);
        } else {
            console.log(`The hash ${hash} is not anchored`);
        }    
    } else {
        console.log(`No RPC_PROVIDER found in ~/.gitanchor config file`);
    }

}