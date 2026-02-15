// Landing page
import Link from "next/link";

export default function Home() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="container-page py-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl gradient-google-multi flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">✨</span>
                        </div>
                        <span className="font-heading font-bold text-2xl text-gray-900">Mini Insighter</span>
                    </div>
                    <Link href="/login" className="btn-ghost text-sm font-medium">
                        Sign In
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="container-page">
                <div className="flex flex-col items-center text-center py-16 md:py-24">
                    {/* Badge */}
                    <div className="mb-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-50 border border-blue-200">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">Powered by Google Gemini AI</span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-6xl md:text-7xl lg:text-8xl font-heading font-black tracking-tight mb-6 max-w-5xl">
                        <span className="text-gray-900">Chat with Your</span>
                        <br />
                        <span className="text-gradient-google">BigQuery Data</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
                        Ask questions in plain English. Get instant SQL queries, visualizations, and insights from your BigQuery datasets.
                        <span className="font-semibold text-blue-600"> No SQL knowledge required.</span>
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-20">
                        <Link href="/signup" className="btn-primary px-10 py-4 text-base shadow-xl shadow-blue-600/20">
                            Get Started Free →
                        </Link>
                        <Link href="/login" className="btn-secondary px-10 py-4 text-base">
                            View Demo
                        </Link>
                    </div>

                    {/* Architecture Flow */}
                    <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl border-2 border-gray-200 p-8 md:p-12 shadow-xl gemini-sparkle">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-8 text-center">How It Works</h3>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4">
                            {/* Step 1 */}
                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30 transform hover:scale-110 transition-transform">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2 text-lg">Ask in English</h4>
                                <p className="text-sm text-gray-600">Type your question naturally</p>
                            </div>

                            {/* Arrow */}
                            <div className="hidden md:flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </div>

                            {/* Step 2 */}
                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 gradient-google-multi rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30 transform hover:scale-110 transition-transform">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2 text-lg">Gemini AI</h4>
                                <p className="text-sm text-gray-600">Generates perfect SQL</p>
                            </div>

                            {/* Arrow */}
                            <div className="hidden md:flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </div>

                            {/* Step 3 */}
                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-green-500/30 transform hover:scale-110 transition-transform">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2 text-lg">Get Insights</h4>
                                <p className="text-sm text-gray-600">Visual results instantly</p>
                            </div>
                        </div>

                        {/* Example Query */}
                        <div className="mt-10 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 text-sm">💬</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-700 font-medium mb-2">{"\"Show me the top 5 products by revenue this month\""}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">✓ SQL Generated</span>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">✓ Data Fetched</span>
                                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">✓ Insights Ready</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="py-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <div className="card-premium p-8 card-hover">
                        <div className="w-14 h-14 gradient-google rounded-2xl flex items-center justify-center mb-5 shadow-lg">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered</h3>
                        <p className="text-gray-600 leading-relaxed">
                            {"Google's Gemini AI translates your questions into optimized SQL queries automatically."}
                        </p>
                    </div>

                    <div className="card-premium p-8 card-hover">
                        <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Secure & Private</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Your API keys and data stay secure. We never store your BigQuery data.
                        </p>
                    </div>

                    <div className="card-premium p-8 card-hover">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Insights</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Get results in seconds with automatic visualizations and natural language summaries.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 py-12 mt-20">
                <div className="container-page">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl gradient-google-multi flex items-center justify-center">
                                <span className="text-white font-bold text-sm">✨</span>
                            </div>
                            <span className="text-gray-600 text-sm">
                                &copy; {new Date().getFullYear()} Mini Insighter
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm">
                            Built with Next.js, Google Gemini AI, and BigQuery
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
