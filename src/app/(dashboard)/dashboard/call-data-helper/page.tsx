import CallDataHelper from '../../../../components/CallDataHelper';

export default function DashboardCallDataHelperPage() {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">
                    🔧 Call Data Generator
                </h1>
                <p className="text-gray-400">
                    Generate properly formatted call data for multisig transactions using your deployed contracts.
                </p>
            </div>
            <CallDataHelper />
        </div>
    );
}
