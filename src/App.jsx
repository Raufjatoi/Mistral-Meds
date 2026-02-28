import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Library from './pages/Library'
import Bot from './pages/Bot'
import About from './pages/About'

export default function App() {
    const location = useLocation()

    return (
        <div className="min-h-screen flex flex-col selection:bg-mistral-accent/20">
            <header className="py-6 px-4 md:px-8 border-b border-gray-100 bg-white/70 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link to="/" className="text-xl font-semibold tracking-tight text-gray-900 group">
                        Mistral <span className="text-mistral-accent font-normal group-hover:opacity-80 transition-opacity">Meds</span>
                    </Link>
                    <nav className="flex gap-6">
                        <Link
                            to="/"
                            className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-mistral-accent' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Library
                        </Link>
                        <Link
                            to="/bot"
                            className={`text-sm font-medium transition-colors ${location.pathname === '/bot' ? 'text-mistral-accent' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            AI Bot
                        </Link>
                        <Link
                            to="/about"
                            className={`text-sm font-medium transition-colors ${location.pathname === '/about' ? 'text-mistral-accent' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            About
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8">
                <Routes>
                    <Route path="/" element={<Library />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/bot" element={<Bot />} />
                </Routes>
            </main>

            <footer className="py-8 px-4 border-t border-gray-100 bg-white flex flex-col items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-3">
                    <span>by</span>
                    <a href="https://raufjatoi.vercel.app/" target="_blank" rel="noopener noreferrer" className="font-medium hover:text-mistral-accent transition-colors flex items-center gap-2">
                        <img src="/rauf.png" alt="Rauf Jatoi" className="w-6 h-6 rounded-full object-cover" />
                        Rauf Jatoi
                    </a>
                </div>
            </footer>
        </div>
    )
}
