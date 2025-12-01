// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * @title NYAXTimelockController
 * @notice Thin wrapper around OpenZeppelin's TimelockController that exposes
 *         helper utilities tailored for the NYALTX governance stack.
 */
contract NYAXTimelockController is TimelockController {
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) {
        require(admin != address(0), "admin zero");
    }

    receive() external payable override {}
}
