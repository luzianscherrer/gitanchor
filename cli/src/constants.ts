export const CONTRACT_ADDRESS = '0x65438AaA54141dD923C5F51E81d1aaD11daF3558';
export const CONTRACT_ABI = [
    "function getAnchor(string memory anchorHash) public view returns (uint256, address)",
    "function setAnchor(string memory anchorHash) public",
    "event Anchored(string indexed anchorHashIndexed, string anchorHashReadable, uint256 indexed anchorTimestamp, address indexed anchorOrigin)"
];
