export default function InsightsPage({ params }: { params: { projectId: string } }) {
    return (
        <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h1 className="text-2xl font-semibold mb-4">Insights</h1>
            <p className="text-gray-500">Project ID: {params.projectId}</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64 border border-gray-100 rounded-lg bg-gray-50 flex items-center justify-center">
                    <p className="text-gray-400">Chart Placeholder 1</p>
                </div>
                <div className="h-64 border border-gray-100 rounded-lg bg-gray-50 flex items-center justify-center">
                    <p className="text-gray-400">Chart Placeholder 2</p>
                </div>
            </div>
        </div>
    );
}
