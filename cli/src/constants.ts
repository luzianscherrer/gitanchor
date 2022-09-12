export const CONTRACT_ADDRESS = '0x6B9797F6aC0d5a8929f1951a1090A4a2dCF5a899';
export const CONTRACT_ABI = [
    "function getAnchor(string memory anchorHash) public view returns (uint256, address)",
    "function setAnchor(string memory anchorHash) public",
    "event Anchored(string indexed anchorHashIndexed, string anchorHashReadable, uint256 indexed anchorTimestamp, address indexed anchorOrigin)"
];
