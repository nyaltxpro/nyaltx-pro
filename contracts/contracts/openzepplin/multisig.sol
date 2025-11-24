// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.5.0
pragma solidity ^0.8.27;

import {Account} from "@openzeppelin/contracts/account/Account.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import {ERC721Holder} from "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import {ERC7739} from "@openzeppelin/contracts/utils/cryptography/signers/draft-ERC7739.sol";
import {ERC7821} from "@openzeppelin/contracts/account/extensions/draft-ERC7821.sol";
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {MultiSignerERC7913Upgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/signers/MultiSignerERC7913Upgradeable.sol";

contract MyAccount is Initializable, Account, EIP712, ERC7739, MultiSignerERC7913Upgradeable, ERC7821, ERC721Holder, ERC1155Holder {
    /// @custom:oz-upgrades-unsafe-allow-reachable constructor
    constructor() EIP712("MyAccount", "1") {
        _disableInitializers();
    }

    function initialize(bytes[] memory signers, uint64 threshold)
        public
        initializer
    {
        __MultiSignerERC7913_init(signers, threshold);
    }

    function addSigners(bytes[] memory signers) public onlyEntryPointOrSelf {
        _addSigners(signers);
    }

    function removeSigners(bytes[] memory signers) public onlyEntryPointOrSelf {
        _removeSigners(signers);
    }

    function setThreshold(uint64 threshold) public onlyEntryPointOrSelf {
        _setThreshold(threshold);
    }

    function _erc7821AuthorizedExecutor(address caller, bytes32 mode, bytes calldata executionData)
        internal
        view
        override
        returns (bool)
    {
        return caller == address(entryPoint()) || super._erc7821AuthorizedExecutor(caller, mode, executionData);
    }
}
