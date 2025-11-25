import CallDataHelper from '../../../../../components/CallDataHelper';

export default function AdminCallDataHelperPage() {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">
                    🔧 Admin Call Data Generator
                </h1>
                <p className="text-gray-400">
                    Generate call data for DAO operations, token management, and multisig transactions.
                </p>
            </div>
            <CallDataHelper />
        </div>
    );
}
