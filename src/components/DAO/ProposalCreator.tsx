// import { useDAO } from '@/hooks/useDAO';
// import React, { useState } from 'react';
// import { FaPlus, FaTrash } from 'react-icons/fa';

// interface ProposalTarget {
//     target: string;
//     value: string;
//     calldata: string;
// }

// export const ProposalCreator: React.FC = () => {
//     const { createProposal, isConnected } = useDAO();

//     const [title, setTitle] = useState('');
//     const [description, setDescription] = useState('');
//     const [targets, setTargets] = useState<ProposalTarget[]>([
//         { target: '', value: '0', calldata: '0x' }
//     ]);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const [success, setSuccess] = useState<string | null>(null);

//     const addTarget = () => {
//         setTargets([...targets, { target: '', value: '0', calldata: '0x' }]);
//     };

//     const removeTarget = (index: number) => {
//         if (targets.length > 1) {
//             setTargets(targets.filter((_, i) => i !== index));
//         }
//     };

//     const updateTarget = (index: number, field: keyof ProposalTarget, value: string) => {
//         const newTargets = [...targets];
//         newTargets[index][field] = value;
//         setTargets(newTargets);
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!isConnected) {
//             setError('Please connect your wallet to create a proposal');
//             return;
//         }

//         setIsSubmitting(true);
//         setError(null);
//         setSuccess(null);

//         try {
//             // Validate inputs
//             if (!title.trim() || !description.trim()) {
//                 throw new Error('Title and description are required');
//             }

//             if (targets.some(t => !t.target.trim())) {
//                 throw new Error('All targets must have valid addresses');
//             }

//             // Format the proposal description
//             const fullDescription = `# ${title}\n\n${description}`;

//             // Extract arrays for the contract call
//             const targetAddresses = targets.map(t => t.target);
//             const values = targets.map(t => t.value);
//             const calldatas = targets.map(t => t.calldata);

//             const txHash = await createProposal(targetAddresses, values, calldatas, fullDescription);

//             if (txHash) {
//                 setSuccess(`Proposal created successfully! Transaction: ${txHash}`);
//                 // Reset form
//                 setTitle('');
//                 setDescription('');
//                 setTargets([{ target: '', value: '0', calldata: '0x' }]);
//             } else {
//                 throw new Error('Failed to create proposal');
//             }
//         } catch (err) {
//             console.error('Proposal creation failed:', err);
//             setError(err instanceof Error ? err.message : 'Failed to create proposal');
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     return (
//         <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
//             <h2 className="text-xl font-semibold text-white mb-6">Create Governance Proposal</h2>

//             {error && (
//                 <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
//                     <p className="text-red-400 text-sm">{error}</p>
//                 </div>
//             )}

//             {success && (
//                 <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4 mb-4">
//                     <p className="text-green-400 text-sm">{success}</p>
//                 </div>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-6">
//                 {/* Title */}
//                 <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">
//                         Proposal Title *
//                     </label>
//                     <input
//                         type="text"
//                         value={title}
//                         onChange={(e) => setTitle(e.target.value)}
//                         placeholder="Enter proposal title..."
//                         className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
//                         required
//                     />
//                 </div>

//                 {/* Description */}
//                 <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">
//                         Description *
//                     </label>
//                     <textarea
//                         value={description}
//                         onChange={(e) => setDescription(e.target.value)}
//                         placeholder="Describe your proposal in detail..."
//                         rows={4}
//                         className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
//                         required
//                     />
//                 </div>

//                 {/* Targets */}
//                 <div>
//                     <div className="flex items-center justify-between mb-4">
//                         <label className="block text-sm font-medium text-gray-300">
//                             Proposal Actions
//                         </label>
//                         <button
//                             type="button"
//                             onClick={addTarget}
//                             className="flex items-center px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-700 text-sm"
//                         >
//                             <FaPlus className="mr-1" />
//                             Add Action
//                         </button>
//                     </div>

//                     {targets.map((target, index) => (
//                         <div key={index} className="bg-gray-700 rounded-lg p-4 mb-3">
//                             <div className="flex items-center justify-between mb-3">
//                                 <h4 className="text-sm font-medium text-gray-300">Action {index + 1}</h4>
//                                 {targets.length > 1 && (
//                                     <button
//                                         type="button"
//                                         onClick={() => removeTarget(index)}
//                                         className="text-red-400 hover:text-red-300"
//                                     >
//                                         <FaTrash />
//                                     </button>
//                                 )}
//                             </div>

//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                                 <div>
//                                     <label className="block text-xs text-gray-400 mb-1">Target Contract</label>
//                                     <input
//                                         type="text"
//                                         value={target.target}
//                                         onChange={(e) => updateTarget(index, 'target', e.target.value)}
//                                         placeholder="0x..."
//                                         className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-xs text-gray-400 mb-1">ETH Value</label>
//                                     <input
//                                         type="text"
//                                         value={target.value}
//                                         onChange={(e) => updateTarget(index, 'value', e.target.value)}
//                                         placeholder="0"
//                                         className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-xs text-gray-400 mb-1">Call Data</label>
//                                     <input
//                                         type="text"
//                                         value={target.calldata}
//                                         onChange={(e) => updateTarget(index, 'calldata', e.target.value)}
//                                         placeholder="0x"
//                                         className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400"
//                                     />
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>

//                 {/* Submit Button */}
//                 <div className="flex justify-end">
//                     <button
//                         type="submit"
//                         disabled={!isConnected || isSubmitting}
//                         className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
//                     >
//                         {isSubmitting ? 'Creating Proposal...' : 'Create Proposal'}
//                     </button>
//                 </div>
//             </form>

//             {!isConnected && (
//                 <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500/50 rounded-lg">
//                     <p className="text-yellow-400 text-sm">
//                         Connect your wallet to create governance proposals
//                     </p>
//                 </div>
//             )}
//         </div>
//     );
// };
