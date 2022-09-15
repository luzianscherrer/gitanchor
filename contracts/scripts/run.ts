import { ethers } from "hardhat";
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const questionContractAddress = () => {
    return new Promise<string>((resolve, reject) => {
        rl.question('Contract address: ', (answer) => {
            resolve(answer);
        })
    })
}

const questionHashToAnchor = () => {
    return new Promise<string>((resolve, reject) => {
        rl.question('Hash to anchor: ', (answer) => {
            resolve(answer);
        })
    })
}

async function createAnchor() {

    const contractAddress = await questionContractAddress();
    const hashToAnchor = await questionHashToAnchor();
    rl.close()

    const GitAnchor = await ethers.getContractFactory("GitAnchor");
    const gitAnchor = GitAnchor.attach(contractAddress);

    const tx = await gitAnchor.setAnchor(hashToAnchor);
    const receipt = await tx.wait();
    console.log(`Anchor set in block ${receipt.blockNumber} (transaction ${receipt.transactionHash})`);

    const anchor = await gitAnchor.getAnchor(hashToAnchor);
    var date = new Date(anchor[0].toNumber() * 1000);
    console.log(`Timestamp: ${date}`);
    console.log(`Origin: ${anchor[1]}`);
}

async function showLogs() {
    const contractAddress = '0x65438AaA54141dD923C5F51E81d1aaD11daF3558';
    const blockchainExplorer = 'https://goerli.etherscan.io';

    const GitAnchor = await ethers.getContractFactory("GitAnchor");
    const gitAnchor = GitAnchor.attach(contractAddress);

    const queryResults = await gitAnchor.queryFilter(gitAnchor.filters.Anchored('0f193a7b9f7edb42b0bca4bca58303eacdf7172c'), 0);
    for(let event of queryResults) {
        console.log(`${event.args.anchorOrigin} ${event.args.anchorTimestamp} ${event.args.anchorHashReadable} ${blockchainExplorer}/tx/${event.transactionHash}#eventlog`);
    }
    process.exit(0);
}

async function main() {
    // await createAnchor();
    await showLogs();
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
