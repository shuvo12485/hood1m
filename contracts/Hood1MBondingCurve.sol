// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Hood1MBondingCurve
 * @dev Dynamic bonding curve calibrated for $1,000,000 starting FDV and 35 ETH Uniswap v3 graduation.
 */
contract Hood1MBondingCurve is ReentrancyGuard, Ownable {
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;
    uint256 public constant CURVE_SUPPLY = 800_000_000 * 10**18;
    uint256 public constant GRADUATION_ETH = 35 ether; // 35 ETH reaches graduation milestone
    uint256 public constant FEE_BPS = 100; // 1% liquidity fee (100 basis points)

    IERC20 public token;
    uint256 public ethReserve;
    uint256 public tokensSold;
    bool public graduated;
    address public feeRecipient;

    // Events
    event Trade(
        address indexed trader,
        bool isBuy,
        uint256 ethAmount,
        uint256 tokenAmount,
        uint256 currentEthReserve,
        uint256 currentTokensSold,
        uint256 timestamp
    );
    event Graduated(address indexed token, uint256 ethReserve, uint256 timestamp);

    constructor(address feeRecipient_) Ownable(msg.sender) {
        feeRecipient = feeRecipient_;
    }

    function setToken(address tokenAddress) external onlyOwner {
        require(address(token) == address(0), "Token already configured");
        token = IERC20(tokenAddress);
    }

    /**
     * @notice Calculate token output for a given ETH buy amount.
     * Starts at $0.001 floor ($1,000,000 FDV) and scales upwards.
     */
    function calculateBuyReturn(uint256 ethIn) public view returns (uint256) {
        if (ethIn == 0 || graduated) return 0;
        uint256 tokensAvailable = CURVE_SUPPLY - tokensSold;
        if (tokensAvailable == 0) return 0;

        // Virtual baseline liquidity for $1M starting floor
        uint256 virtualEth = 10 ether;
        uint256 k = (virtualEth + ethReserve) * (CURVE_SUPPLY - tokensSold + 100_000_000 * 10**18);
        uint256 newEthReserve = virtualEth + ethReserve + ethIn;
        uint256 newRemaining = k / newEthReserve;

        uint256 tokensOut = (CURVE_SUPPLY - tokensSold + 100_000_000 * 10**18) - newRemaining;
        if (tokensOut > tokensAvailable) {
            tokensOut = tokensAvailable;
        }
        return tokensOut;
    }

    /**
     * @notice Calculate ETH output for selling tokens back into the curve.
     */
    function calculateSellReturn(uint256 tokensIn) public view returns (uint256) {
        if (tokensIn == 0 || tokensSold == 0 || ethReserve == 0 || graduated) return 0;
        uint256 virtualEth = 10 ether;
        uint256 k = (virtualEth + ethReserve) * (CURVE_SUPPLY - tokensSold + 100_000_000 * 10**18);
        uint256 newRemaining = (CURVE_SUPPLY - tokensSold + 100_000_000 * 10**18) + tokensIn;
        uint256 newEth = k / newRemaining;

        if (newEth >= (virtualEth + ethReserve)) return 0;
        uint256 ethOut = (virtualEth + ethReserve) - newEth;
        if (ethOut > ethReserve) {
            ethOut = ethReserve;
        }
        return ethOut;
    }

    /**
     * @notice Buy tokens with ETH along the bonding curve.
     */
    function buy(uint256 minTokensOut) external payable nonReentrant {
        require(!graduated, "Token graduated to Uniswap v3");
        require(msg.value > 0, "Must send ETH");

        uint256 fee = (msg.value * FEE_BPS) / 10000;
        uint256 ethForTokens = msg.value - fee;

        uint256 tokensOut = calculateBuyReturn(ethForTokens);
        require(tokensOut >= minTokensOut, "Slippage tolerance exceeded");
        require(tokensOut > 0, "Zero tokens out");

        ethReserve += ethForTokens;
        tokensSold += tokensOut;

        // Transfer fee to protocol recipient
        if (fee > 0 && feeRecipient != address(0)) {
            (bool feeSuccess, ) = feeRecipient.call{value: fee}("");
            require(feeSuccess, "Fee transfer failed");
        }

        // Transfer tokens to buyer
        require(token.transfer(msg.sender, tokensOut), "Token transfer failed");

        emit Trade(
            msg.sender,
            true,
            msg.value,
            tokensOut,
            ethReserve,
            tokensSold,
            block.timestamp
        );

        // Check for 35 ETH graduation milestone
        if (ethReserve >= GRADUATION_ETH || tokensSold >= CURVE_SUPPLY) {
            graduated = true;
            emit Graduated(address(token), ethReserve, block.timestamp);
        }
    }

    /**
     * @notice Sell tokens back to the bonding curve for ETH.
     */
    function sell(uint256 tokenAmount, uint256 minEthOut) external nonReentrant {
        require(!graduated, "Token graduated to Uniswap v3");
        require(tokenAmount > 0, "Must sell > 0 tokens");

        uint256 ethOut = calculateSellReturn(tokenAmount);
        require(ethOut >= minEthOut, "Slippage tolerance exceeded");
        require(ethOut > 0 && ethOut <= ethReserve, "Invalid ETH output");

        uint256 fee = (ethOut * FEE_BPS) / 10000;
        uint256 netEthOut = ethOut - fee;

        ethReserve -= ethOut;
        tokensSold -= tokenAmount;

        // Pull tokens from seller
        require(token.transferFrom(msg.sender, address(this), tokenAmount), "Token pull failed");

        // Send fee
        if (fee > 0 && feeRecipient != address(0)) {
            (bool feeSuccess, ) = feeRecipient.call{value: fee}("");
            require(feeSuccess, "Fee transfer failed");
        }

        // Send ETH to seller
        (bool ethSuccess, ) = msg.sender.call{value: netEthOut}("");
        require(ethSuccess, "ETH transfer failed");

        emit Trade(
            msg.sender,
            false,
            netEthOut,
            tokenAmount,
            ethReserve,
            tokensSold,
            block.timestamp
        );
    }

    receive() external payable {
        revert("Use buy() to purchase tokens");
    }
}
