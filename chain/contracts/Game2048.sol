// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract Game2048 is ERC721, Ownable {
    using Strings for uint256;

    uint256 private _nextTokenId = 1;

    // ── Game ────────────────────────────────────────────────
    mapping(address => uint32) public gamesPlayed;

    // ── GM (resets at 01:00 UTC) ────────────────────────────
    mapping(address => uint256) public lastGmDay;
    mapping(address => uint32) public gmStreak;
    mapping(address => uint32) public totalGms;

    // ── Early Adopter NFT ───────────────────────────────────
    mapping(address => bool) public hasEarlyAdopterNFT;
    uint256 public totalMinted;

    // ── Events ──────────────────────────────────────────────
    event GameStarted(address indexed player, uint8 gridSize);
    event GmCheckedIn(address indexed player, uint32 streak, uint32 total);
    event EarlyAdopterMinted(address indexed player, uint256 tokenId);

    constructor() ERC721("2048 on Base: Early Adopter", "2048EA") Ownable(msg.sender) {}

    // ────────────────────────────────────────────────────────
    //  Start a game — called when player picks a mode (3/4/5)
    //  Mints Early Adopter NFT on first ever game
    // ────────────────────────────────────────────────────────
    function startGame(uint8 gridSize) external {
        require(gridSize == 3 || gridSize == 4 || gridSize == 5, "Bad grid");

        gamesPlayed[msg.sender]++;

        emit GameStarted(msg.sender, gridSize);

        if (!hasEarlyAdopterNFT[msg.sender]) {
            hasEarlyAdopterNFT[msg.sender] = true;
            uint256 tokenId = _nextTokenId++;
            totalMinted++;
            _mint(msg.sender, tokenId);
            emit EarlyAdopterMinted(msg.sender, tokenId);
        }
    }

    // ────────────────────────────────────────────────────────
    //  GM — daily check-in, resets at 01:00 UTC
    // ────────────────────────────────────────────────────────
    function gm() external {
        uint256 today = _gmDay();
        require(lastGmDay[msg.sender] != today, "Already gm today");

        if (lastGmDay[msg.sender] == today - 1) {
            gmStreak[msg.sender]++;
        } else {
            gmStreak[msg.sender] = 1;
        }

        lastGmDay[msg.sender] = today;
        totalGms[msg.sender]++;

        emit GmCheckedIn(msg.sender, gmStreak[msg.sender], totalGms[msg.sender]);
    }

    // ────────────────────────────────────────────────────────
    //  View helpers
    // ────────────────────────────────────────────────────────
    function canGm(address player) external view returns (bool) {
        return lastGmDay[player] != _gmDay();
    }

    function getPlayerStats(address player) external view returns (
        uint32 games,
        uint32 streak,
        uint32 gms,
        bool hasNFT
    ) {
        games = gamesPlayed[player];
        streak = gmStreak[player];
        gms = totalGms[player];
        hasNFT = hasEarlyAdopterNFT[player];
    }

    // ────────────────────────────────────────────────────────
    //  On-chain SVG metadata for the Early Adopter NFT
    // ────────────────────────────────────────────────────────
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        string memory svg = string.concat(
            '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">',
            '<defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
            '<stop offset="0%" style="stop-color:#0052FF"/><stop offset="100%" style="stop-color:#4f46e5"/>',
            '</linearGradient></defs>',
            '<rect width="400" height="400" rx="24" fill="url(#bg)"/>',
            '<text x="200" y="140" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="72" fill="white">2048</text>',
            '<text x="200" y="190" text-anchor="middle" font-family="sans-serif" font-weight="600" font-size="20" fill="rgba(255,255,255,0.7)">on Base</text>',
            '<rect x="80" y="230" width="240" height="44" rx="22" fill="rgba(255,255,255,0.15)"/>',
            '<text x="200" y="258" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="16" fill="white">EARLY ADOPTER #',
            tokenId.toString(),
            '</text>',
            '<circle cx="200" cy="340" r="20" fill="rgba(255,255,255,0.2)"/>',
            '<text x="200" y="347" text-anchor="middle" font-family="sans-serif" font-size="20">&#9734;</text>',
            '</svg>'
        );

        string memory json = string.concat(
            '{"name":"2048 on Base: Early Adopter #',
            tokenId.toString(),
            '","description":"Awarded to the earliest players of 2048 on Base. This NFT was minted on the first game played.","image":"data:image/svg+xml;base64,',
            Base64.encode(bytes(svg)),
            '","attributes":[{"trait_type":"Type","value":"Early Adopter"},{"trait_type":"Token ID","value":"',
            tokenId.toString(),
            '"}]}'
        );

        return string.concat("data:application/json;base64,", Base64.encode(bytes(json)));
    }

    // ── Internal ────────────────────────────────────────────
    function _gmDay() internal view returns (uint256) {
        return (block.timestamp - 3600) / 86400;
    }
}
