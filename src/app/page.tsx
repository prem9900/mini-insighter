// Landing page
import Link from "next/link";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-white bg-grid-subtle">
            <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center z-10">
                <div className="mb-8 animate-fade-in">
                    <span className="px-3 py-1 rounded-full bg-zinc-100 text-xs font-medium text-zinc-600 border border-zinc-200 uppercase tracking-wider">
                        Beta Access
                    </span>
                </div>

                <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight text-zinc-900 animate-slide-up mb-6">
                    Welcome to <br className="hidden md:block" />
                    <span className="text-zinc-400">Mini Insighter</span>
                </h1>

                <p className="mt-4 text-xl md:text-2xl text-zinc-500 max-w-2xl mx-auto font-light animate-slide-up">
                    Your personalized insight dashboard. <br />
                    <span className="text-zinc-400">Simple, Clean, Powerful.</span>
                </p>

                <div className="mt-12 flex flex-col sm:flex-row gap-4 animate-slide-up">
                    <Link
                        href="/login"
                        className="btn-primary"
                    >
                        Get Started
                    </Link>
                    <Link
                        href="https://github.com"
                        className="btn-secondary"
                    >
                        Star on GitHub
                    </Link>
                </div>

                <div className="mt-16 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    <div className="card p-8">
                        <h3 className="text-lg font-semibold text-zinc-900 mb-2">Analytics</h3>
                        <p className="text-zinc-500">Real-time data visualization for your projects.</p>
                    </div>
                    <div className="card p-8">
                        <h3 className="text-lg font-semibold text-zinc-900 mb-2">Collaboration</h3>
                        <p className="text-zinc-500">Invite team members and share insights effortlessly.</p>
                    </div>
                    <div className="card p-8">
                        <h3 className="text-lg font-semibold text-zinc-900 mb-2">Integration</h3>
                        <p className="text-zinc-500">Seamlessly connect with your existing tools.</p>
                    </div>
                </div>
            </main>

            <footer className="w-full py-8 border-t border-zinc-100 mt-12 text-center text-zinc-400 text-sm">
                &copy; {new Date().getFullYear()} Mini Insighter. All rights reserved.
            </footer>
        </div>
    );
}
