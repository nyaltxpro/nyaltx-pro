import { ContractAddresses } from './types';

// Contract addresses - Update these with deployed contract addresses
export const CONTRACT_ADDRESSES: ContractAddresses = {
  nyaxToken: process.env.NEXT_NYAX_TOKEN_ADDRESS || '0xa879282ad7097f2503A4D128b807546e79A88F2f',
  legacyToken: process.env.NEXT_PUBLIC_LEGACY_TOKEN_ADDRESS || '0xe75B4240053FC34c5c5751Ab0282190149dfC4Be',
  legacyMigrationVault: process.env.NEXT_PUBLIC_LEGACY_MIGRATION_VAULT_ADDRESS || '0x0b8963BaD0B5331852D5FA5d15661317Cb96a40B',
  staking: process.env.NEXT_PUBLIC_STAKING_ADDRESS || '0xA6518003fb0F4062e370C21b5f5096F9d88bcDfE',
  folderRegistry: process.env.NEXT_PUBLIC_FOLDER_REGISTRY_ADDRESS || '0x9b8209dA26ab232C1F6Caa30Ddcf3B6fA0394C34',
  nyaxGovernor: process.env.NEXT_PUBLIC_NYAX_GOVERNOR_ADDRESS || '0xD69743C1b6Ee9Ab46922993b282D3BA7dd093086',
  timelock: process.env.NEXT_PUBLIC_TIMELOCK_ADDRESS || '0xa17B822F9D0A26C20BDe453F0e566a2D2787E851',
  treasury: process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '0x7ab3eBb87afa9A921d0770Fa304F20Fc8D2a4763',
  multisig: process.env.NEXT_PUBLIC_MULTISIG_ADDRESS || '0x5cD8aD5E36324C386b6F62Ce2374aa3F3f8Ae0aD',
  vestingFactory: process.env.NEXT_PUBLIC_VESTING_FACTORY_ADDRESS || '',
  treasuryBridge: process.env.NEXT_PUBLIC_TREASURY_BRIDGE_ADDRESS || '0x7ab3eBb87afa9A921d0770Fa304F20Fc8D2a4763',
};

// Contract ABIs - Import from generated files or define here
export const CONTRACT_ABIS = {
  nyaxToken: [
    // ERC20 + ERC20Votes functions
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function transferFrom(address from, address to, uint256 amount) returns (bool)',
    
    // ERC20Votes functions
    'function getVotes(address account) view returns (uint256)',
    'function getPastVotes(address account, uint256 blockNumber) view returns (uint256)',
    'function getPastTotalSupply(uint256 blockNumber) view returns (uint256)',
    'function delegates(address account) view returns (address)',
    'function delegate(address delegatee)',
    'function delegateBySig(address delegatee, uint256 nonce, uint256 expiry, uint8 v, bytes32 r, bytes32 s)',
    
    // NYAX specific functions
    'function MAX_SUPPLY() view returns (uint256)',
    'function treasury() view returns (address)',
    'function transfersEnabled() view returns (bool)',
    'function blacklisted(address) view returns (bool)',
    'function remainingMintableSupply() view returns (uint256)',
    'function mint(address to, uint256 amount)',
    'function burn(address from, uint256 amount)',
    'function burnSelf(uint256 amount)',
    'function setTreasury(address _treasury)',
    'function setTransfersEnabled(bool enabled)',
    'function setBlacklisted(address account, bool _blacklisted)',
    
    // Events
    'event Transfer(address indexed from, address indexed to, uint256 value)',
    'event Approval(address indexed owner, address indexed spender, uint256 value)',
    'event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate)',
    'event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance)',
    'event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury)',
    'event TransfersToggled(bool enabled)',
    'event AddressBlacklisted(address indexed account, bool blacklisted)',
    'event TokensMinted(address indexed to, uint256 amount)',
    'event TokensBurned(address indexed from, uint256 amount)',
  ],
  
  nyaxGovernor: [
    // Governor functions
    'function name() view returns (string)',
    'function version() view returns (string)',
    'function COUNTING_MODE() view returns (string)',
    'function hashProposal(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) pure returns (uint256)',
    'function state(uint256 proposalId) view returns (uint8)',
    'function proposalSnapshot(uint256 proposalId) view returns (uint256)',
    'function proposalDeadline(uint256 proposalId) view returns (uint256)',
    'function proposalThreshold() view returns (uint256)',
    'function getVotes(address account, uint256 blockNumber) view returns (uint256)',
    'function getVotesWithParams(address account, uint256 blockNumber, bytes params) view returns (uint256)',
    'function castVote(uint256 proposalId, uint8 support) returns (uint256)',
    'function castVoteWithReason(uint256 proposalId, uint8 support, string reason) returns (uint256)',
    'function castVoteBySig(uint256 proposalId, uint8 support, uint256 nonce, uint256 expiry, uint8 v, bytes32 r, bytes32 s) returns (uint256)',
    'function propose(address[] targets, uint256[] values, bytes[] calldatas, string description) returns (uint256)',
    'function execute(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) payable returns (uint256)',
    'function cancel(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) returns (uint256)',
    'function proposalVotes(uint256 proposalId) view returns (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes)',
    'function hasVoted(uint256 proposalId, address account) view returns (bool)',
    
    // NYAX Governor specific functions
    'function proposeEmergency(address[] targets, uint256[] values, bytes[] calldatas, string description) returns (uint256)',
    'function enableFastTrack(uint256 proposalId)',
    'function isEmergencyProposal(uint256 proposalId) view returns (bool)',
    'function isFastTrackEnabled(uint256 proposalId) view returns (bool)',
    'function getProposalDetails(uint256 proposalId) view returns (address proposer, uint256 eta, uint256 startBlock, uint256 endBlock, uint256 forVotes, uint256 againstVotes, uint256 abstainVotes, bool isEmergency, bool isFastTrack, uint8 currentState)',
    'function votingDelay() view returns (uint256)',
    'function votingPeriod() view returns (uint256)',
    'function quorum(uint256 blockNumber) view returns (uint256)',
    
    // Events
    'event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 startBlock, uint256 endBlock, string description)',
    'event ProposalCanceled(uint256 proposalId)',
    'event ProposalExecuted(uint256 proposalId)',
    'event VoteCast(address indexed voter, uint256 proposalId, uint8 support, uint256 weight, string reason)',
    'event EmergencyProposalCreated(uint256 proposalId, string description)',
    'event FastTrackEnabled(uint256 proposalId)',
  ],
  
  treasury: [
    // Treasury functions
    'function nyax() view returns (address)',
    'function multisig() view returns (address)',
    'function categoryWallet(string) view returns (address)',
    'function categoryAllocation(string) view returns (uint256)',
    'function categoryDistributed(string) view returns (uint256)',
    'function categoryExists(string) view returns (bool)',
    'function categories(uint256) view returns (string)',
    'function BASIS_POINTS() view returns (uint256)',
    'function MULTISIG_THRESHOLD() view returns (uint256)',
    
    'function setCategoryWallet(string category, address wallet, uint256 allocation)',
    'function removeCategory(string category)',
    'function transferTo(address to, uint256 amount, string reason, string category)',
    'function multisigTransfer(address to, uint256 amount, string reason, string category)',
    'function mintToTreasury(uint256 amount, string reason)',
    'function mintTo(address to, uint256 amount, string reason, string category)',
    'function burnFromTreasury(uint256 amount, string reason)',
    'function setMultisig(address _multisig)',
    
    'function getCategoryInfo(string category) view returns (address wallet, uint256 allocation, uint256 distributed, uint256 remaining)',
    'function getCategories() view returns (string[])',
    'function getTreasuryBalance() view returns (uint256)',
    'function getTotalAllocation() view returns (uint256)',
    'function requiresMultisig(uint256 amount) pure returns (bool)',
    
    // Events
    'event CategorySet(string indexed category, address indexed wallet, uint256 allocation)',
    'event CategoryRemoved(string indexed category)',
    'event TransferExecuted(address indexed to, uint256 amount, string reason, string category)',
    'event MultisigTransferExecuted(address indexed to, uint256 amount, string reason, string category)',
    'event TokensMinted(address indexed to, uint256 amount, string reason)',
    'event TokensBurned(uint256 amount, string reason)',
  ],
  
  multisig: [
    // MultiSig functions
    'function threshold() view returns (uint256)',
    'function owners(uint256) view returns (address)',
    'function isOwner(address) view returns (bool)',
    'function transactionCount() view returns (uint256)',
    'function transactions(uint256) view returns (address to, uint256 value, bytes data, bool executed, uint256 confirmations)',
    
    'function submitTransaction(address to, uint256 value, bytes data) returns (uint256)',
    'function confirmTransaction(uint256 txIndex)',
    'function revokeConfirmation(uint256 txIndex)',
    'function executeTransaction(uint256 txIndex)',
    'function getTransaction(uint256 txIndex) view returns (address to, uint256 value, bytes data, bool executed, uint256 confirmations)',
    'function isConfirmed(uint256 txIndex, address owner) view returns (bool)',
    'function getOwners() view returns (address[])',
    'function getOwnerCount() view returns (uint256)',
    'function getTransactionCount() view returns (uint256)',
    
    // Events
    'event TransactionSubmitted(uint256 indexed txIndex, address indexed to, uint256 value, bytes data)',
    'event TransactionConfirmed(address indexed owner, uint256 indexed txIndex)',
    'event TransactionRevoked(address indexed owner, uint256 indexed txIndex)',
    'event TransactionExecuted(uint256 indexed txIndex)',
  ],
  
  vestingFactory: [
    // VestingFactory functions
    'function nyaxToken() view returns (address)',
    'function categoryVestingContracts(string, uint256) view returns (address)',
    'function isVestingContract(address) view returns (bool)',
    'function contractCategory(address) view returns (string)',
    'function allVestingContracts(uint256) view returns (address)',
    'function categories(uint256) view returns (string)',
    'function categoryExists(string) view returns (bool)',
    
    'function createVestingContract(string category) returns (address)',
    'function getCategoryContracts(string category) view returns (address[])',
    'function getAllContracts() view returns (address[])',
    'function getCategories() view returns (string[])',
    'function getCategoryContractCount(string category) view returns (uint256)',
    'function getTotalContractCount() view returns (uint256)',
    'function isFactoryContract(address contractAddress) view returns (bool)',
    'function getContractCategory(address contractAddress) view returns (string)',
    
    // Events
    'event VestingContractCreated(address indexed vestingContract, string indexed category, address indexed creator)',
    'event CategoryAdded(string indexed category)',
  ],
  
  vestingWallet: [
    // VestingWallet functions
    'function token() view returns (address)',
    'function BASIS_POINTS() view returns (uint256)',
    'function vestingSchedules(bytes32) view returns (address beneficiary, uint256 totalAmount, uint256 start, uint256 cliff, uint256 duration, uint256 released, bool revoked, bool revocable, string category)',
    'function beneficiarySchedules(address, uint256) view returns (bytes32)',
    'function allScheduleIds(uint256) view returns (bytes32)',
    'function paused() view returns (bool)',
    
    'function createVestingSchedule(address beneficiary, uint256 totalAmount, uint256 start, uint256 cliffDuration, uint256 duration, bool revocable, string category) returns (bytes32)',
    'function addMilestone(bytes32 scheduleId, uint256 timestamp, uint256 percentage, string description)',
    'function vestedAmount(bytes32 scheduleId, uint256 timestamp) view returns (uint256)',
    'function getMilestoneVested(bytes32 scheduleId, uint256 timestamp) view returns (uint256)',
    'function release(bytes32 scheduleId)',
    'function revoke(bytes32 scheduleId)',
    'function releasableAmount(bytes32 scheduleId) view returns (uint256)',
    'function getBeneficiarySchedules(address beneficiary) view returns (bytes32[])',
    'function getAllSchedules() view returns (bytes32[])',
    'function getMilestones(bytes32 scheduleId) view returns (tuple(uint256 timestamp, uint256 percentage, bool released, string description)[])',
    'function togglePause()',
    'function getContractBalance() view returns (uint256)',
    
    // Events
    'event VestingScheduleCreated(bytes32 indexed scheduleId, address indexed beneficiary, uint256 totalAmount, uint256 start, uint256 cliff, uint256 duration, string category)',
    'event TokensReleased(bytes32 indexed scheduleId, address indexed beneficiary, uint256 amount)',
    'event VestingRevoked(bytes32 indexed scheduleId, address indexed beneficiary, uint256 unreleased)',
    'event MilestoneAdded(bytes32 indexed scheduleId, uint256 timestamp, uint256 percentage, string description)',
    'event MilestoneReleased(bytes32 indexed scheduleId, uint256 amount, string description)',
  ],

  legacyToken: [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function balanceOf(address) view returns (uint256)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function approve(address spender, uint256 amount) returns (bool)'
  ],

  legacyMigrationVault: [
    'function legacyToken() view returns (address)',
    'function governanceToken() view returns (address)',
    'function conversionRatio() view returns (uint256)',
    'function depositsEnabled() view returns (bool)',
    'function depositLegacy(uint256 amount, address beneficiary) returns (uint256)'
  ],

  folderRegistry: [
    'function folderCount() view returns (uint256)',
    'function folders(uint256 folderId) view returns (string name, uint32 defaultPermissions, tuple(uint64 cliff, uint64 duration, bool revocable) template, uint256 totalAllocated, bool exists)',
    'function permissionsOf(uint256 folderId, address account) view returns (uint32)',
    'function unlockedTokens(uint256 folderId, address account, uint64 timestamp) view returns (uint256)',
    'function folderMembers(uint256 folderId) view returns (address[])',
    'function createFolder(string name, uint32 permissions, tuple(uint64 cliff, uint64 duration, bool revocable) template) returns (uint256)',
    'function updateFolder(uint256 folderId, uint32 permissions, tuple(uint64 cliff, uint64 duration, bool revocable) template)',
    'function setAllocation(uint256 folderId, address account, uint256 amount, tuple(uint64 start, uint64 cliff, uint64 duration, bool revocable, bool revoked, uint64 revokedAt) schedule, uint32 permissions)',
    'function claim(uint256 folderId, address account, uint256 amount)',
    'function revoke(uint256 folderId, address account)'
  ],

  staking: [
    'function MIN_LOCK() view returns (uint64)',
    'function MAX_LOCK() view returns (uint64)',
    'function totalStaked() view returns (uint256)',
    'function totalSupply() view returns (uint256)',
    'function emergencyUnlock() view returns (bool)',
    'function stake(uint256 amount, uint64 lockDuration, address delegatee) returns (uint256 stakeId, uint256 votingPower)',
    'function extendLock(uint256 stakeId, uint64 additionalDuration)',
    'function unstake(uint256 stakeId, address recipient)',
    'function stakeCount(address account) view returns (uint256)',
    'function stakeInfo(address account, uint256 stakeId) view returns (uint128 amount, uint128 votingPower, uint64 unlockTime, bool withdrawn)'
  ],

  treasuryBridge: [
    'function TREASURY_CONTROLLER_ROLE() view returns (bytes32)',
    'function treasuryMultisig() view returns (address)',
    'function timelockController() view returns (address)',
    'function governor() view returns (address)',
    'function transferTreasuryToken(address token, address to, uint256 amount, bytes32 referenceId)',
    'function transferTreasuryETH(address to, uint256 amount, bytes32 referenceId)'
  ],
};

// Network configuration
export const NETWORK_CONFIG = {
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '1'),
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || '',
  blockExplorer: process.env.NEXT_PUBLIC_BLOCK_EXPLORER || '',
};

// Constants
export const CONSTANTS = {
  BASIS_POINTS: 10000,
  ZERO_ADDRESS: '0x0000000000000000000000000000000000000000',
  MAX_UINT256: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  PROPOSAL_STATES: {
    0: 'Pending',
    1: 'Active',
    2: 'Canceled',
    3: 'Defeated',
    4: 'Succeeded',
    5: 'Queued',
    6: 'Expired',
    7: 'Executed',
  } as const,
  VOTE_SUPPORT: {
    AGAINST: 0,
    FOR: 1,
    ABSTAIN: 2,
  } as const,
};
