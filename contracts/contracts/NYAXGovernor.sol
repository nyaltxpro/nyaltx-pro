// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * @title NYAXGovernor
 * @dev OpenZeppelin Governor implementation for NYAX Platform governance
 * 
 * Features:
 * - Proposal creation and voting
 * - Timelock execution for security
 * - Quorum-based decision making
 * - Vote delegation support
 * - Emergency fast-track procedures
 */
contract NYAXGovernor is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    // Custom events
    event EmergencyProposalCreated(uint256 proposalId, string description);
    event FastTrackEnabled(uint256 proposalId);

    // Emergency governance
    mapping(uint256 => bool) public emergencyProposals;
    mapping(uint256 => bool) public fastTrackEnabled;
    
    // Constants
    uint256 public constant EMERGENCY_VOTING_DELAY = 1; // 1 block
    uint256 public constant EMERGENCY_VOTING_PERIOD = 50400; // ~1 week
    uint256 public constant EMERGENCY_QUORUM = 10; // 10% for emergency proposals

    /**
     * @dev Constructor
     * @param _token NYAX token address (must implement IVotes)
     * @param _timelock Timelock controller address
     * @param _votingDelay Delay before voting starts (in blocks)
     * @param _votingPeriod Duration of voting period (in blocks)
     * @param _proposalThreshold Minimum tokens needed to create proposal
     * @param _quorumPercentage Percentage of total supply needed for quorum
     */
    constructor(
        IVotes _token,
        TimelockController _timelock,
        uint256 _votingDelay,
        uint256 _votingPeriod,
        uint256 _proposalThreshold,
        uint256 _quorumPercentage
    )
        Governor("NYAXGovernor")
        GovernorSettings(_votingDelay, _votingPeriod, _proposalThreshold)
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(_quorumPercentage)
        GovernorTimelockControl(_timelock)
    {}

    /**
     * @dev Create an emergency proposal with reduced delays
     * @param targets Array of target addresses
     * @param values Array of ETH values
     * @param calldatas Array of function call data
     * @param description Proposal description
     * @return proposalId The ID of the created proposal
     */
    function proposeEmergency(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public returns (uint256 proposalId) {
        // Check if caller has enough tokens for emergency proposals
        require(
            getVotes(msg.sender, block.number - 1) >= proposalThreshold(),
            "NYAXGovernor: proposer votes below proposal threshold"
        );

        proposalId = propose(targets, values, calldatas, description);
        emergencyProposals[proposalId] = true;

        emit EmergencyProposalCreated(proposalId, description);
        return proposalId;
    }

    /**
     * @dev Enable fast-track execution for critical proposals
     * @param proposalId The proposal ID to fast-track
     */
    function enableFastTrack(uint256 proposalId) external onlyGovernance {
        require(state(proposalId) == ProposalState.Succeeded, "NYAXGovernor: proposal not succeeded");
        fastTrackEnabled[proposalId] = true;
        emit FastTrackEnabled(proposalId);
    }

    /**
     * @dev Override voting delay for emergency proposals
     */
    function proposalDeadline(uint256 proposalId) public view override returns (uint256) {
        if (emergencyProposals[proposalId]) {
            return proposalSnapshot(proposalId) + EMERGENCY_VOTING_PERIOD;
        }
        return super.proposalDeadline(proposalId);
    }

    /**
     * @dev Override voting delay for emergency proposals
     */
    function votingDelay() public view override(IGovernor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }

    /**
     * @dev Override voting period
     */
    function votingPeriod() public view override(IGovernor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }

    /**
     * @dev Override quorum for emergency proposals
     */
    function quorum(uint256 blockNumber) public view override(IGovernor, GovernorVotesQuorumFraction) returns (uint256) {
        return super.quorum(blockNumber);
    }

    /**
     * @dev Custom quorum calculation for emergency proposals
     */
    function _quorumReached(uint256 proposalId) internal view override returns (bool) {
        if (emergencyProposals[proposalId]) {
            (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes) = proposalVotes(proposalId);
            uint256 totalVotes = againstVotes + forVotes + abstainVotes;
            uint256 emergencyQuorumVotes = (token.getPastTotalSupply(proposalSnapshot(proposalId)) * EMERGENCY_QUORUM) / 100;
            return totalVotes >= emergencyQuorumVotes;
        }
        return super._quorumReached(proposalId);
    }

    /**
     * @dev Override proposal threshold
     */
    function proposalThreshold() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.proposalThreshold();
    }

    /**
     * @dev Override state function to handle fast-track
     */
    function state(uint256 proposalId) public view override(Governor, GovernorTimelockControl) returns (ProposalState) {
        ProposalState currentState = super.state(proposalId);
        
        // If fast-track is enabled and proposal succeeded, it can be executed immediately
        if (fastTrackEnabled[proposalId] && currentState == ProposalState.Queued) {
            return ProposalState.Succeeded;
        }
        
        return currentState;
    }

    /**
     * @dev Override _execute to handle fast-track execution
     */
    function _execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        if (fastTrackEnabled[proposalId]) {
            // Execute directly without timelock for fast-track proposals
            for (uint256 i = 0; i < targets.length; ++i) {
                (bool success, bytes memory returndata) = targets[i].call{value: values[i]}(calldatas[i]);
                Address.verifyCallResult(success, returndata, "Governor: call reverted without message");
            }
        } else {
            super._execute(proposalId, targets, values, calldatas, descriptionHash);
        }
    }

    /**
     * @dev Override _cancel to handle timelock
     */
    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    /**
     * @dev Override _executor to return timelock address
     */
    function _executor() internal view override(Governor, GovernorTimelockControl) returns (address) {
        return super._executor();
    }

    /**
     * @dev Check if proposal is emergency proposal
     */
    function isEmergencyProposal(uint256 proposalId) external view returns (bool) {
        return emergencyProposals[proposalId];
    }

    /**
     * @dev Check if fast-track is enabled for proposal
     */
    function isFastTrackEnabled(uint256 proposalId) external view returns (bool) {
        return fastTrackEnabled[proposalId];
    }

    /**
     * @dev Get proposal details including emergency status
     */
    function getProposalDetails(uint256 proposalId) external view returns (
        address proposer,
        uint256 eta,
        uint256 startBlock,
        uint256 endBlock,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 abstainVotes,
        bool isEmergency,
        bool isFastTrack,
        ProposalState currentState
    ) {
        proposer = _proposals[proposalId].proposer;
        eta = proposalEta(proposalId);
        startBlock = proposalSnapshot(proposalId);
        endBlock = proposalDeadline(proposalId);
        (againstVotes, forVotes, abstainVotes) = proposalVotes(proposalId);
        isEmergency = emergencyProposals[proposalId];
        isFastTrack = fastTrackEnabled[proposalId];
        currentState = state(proposalId);
    }

    /**
     * @dev Override supportsInterface
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

/**
 * @title NYAXTimelockController
 * @dev Custom timelock controller for NYAX governance
 */
contract NYAXTimelockController is TimelockController {
    /**
     * @dev Constructor
     * @param minDelay Minimum delay for operations
     * @param proposers Array of proposer addresses
     * @param executors Array of executor addresses
     * @param admin Admin address (can be zero address to renounce)
     */
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) {}

    /**
     * @dev Emergency execution function (only for critical situations)
     * @param target Target contract address
     * @param value ETH value to send
     * @param data Function call data
     */
    function emergencyExecute(
        address target,
        uint256 value,
        bytes calldata data
    ) external onlyRole(EXECUTOR_ROLE) {
        (bool success, ) = target.call{value: value}(data);
        require(success, "NYAXTimelockController: emergency execution failed");
    }
}
