import { ethers } from "hardhat";
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const questionContractAddress = () => {
    return new Promise<string>((resolve, reject) => {
        rl.question('Contract address: ', (answer) => {
            resolve(answer)
        })
    })
}

const questionHashToAnchor = () => {
    return new Promise<string>((resolve, reject) => {
        rl.question('Hash to anchor: ', (answer) => {
            resolve(answer)
        })
    })
}

async function main() {

    const contractAddress = await questionContractAddress()
    const hashToAnchor = await questionHashToAnchor()
    rl.close()

    const GitAnchor = await ethers.getContractFactory("GitAnchor");
    const gitAnchor = await GitAnchor.attach(contractAddress);

    const tx = await gitAnchor.setAnchor(hashToAnchor);
    const receipt = await tx.wait();
    console.log(`Anchor set in block ${receipt.blockNumber} (transaction ${receipt.transactionHash})`);

    const anchor = await gitAnchor.getAnchor(hashToAnchor);
    var date = new Date(anchor[0].toNumber() * 1000);
    console.log(`Timestamp: ${date}`);
    console.log(`Origin: ${anchor[1]}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
