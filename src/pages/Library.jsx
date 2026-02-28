import React, { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, Loader2, AlertCircle, Bot as BotIcon } from 'lucide-react';
import MedicineCard from '../components/MedicineCard';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'moonshotai/kimi-k2-instruct-0905';

export default function Library() {
    const [searchTerm, setSearchTerm] = useState('');
    const [medicines, setMedicines] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [aiExplanation, setAiExplanation] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);

    // AI Search States
    const [searchAiExplanation, setSearchAiExplanation] = useState('');
    const [isSearchAiLoading, setIsSearchAiLoading] = useState(false);

    const itemsPerPage = 9;

    // Fetch AI summary for search term (Debounced)
    useEffect(() => {
        if (searchTerm.length <= 2) {
            setSearchAiExplanation('');
            return;
        }

        const fetchSearchAi = async () => {
            setIsSearchAiLoading(true);
            try {
                const systemPrompt = `You are a very fast, helpful medical AI. The user just typed "${searchTerm}" into a medicine search bar.
In EXACTLY 20 words or less, provide a helpful fact, definition, or quick tip about this symptom, generic formula, or medicine brand. Be concise, direct, and safe.`;

                const apiKey = import.meta.env.VITE_GROQ_API_KEY;
                if (!apiKey) throw new Error("Missing API Key");

                const response = await fetch(GROQ_API_URL, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: MODEL,
                        messages: [{ role: 'system', content: systemPrompt }],
                        temperature: 0.5,
                        max_tokens: 50,
                    })
                });

                if (!response.ok) throw new Error('Search AI fetch failed');

                const data = await response.json();
                const botResponse = data.choices[0]?.message?.content || "";
                setSearchAiExplanation(botResponse);
            } catch (err) {
                console.error(err);
                setSearchAiExplanation("Could not generate summary.");
            } finally {
                setIsSearchAiLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchSearchAi();
        }, 800); // 800ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Fetch AI details when a medicine is selected
    useEffect(() => {
        const fetchAiDetails = async () => {
            if (!selectedMedicine) return; // Only fetch if a medicine is open

            // If we already fetched for this exact drug, we might not want to re-fetch, but for simplicity let's always fetch on click.
            setIsAiLoading(true);
            setAiExplanation('');

            try {
                const systemPrompt = `You are a helpful and safe health assistant. 
The user is looking at a medicine card.
Brand: ${selectedMedicine.brandName}
Generic Formula: ${selectedMedicine.genericFormula}
Dosage/Route: ${selectedMedicine.dosage}
Used for: ${selectedMedicine.uses.join(', ')}

Your job is to:
1. Provide a very simple, 1-2 sentence definition of what this medicine does for a regular user.
2. Suggest 2-3 popular alternative medicine brands that have the EXACT same generic formula (${selectedMedicine.genericFormula}).
3. Always add a short disclaimer to consult a doctor. Keep responses concise, simple, and formatted in Markdown.`;

                const apiKey = import.meta.env.VITE_GROQ_API_KEY;
                if (!apiKey) {
                    throw new Error("Missing VITE_GROQ_API_KEY in environment variables.");
                }

                const response = await fetch(GROQ_API_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: MODEL,
                        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: `Please explain ${selectedMedicine.brandName} and suggest alternatives.` }],
                        temperature: 0.3,
                        max_tokens: 400,
                    })
                });

                if (!response.ok) throw new Error('API fetch failed');

                const data = await response.json();
                const botResponse = data.choices[0]?.message?.content || "Sorry, I couldn't generate an explanation.";
                setAiExplanation(botResponse);
            } catch (err) {
                console.error(err);
                setAiExplanation(`**Error:** Could not connect to the AI Assistant. Please check your API key and connection.`);
            } finally {
                setIsAiLoading(false);
            }
        };

        fetchAiDetails();
    }, [selectedMedicine]);

    // Fetch initial data from OpenFDA API
    useEffect(() => {
        const fetchMedicines = async () => {
            try {
                // Fetch 100 drug labels from the OpenFDA API
                const response = await fetch('https://api.fda.gov/drug/label.json?search=_exists_:openfda.brand_name&limit=100');
                if (!response.ok) throw new Error('Failed to fetch medicine data');

                const data = await response.json();

                // Map the complex FDA data into our clean UI structure
                const formattedMeds = data.results.map((item, index) => {
                    // Extract data carefully as FDA fields are often arrays or missing
                    const brandName = item.openfda?.brand_name?.[0] || 'Unknown Brand';
                    const generic = item.openfda?.generic_name?.[0] || 'Unknown Generic';

                    // Try to get a simple route/dosage
                    const dosage = item.openfda?.route?.[0] || 'Oral';

                    // Extract very basic uses from the purpose or indications text
                    let usesText = item.purpose?.[0] || item.indications_and_usage?.[0] || 'Medical Use';

                    // Heavily clean up the FDA text to make it just 1-2 words
                    usesText = usesText
                        .replace(/purposes?:?/gi, '')
                        .replace(/indications?( and usage)?:?/gi, '')
                        .replace(/uses?:?/gi, '')
                        .replace(/for the temporary relief of/gi, '')
                        .replace(/helps prevent/gi, '')
                        .replace(/relieves/gi, '')
                        .replace(/treatment of/gi, '')
                        .replace(/indicated for/gi, '')
                        .replace(/temporarily/gi, '')
                        .replace(/\bthe\b/gi, '')
                        .replace(/\bfor\b/gi, '')
                        .replace(/[\r\n]+/g, ' ') // remove newlines
                        .replace(/[^a-zA-Z\s,-]/g, '') // remove weird symbols
                        .trim();

                    // Split into array by commas or "and"
                    const rawUses = usesText.split(/,|\band\b/i);

                    // Take the first valid use, capitalize it properly, and strictly limit word count
                    const cleanUsesArray = [];
                    for (let text of rawUses) {
                        const cleaned = text.trim();
                        if (cleaned.length > 3) {
                            // Take just the first 1-3 words of the phrase to keep it badge-friendly
                            const shortPhrase = cleaned.split(/\s+/).slice(0, 3).join(' ');

                            // Title case
                            const titleCased = shortPhrase.replace(
                                /\w\S*/g,
                                (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                            );

                            cleanUsesArray.push(titleCased);

                            // Only want 1 or max 2 tags to prevent UI clutter
                            if (cleanUsesArray.length >= 1) break;
                        }
                    }

                    if (cleanUsesArray.length === 0) cleanUsesArray.push('Medical Use');

                    return {
                        id: item.id || index.toString(),
                        brandName,
                        genericFormula: generic,
                        dosage: dosage,
                        uses: cleanUsesArray,
                        alternatives: [] // OpenFDA doesn't natively provide alternative brands easily without another query
                    };
                });

                // Filter out some garbage data where brand and generic are exactly the same or missing
                const cleanMeds = formattedMeds.filter(m => m.brandName !== 'Unknown Brand');

                // 20 Common / Essential Medicines to inject
                const commonMedicines = [
                    { id: 'c1', brandName: 'Panadol', genericFormula: 'Paracetamol', dosage: 'Tablet 500mg', uses: ['Fever', 'Pain Relief'], alternatives: [], isCommon: true },
                    { id: 'c2', brandName: 'Advil', genericFormula: 'Ibuprofen', dosage: 'Tablet 200mg', uses: ['Inflammation', 'Headache'], alternatives: [], isCommon: true },
                    { id: 'c3', brandName: 'Amoxil', genericFormula: 'Amoxicillin', dosage: 'Capsule 500mg', uses: ['Bacterial Infection'], alternatives: [], isCommon: true },
                    { id: 'c4', brandName: 'Zyrtec', genericFormula: 'Cetirizine', dosage: 'Tablet 10mg', uses: ['Allergies', 'Hay Fever'], alternatives: [], isCommon: true },
                    { id: 'c5', brandName: 'Glucophage', genericFormula: 'Metformin', dosage: 'Tablet 500mg', uses: ['Type 2 Diabetes'], alternatives: [], isCommon: true },
                    { id: 'c6', brandName: 'Lipitor', genericFormula: 'Atorvastatin', dosage: 'Tablet 20mg', uses: ['High Cholesterol'], alternatives: [], isCommon: true },
                    { id: 'c7', brandName: 'Zantac', genericFormula: 'Ranitidine', dosage: 'Tablet 150mg', uses: ['Acid Reflux', 'Heartburn'], alternatives: [], isCommon: true },
                    { id: 'c8', brandName: 'Ventolin', genericFormula: 'Albuterol', dosage: 'Inhaler', uses: ['Asthma'], alternatives: [], isCommon: true },
                    { id: 'c9', brandName: 'Prinivil', genericFormula: 'Lisinopril', dosage: 'Tablet 10mg', uses: ['High Blood Pressure'], alternatives: [], isCommon: true },
                    { id: 'c10', brandName: 'Synthroid', genericFormula: 'Levothyroxine', dosage: 'Tablet 50mcg', uses: ['Hypothyroidism'], alternatives: [], isCommon: true },
                    { id: 'c11', brandName: 'Xanax', genericFormula: 'Alprazolam', dosage: 'Tablet 0.5mg', uses: ['Anxiety', 'Panic Disorders'], alternatives: [], isCommon: true },
                    { id: 'c12', brandName: 'Zoloft', genericFormula: 'Sertraline', dosage: 'Tablet 50mg', uses: ['Depression', 'OCD'], alternatives: [], isCommon: true },
                    { id: 'c13', brandName: 'Nexium', genericFormula: 'Esomeprazole', dosage: 'Capsule 40mg', uses: ['GERD', 'Stomach Ulcers'], alternatives: [], isCommon: true },
                    { id: 'c14', brandName: 'Plavix', genericFormula: 'Clopidogrel', dosage: 'Tablet 75mg', uses: ['Blood Thinner', 'Stroke Prevention'], alternatives: [], isCommon: true },
                    { id: 'c15', brandName: 'Singulair', genericFormula: 'Montelukast', dosage: 'Tablet 10mg', uses: ['Asthma Prevention', 'Allergies'], alternatives: [], isCommon: true },
                    { id: 'c16', brandName: 'Crestor', genericFormula: 'Rosuvastatin', dosage: 'Tablet 10mg', uses: ['High Cholesterol'], alternatives: [], isCommon: true },
                    { id: 'c17', brandName: 'Flonase', genericFormula: 'Fluticasone', dosage: 'Nasal Spray', uses: ['Allergic Rhinitis'], alternatives: [], isCommon: true },
                    { id: 'c18', brandName: 'Lexapro', genericFormula: 'Escitalopram', dosage: 'Tablet 10mg', uses: ['Depression', 'Anxiety'], alternatives: [], isCommon: true },
                    { id: 'c19', brandName: 'Cymbalta', genericFormula: 'Duloxetine', dosage: 'Capsule 30mg', uses: ['Nerve Pain', 'Depression'], alternatives: [], isCommon: true },
                    { id: 'c20', brandName: 'Lantus', genericFormula: 'Insulin Glargine', dosage: 'Injection', uses: ['Type 1 & 2 Diabetes'], alternatives: [], isCommon: true },
                ];

                // Combine both arrays
                const combinedMeds = [...cleanMeds, ...commonMedicines];

                // Shuffle the combined array so common ones scatter naturally
                for (let i = combinedMeds.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [combinedMeds[i], combinedMeds[j]] = [combinedMeds[j], combinedMeds[i]];
                }

                setMedicines(combinedMeds);
                setIsLoading(false);
            } catch (err) {
                console.error(err);
                setError('Could not establish connection to the FDA Database. Please try again later.');
                setIsLoading(false);
            }
        };

        fetchMedicines();
    }, []);

    // Reset pagination when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Filter the fetched data based on search input
    const filteredMedicines = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return medicines.filter(med =>
            med.brandName.toLowerCase().includes(term) ||
            med.genericFormula.toLowerCase().includes(term) ||
            med.uses.some(use => use.toLowerCase().includes(term))
        );
    }, [searchTerm, medicines]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredMedicines.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        // Optional: Scroll back up when paginating
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    // Find medicines with the same generic formula as the selected one
    const similarMedicines = useMemo(() => {
        if (!selectedMedicine) return [];
        return medicines.filter(
            med => med.genericFormula === selectedMedicine.genericFormula && med.id !== selectedMedicine.id
        );
    }, [selectedMedicine, medicines]);

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }
        return pageNumbers;
    };

    return (
        <div className="animate-in fade-in duration-500 pb-16">
            {/* Global background for Library page */}
            <div className="fixed inset-0 bg-mistral-studio -z-10 pointer-events-none" />

            {/* Hero Section */}
            <div className="relative overflow-hidden pt-20 pb-8 md:pt-32 md:pb-12 -mx-4 md:-mx-8 px-4 md:px-8 -mt-8">
                <div className="max-w-4xl text-center mx-auto">
                    <h1 className="text-5xl md:text-7xl font-light tracking-tight text-white drop-shadow-sm leading-[1.1]">
                        Find medicines <br /> that you can't find.
                    </h1>
                    <p className="mt-6 text-xl text-orange-100 font-light drop-shadow-sm max-w-3xl mx-auto">
                        Need a specific medicine but it's out of stock? Search for it here to instantly find safe, reliable alternative brands that share the exact same generic formula.
                    </p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12 relative">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400 group-focus-within:text-mistral-accent transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-14 pr-14 py-4 bg-white/95 backdrop-blur-sm border-2 border-transparent focus:border-mistral-accent/30 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-mistral-accent/10 transition-all shadow-lg text-lg"
                        placeholder="Search by symptom, formula, or brand..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-2 pr-2 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-mistral-dark/10 flex items-center justify-center">
                            <BotIcon className="w-4 h-4 text-mistral-dark" />
                        </div>
                    </div>
                </div>

                {/* AI Search Summary Bubble */}
                <AnimatePresence>
                    {searchTerm.length > 2 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-mistral-accent/20 p-4 z-20 flex gap-3"
                        >
                            <BotIcon className="w-5 h-5 text-mistral-accent mt-0.5 flex-shrink-0 animate-pulse" />
                            <div className="flex-1">
                                {isSearchAiLoading ? (
                                    <div className="flex items-center gap-2 text-gray-500 text-sm py-1">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>AI is analyzing "{searchTerm}"...</span>
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-700 leading-relaxed font-medium">
                                        {searchAiExplanation || `Showing results for ${searchTerm}`}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-mistral-accent" />
                    <p>Fetching latest FDA records...</p>
                </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-2xl p-6 flex gap-4 text-red-800">
                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {/* Results Grid */}
            {!isLoading && !error && (
                <div className="mb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 cursor-pointer mb-12">
                        {currentItems.map((medicine, index) => (
                            <MedicineCard
                                key={medicine.id}
                                medicine={medicine}
                                index={index} // Need actual index from currentItems mapping
                                onClick={() => setSelectedMedicine({ ...medicine, index })}
                            />
                        ))}
                        {currentItems.length === 0 && (
                            <div className="col-span-full py-12 text-center text-white">
                                No medicines found matching "{searchTerm}". Try another term or ask the AI Bot.
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8">
                            <button
                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium border border-white/20"
                            >
                                Previous
                            </button>

                            <div className="flex items-center gap-1 mx-2">
                                {getPageNumbers().map(number => (
                                    <button
                                        key={number}
                                        onClick={() => handlePageChange(number)}
                                        className={`w-10 h-10 rounded-lg font-medium transition-colors border ${currentPage === number
                                            ? 'bg-white text-orange-600 border-white shadow-sm'
                                            : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                                            }`}
                                    >
                                        {number}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium border border-white/20"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Details Modal */}
            {selectedMedicine && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm sm:p-6" onClick={() => setSelectedMedicine(null)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#FDFCF8] bg-dot-pattern w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-gray-100 flex flex-col"
                    >
                        {/* Modal Header/Selected Pill */}
                        <div className="p-6 md:p-8 border-b border-gray-100 bg-white">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-2xl font-semibold text-gray-900">Medicine Details</h2>
                                <button
                                    onClick={() => setSelectedMedicine(null)}
                                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            {/* Render the selected medicine card large */}
                            <div className="max-w-md mx-auto">
                                <MedicineCard medicine={selectedMedicine} index={selectedMedicine.index} />
                            </div>
                        </div>

                        {/* AI Assistant Section */}
                        <div className="px-6 md:px-8 pt-6">
                            <div className="bg-white rounded-2xl border border-mistral-accent/20 overflow-hidden shadow-sm relative">
                                <div className="absolute top-0 left-0 w-1 h-full bg-mistral-accent"></div>
                                <div className="p-4 md:p-6 flex gap-4 items-start">
                                    <div className="w-10 h-10 rounded-full bg-mistral-dark text-white flex items-center justify-center flex-shrink-0">
                                        <BotIcon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 mb-2">Mistral AI Health Assistant</h3>
                                        {isAiLoading ? (
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span className="text-sm">Analyzing medicine and searching for alternatives...</span>
                                            </div>
                                        ) : (
                                            <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-a:text-mistral-accent prose-p:leading-relaxed text-gray-700">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {aiExplanation || "Select a medicine to learn more."}
                                                </ReactMarkdown>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Similar Medicines Section */}
                        <div className="p-6 md:p-8 flex-1">
                            <h3 className="text-xl font-medium text-gray-900 mb-2">Same Generic Formula in Database</h3>
                            <p className="text-gray-500 mb-6 text-sm">Other brands containing exactly <strong>{selectedMedicine.genericFormula}</strong> available in our local FDA records.</p>

                            {similarMedicines.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {similarMedicines.map((med, idx) => (
                                        <MedicineCard
                                            key={med.id}
                                            medicine={med}
                                            index={idx}
                                            onClick={() => setSelectedMedicine({ ...med, index: idx })}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm">
                                    <p className="text-gray-500 text-sm">No other exact matches found in the local database. Refer to the AI suggestions above.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
