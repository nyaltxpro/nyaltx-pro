import CallDataHelper from '../../components/CallDataHelper';

export default function CallDataHelperPage() {
    return (
        <div className="min-h-screen bg-gray-950 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-white text-center mb-8">
                    🔧 Transaction Call Data Generator
                </h1>
                <CallDataHelper />
            </div>
        </div>
    );
}
