export default function ChatPage({ params }: { params: { projectId: string } }) {
    return (
        <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h1 className="text-2xl font-semibold mb-4">Chat</h1>
            <p className="text-gray-500">Project ID: {params.projectId}</p>
            <div className="mt-8 flex items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                <p className="text-gray-400">Chat interface coming soon...</p>
            </div>
        </div>
    );
}
