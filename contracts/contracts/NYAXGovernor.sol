// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

/**
 * @title NYAXGovernorWithTracking
 * @notice Governor extended to store and return full proposal metadata + vote counts.
 *
 * NOTE: We store proposal payloads (targets/values/calldatas/descriptionHash + proposer)
 * at propose() time in contract storage so callers can read full details on-chain.
 */
contract NYAXGovernor is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    // ---------------------------------------------------------
    // Proposal tracking storage
    // ---------------------------------------------------------
    uint256[] private _allProposalIds;

    struct StoredProposal {
        address proposer;
        address[] targets;
        uint256[] values;
        bytes[] calldatas;
        bytes32 descriptionHash;
    }

    mapping(uint256 => StoredProposal) private _storedProposals;

    // ---------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------
    constructor(
        IVotes token,
        TimelockController timelock,
        uint256 votingDelayBlocks,
        uint256 votingPeriodBlocks,
        uint256 proposalThresholdVotes,
        uint256 quorumNumeratorValue
    )
        Governor("NYAXGovernorWithTracking")
        GovernorSettings(
            uint48(votingDelayBlocks),
            uint32(votingPeriodBlocks),
            proposalThresholdVotes
        )
        GovernorVotes(token)
        GovernorVotesQuorumFraction(quorumNumeratorValue)
        GovernorTimelockControl(timelock)
    {}

    // ---------------------------------------------------------
    // Override propose to capture and store full proposal payload
    // ---------------------------------------------------------
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override(Governor) returns (uint256)
    {
        // call OZ propose which will create the proposal and return proposalId
        uint256 proposalId = super.propose(targets, values, calldatas, description);

        // store payload in our mapping for on-chain retrieval
        bytes32 descriptionHash = keccak256(bytes(description));

        // create storage entry
        StoredProposal storage sp = _storedProposals[proposalId];

        sp.proposer = _msgSender();

        // copy arrays into storage
        // because we need dynamic arrays in struct, do manual copy
        for (uint256 i = 0; i < targets.length; i++) {
            sp.targets.push(targets[i]);
        }

        for (uint256 i = 0; i < values.length; i++) {
            sp.values.push(values[i]);
        }

        for (uint256 i = 0; i < calldatas.length; i++) {
            sp.calldatas.push(calldatas[i]);
        }

        sp.descriptionHash = descriptionHash;

        // track proposal id
        _allProposalIds.push(proposalId);

        return proposalId;
    }

    // ---------------------------------------------------------
    // View helpers
    // ---------------------------------------------------------

    /// @notice Get all proposal ids tracked by the contract
    function getAllProposalIds() external view returns (uint256[] memory) {
        return _allProposalIds;
    }

    /// @notice Compact proposal data including votes & state
    /// @dev returns basic metadata + votes. state is returned as uint8 (enum ordinal).
    function getProposalData(uint256 proposalId)
        external
        view
        returns (
            address proposer,
            uint256 snapshotBlock,
            uint256 deadlineBlock,
            uint256 forVotes,
            uint256 againstVotes,
            uint256 abstainVotes,
            uint8 stateOrdinal
        )
    {
        StoredProposal storage sp = _storedProposals[proposalId];
        proposer = sp.proposer;

        // OZ Governor helpers
        snapshotBlock = proposalSnapshot(proposalId);
        deadlineBlock = proposalDeadline(proposalId);

        (againstVotes, forVotes, abstainVotes) = proposalVotes(proposalId);

        stateOrdinal = uint8(state(proposalId));
    }

    /// @notice Return full proposal details: payload (targets/values/calldatas/descriptionHash),
    /// snapshot/deadline, votes, and state.
    function getFullProposalDetails(uint256 proposalId)
        external
        view
        returns (
            address proposer,
            address[] memory targets,
            uint256[] memory values,
            bytes[] memory calldatas,
            bytes32 descriptionHash,
            uint256 snapshotBlock,
            uint256 deadlineBlock,
            uint256 forVotes,
            uint256 againstVotes,
            uint256 abstainVotes,
            uint8 stateOrdinal
        )
    {
        StoredProposal storage sp = _storedProposals[proposalId];

        proposer = sp.proposer;

        // return copies of dynamic arrays from storage
        uint256 tlen = sp.targets.length;
        targets = new address[](tlen);
        for (uint256 i = 0; i < tlen; i++) {
            targets[i] = sp.targets[i];
        }

        uint256 vlen = sp.values.length;
        values = new uint256[](vlen);
        for (uint256 i = 0; i < vlen; i++) {
            values[i] = sp.values[i];
        }

        uint256 clen = sp.calldatas.length;
        calldatas = new bytes[](clen);
        for (uint256 i = 0; i < clen; i++) {
            calldatas[i] = sp.calldatas[i];
        }

        descriptionHash = sp.descriptionHash;

        // OZ Governor helpers
        snapshotBlock = proposalSnapshot(proposalId);
        deadlineBlock = proposalDeadline(proposalId);

        (againstVotes, forVotes, abstainVotes) = proposalVotes(proposalId);

        stateOrdinal = uint8(state(proposalId));
    }

    // Optional helper to get descriptionHash only (if you want)
    function getProposalDescriptionHash(uint256 proposalId) external view returns (bytes32) {
        return _storedProposals[proposalId].descriptionHash;
    }

    // Optional helper to get raw payload arrays only
    function getProposalPayload(uint256 proposalId)
        external
        view
        returns (address[] memory targets, uint256[] memory values, bytes[] memory calldatas)
    {
        StoredProposal storage sp = _storedProposals[proposalId];

        uint256 tlen = sp.targets.length;
        targets = new address[](tlen);
        for (uint256 i = 0; i < tlen; i++) targets[i] = sp.targets[i];

        uint256 vlen = sp.values.length;
        values = new uint256[](vlen);
        for (uint256 i = 0; i < vlen; i++) values[i] = sp.values[i];

        uint256 clen = sp.calldatas.length;
        calldatas = new bytes[](clen);
        for (uint256 i = 0; i < clen; i++) calldatas[i] = sp.calldatas[i];
    }

    // ---------------------------------------------------------
    // Standard OZ overrides (timelock related)
    // ---------------------------------------------------------
    function votingDelay() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }

    function votingPeriod() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }

    function proposalThreshold() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.proposalThreshold();
    }

    function state(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function _queueOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint48) {
        return super._queueOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executeOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._executeOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _executor() internal view override(Governor, GovernorTimelockControl) returns (address) {
        return super._executor();
    }

    function proposalNeedsQueuing(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.proposalNeedsQueuing(proposalId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(Governor) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
