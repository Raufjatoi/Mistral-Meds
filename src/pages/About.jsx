import React from 'react';

export default function About() {
    return (
        <div className="animate-in fade-in duration-500 max-w-5xl mx-auto pt-12 pb-24">
            {/* Global background for About page */}
            <div className="fixed inset-0 bg-mistral-studio -z-10 pointer-events-none" />

            <div className="text-center mb-16 px-4">
                <h2 className="text-4xl font-light mb-4 text-white tracking-tight drop-shadow-sm">About the Project</h2>
                <p className="text-orange-100 max-w-2xl mx-auto text-lg drop-shadow-sm">
                    Discover the problem we're solving and the developer behind the solution.
                </p>
            </div>

            <div className="bg-white rounded-3xl p-8 md:p-12 border border-orange-200/50 xl:shadow-2xl shadow-xl relative overflow-hidden mx-4 md:mx-0">
                {/* Decorative background grid inside the card */}
                <div className="absolute inset-0 bg-[#FDFCF8] bg-grid-pattern opacity-50 pointer-events-none" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-2xl font-semibold mb-3 text-gray-900">The Problem</h3>
                            <p className="text-gray-600 leading-relaxed text-lg">
                                People often struggle to find specific medicine brands due to regional shortages, or they don't know the generic formula to ask for an alternative. Reading complex medical symptoms online can also be overwhelming and anxiety-inducing.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold mb-3 text-gray-900">The Solution</h3>
                            <p className="text-gray-600 leading-relaxed text-lg">
                                This platform simplifies healthcare access by instantly mapping brand names to their generic formulas and offering a safe, Mistral-powered AI assistant that translates symptoms into actionable queries for the medical library.
                            </p>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="text-2xl font-semibold mb-4 text-gray-900">Powered By</h3>
                            <ul className="space-y-4">
                                <li className="flex gap-3 items-start">
                                    <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">G</div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Groq API</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            The intelligent health bot and search summaries run with lightning-fast inference through the Groq API. <span className="italic text-gray-500">Note: The intention was to use Mistral AI, but the Mistral model API was deprecated during development, so we pivoted to use the fast Groq API with the moonshot model instead.</span>
                                        </p>
                                    </div>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">FDA</div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">OpenFDA Database</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            Medicine data, active ingredients, and usage definitions are fetched dynamically from the official United States FDA open dataset.
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-orange-50/80 rounded-2xl p-8 flex flex-col items-center text-center border border-orange-100/50 shadow-sm backdrop-blur-sm self-start sticky top-24">
                        <img
                            src="/rauf.png"
                            alt="Rauf Jatoi"
                            className="w-32 h-32 rounded-full object-cover shadow-sm border-4 border-white mb-6"
                        />
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">Rauf Jatoi</h4>
                        <p className="text-gray-600 mb-6 italic leading-relaxed">
                            "I'm a fullstack developer and AI student. I like making web apps and intelligent solutions that solve real problems."
                        </p>
                        <a
                            href="https://raufjatoi.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-6 py-2.5 bg-mistral-dark text-white text-sm font-medium rounded-xl hover:bg-black transition-colors"
                        >
                            View Portfolio
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
