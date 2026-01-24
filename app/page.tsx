export default function HomePage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900 mb-4">
                    🔗 Linktree Killer
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                    Your premium link-in-bio builder
                </p>
                <div className="flex gap-4 justify-center">
                    <a
                        href="/login"
                        className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition"
                    >
                        Get Started
                    </a>
                    <a
                        href="/builder"
                        className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-full font-semibold hover:bg-blue-50 transition"
                    >
                        Go to Builder
                    </a>
                </div>
                <p className="mt-8 text-sm text-gray-500">
                    ✅ Next.js migration complete!
                </p>
            </div>
        </main>
    );
}
