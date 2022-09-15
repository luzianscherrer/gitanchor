import { ethers } from "ethers";
import dotenv from 'dotenv';
dotenv.config({ path: '~/.gitanchor' });

export async function newwallet(debug: boolean) {
    const wallet = ethers.Wallet.createRandom();
    console.log(`New wallet created:

Public key: ${wallet.address}
Private key: ${wallet.privateKey}

Please store this information in a safe place. In order to use this wallet to 
pay for network fees when creating anchors, fund it with coins and add the 
following line to your ~/.gitanchor config file:
SIGNER=${wallet.privateKey}`);
}