// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Hood1MToken
 * @dev Fixed 1B supply ERC-20 token launched on Hood1M ($1,000,000 starting FDV floor).
 */
contract Hood1MToken is ERC20, Ownable {
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;
    uint256 public constant CURVE_SUPPLY = 800_000_000 * 10**18; // 80% sold along bonding curve
    uint256 public constant MIGRATION_SUPPLY = 200_000_000 * 10**18; // 20% reserved for Uniswap v3 LP

    string public tokenDescription;
    string public tokenImage;
    address public immutable creator;
    address public bondingCurve;

    event TokenLaunched(address indexed token, address indexed curve, address indexed creator);

    constructor(
        string memory name_,
        string memory symbol_,
        string memory description_,
        string memory image_,
        address creator_,
        address bondingCurve_
    ) ERC20(name_, symbol_) Ownable(msg.sender) {
        tokenDescription = description_;
        tokenImage = image_;
        creator = creator_;
        bondingCurve = bondingCurve_;

        // Mint 80% to bonding curve for trading
        _mint(bondingCurve_, CURVE_SUPPLY);
        // Mint 20% to bonding curve escrow for Uniswap v3 LP migration
        _mint(bondingCurve_, MIGRATION_SUPPLY);

        emit TokenLaunched(address(this), bondingCurve_, creator_);
    }
}
