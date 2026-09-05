import { ethers } from 'ethers';
import { CONTRACT_ABIS, CONTRACT_ADDRESSES } from '@/services/contracts/config';

export type ProposalPresetTarget = 'token' | 'treasury';

export type ProposalFunctionPreset = {
  key: string;
  label: string;
  group: 'NYAX Token' | 'Treasury';
  target: ProposalPresetTarget;
  functionName: string;
  /** Static args when no prompts are needed */
  args?: unknown[];
  /** Interactive prompts filled at apply-time */
  prompts?: Array<{
    key: string;
    label: string;
    type: 'address' | 'amount' | 'bool';
    defaultValue?: string;
  }>;
};

export const PROPOSAL_FUNCTION_PRESETS: ProposalFunctionPreset[] = [
  // Token transfer controls
  {
    key: 'enableTransfers',
    label: 'NYAX: Enable transfers',
    group: 'NYAX Token',
    target: 'token',
    functionName: 'setTransfersEnabled',
    args: [true],
  },
  {
    key: 'disableTransfers',
    label: 'NYAX: Disable transfers',
    group: 'NYAX Token',
    target: 'token',
    functionName: 'setTransfersEnabled',
    args: [false],
  },
  {
    key: 'pauseToken',
    label: 'NYAX: Pause token',
    group: 'NYAX Token',
    target: 'token',
    functionName: 'pause',
    args: [],
  },
  {
    key: 'unpauseToken',
    label: 'NYAX: Unpause token',
    group: 'NYAX Token',
    target: 'token',
    functionName: 'unpause',
    args: [],
  },
  {
    key: 'blacklistAddress',
    label: 'NYAX: Blacklist address',
    group: 'NYAX Token',
    target: 'token',
    functionName: 'setBlacklisted',
    prompts: [
      { key: 'account', label: 'Address to blacklist', type: 'address' },
    ],
    args: [], // filled as [address, true]
  },
  {
    key: 'unblacklistAddress',
    label: 'NYAX: Remove blacklist',
    group: 'NYAX Token',
    target: 'token',
    functionName: 'setBlacklisted',
    prompts: [
      { key: 'account', label: 'Address to unblacklist', type: 'address' },
    ],
  },
  {
    key: 'setTreasury',
    label: 'NYAX: Set treasury address',
    group: 'NYAX Token',
    target: 'token',
    functionName: 'setTreasury',
    prompts: [
      { key: 'treasury', label: 'New treasury address', type: 'address', defaultValue: CONTRACT_ADDRESSES.treasury },
    ],
  },
  {
    key: 'mintTokens',
    label: 'NYAX: Mint tokens',
    group: 'NYAX Token',
    target: 'token',
    functionName: 'mint',
    prompts: [
      { key: 'to', label: 'Recipient address', type: 'address' },
      { key: 'amount', label: 'Amount (gNYAX)', type: 'amount' },
    ],
  },
  {
    key: 'burnTokens',
    label: 'NYAX: Burn tokens from address',
    group: 'NYAX Token',
    target: 'token',
    functionName: 'burn',
    prompts: [
      { key: 'from', label: 'Address to burn from', type: 'address' },
      { key: 'amount', label: 'Amount (gNYAX)', type: 'amount' },
    ],
  },

  // Treasury controls
  {
    key: 'pauseTreasury',
    label: 'Treasury: Pause',
    group: 'Treasury',
    target: 'treasury',
    functionName: 'pauseTreasury',
    args: [],
  },
  {
    key: 'unpauseTreasury',
    label: 'Treasury: Unpause',
    group: 'Treasury',
    target: 'treasury',
    functionName: 'unpauseTreasury',
    args: [],
  },
  {
    key: 'approveFolder',
    label: 'Treasury: Approve folder',
    group: 'Treasury',
    target: 'treasury',
    functionName: 'approveFolder',
    prompts: [
      { key: 'folder', label: 'Folder escrow address', type: 'address' },
    ],
  },
  {
    key: 'removeFolder',
    label: 'Treasury: Remove folder approval',
    group: 'Treasury',
    target: 'treasury',
    functionName: 'removeFolder',
    prompts: [
      { key: 'folder', label: 'Folder escrow address', type: 'address' },
    ],
  },
  {
    key: 'sendToFolder',
    label: 'Treasury: Send tokens to folder',
    group: 'Treasury',
    target: 'treasury',
    functionName: 'sendToFolder',
    prompts: [
      { key: 'folder', label: 'Folder escrow address', type: 'address' },
      { key: 'amount', label: 'Amount (gNYAX)', type: 'amount' },
    ],
  },
];

function getInterfaceForTarget(target: ProposalPresetTarget) {
  if (target === 'treasury') {
    return new ethers.Interface(CONTRACT_ABIS.treasury ?? []);
  }
  return new ethers.Interface(CONTRACT_ABIS.nyaxToken ?? []);
}

function getAddressForTarget(target: ProposalPresetTarget) {
  if (target === 'treasury') {
    return CONTRACT_ADDRESSES.treasury || '';
  }
  return CONTRACT_ADDRESSES.nyaxToken || '';
}

function collectPromptArgs(preset: ProposalFunctionPreset): unknown[] | null {
  if (!preset.prompts?.length) {
    return preset.args ?? [];
  }

  const values: Record<string, string> = {};
  for (const prompt of preset.prompts) {
    const raw = window.prompt(prompt.label, prompt.defaultValue || '');
    if (raw === null) return null; // cancelled
    const trimmed = raw.trim();
    if (!trimmed) {
      throw new Error(`${prompt.label} is required.`);
    }
    values[prompt.key] = trimmed;
  }

  switch (preset.key) {
    case 'blacklistAddress':
      return [values.account, true];
    case 'unblacklistAddress':
      return [values.account, false];
    case 'setTreasury':
      return [values.treasury];
    case 'mintTokens':
      return [values.to, ethers.parseEther(values.amount)];
    case 'burnTokens':
      return [values.from, ethers.parseEther(values.amount)];
    case 'approveFolder':
    case 'removeFolder':
      return [values.folder];
    case 'sendToFolder':
      return [values.folder, ethers.parseEther(values.amount)];
    default: {
      return preset.prompts.map(p => {
        if (p.type === 'amount') return ethers.parseEther(values[p.key]);
        if (p.type === 'bool') return values[p.key] === 'true';
        return values[p.key];
      });
    }
  }
}

export function encodeProposalPreset(key: string): {
  target: string;
  value: string;
  calldata: string;
  label: string;
} {
  const preset = PROPOSAL_FUNCTION_PRESETS.find(entry => entry.key === key);
  if (!preset) {
    throw new Error('Unknown function preset.');
  }

  const target = getAddressForTarget(preset.target);
  if (!target) {
    throw new Error(`${preset.group} contract address is not configured.`);
  }

  const args = collectPromptArgs(preset);
  if (args === null) {
    throw new Error('Cancelled');
  }

  const iface = getInterfaceForTarget(preset.target);
  const calldata = iface.encodeFunctionData(preset.functionName, args);

  return {
    target,
    value: '0',
    calldata,
    label: preset.label,
  };
}
