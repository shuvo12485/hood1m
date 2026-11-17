// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Hood1MToken.sol";
import "./Hood1MBondingCurve.sol";

/**
 * @title Hood1MFactory
 * @dev Permissionless factory deploying Hood1M tokens with $1,000,000 starting FDV bonding curves.
 */
contract Hood1MFactory {
    address public feeRecipient;
    address[] public allTokens;
    mapping(address => address) public tokenToCurve;
    mapping(address => address) public curveToToken;

    event TokenCreated(
        address indexed token,
        address indexed curve,
        address indexed creator,
        string name,
        string symbol,
        string description,
        string image,
        uint256 timestamp
    );

    constructor(address feeRecipient_) {
        feeRecipient = feeRecipient_ != address(0) ? feeRecipient_ : msg.sender;
    }

    /**
     * @notice Launch a new token with its own bonding curve in a single transaction.
     */
    function createToken(
        string memory name,
        string memory symbol,
        string memory description,
        string memory image
    ) external payable returns (address tokenAddr, address curveAddr) {
        // 1. Deploy bonding curve
        Hood1MBondingCurve curve = new Hood1MBondingCurve(feeRecipient);
        curveAddr = address(curve);

        // 2. Deploy token with curve as the mint recipient
        Hood1MToken token = new Hood1MToken(
            name,
            symbol,
            description,
            image,
            msg.sender,
            curveAddr
        );
        tokenAddr = address(token);

        // 3. Link token to curve
        curve.setToken(tokenAddr);

        // 4. Record in registry
        allTokens.push(tokenAddr);
        tokenToCurve[tokenAddr] = curveAddr;
        curveToToken[curveAddr] = tokenAddr;

        emit TokenCreated(
            tokenAddr,
            curveAddr,
            msg.sender,
            name,
            symbol,
            description,
            image,
            block.timestamp
        );

        // 5. If creator sent ETH with launch, buy initial tokens for creator
        if (msg.value > 0) {
            curve.buy{value: msg.value}(0);
            uint256 boughtTokens = token.balanceOf(address(this));
            if (boughtTokens > 0) {
                token.transfer(msg.sender, boughtTokens);
            }
        }

        return (tokenAddr, curveAddr);
    }

    function totalTokens() external view returns (uint256) {
        return allTokens.length;
    }

    function getAllTokens() external view returns (address[] memory) {
        return allTokens;
    }
}
