export const CONTRACT_ADDRESS = '0x65438AaA54141dD923C5F51E81d1aaD11daF3558';
export const BLOCKCHAINS = [
    { id: 5,      name: 'Ethereum Goerli',  explorer: 'https://goerli.etherscan.io',           coinSymbol: 'ETH',    geckoApiId: 'ethereum'},
    { id: 80001,  name: 'Polygon Mumbai',   explorer: 'https://mumbai.polygonscan.com',        coinSymbol: 'MATIC',  geckoApiId: 'matic-network'},
    { id: 338,    name: 'Cronos testnet',   explorer: 'https://testnet.cronoscan.com',         coinSymbol: 'CRO',    geckoApiId: 'crypto-com-chain'},
    { id: 420,    name: 'Optimism Goerli',  explorer: 'https://goerli-optimism.etherscan.io',  coinSymbol: 'ETH',    geckoApiId: 'ethereum'}
];
export const CONTRACT_ABI = [
    "function getAnchor(string memory anchorHash) public view returns (uint256, address)",
    "function setAnchor(string memory anchorHash) public",
    "event Anchored(string indexed anchorHashIndexed, string anchorHashReadable, uint256 indexed anchorTimestamp, address indexed anchorOrigin)"
];
