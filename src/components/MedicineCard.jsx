import React from 'react';
import { motion } from 'framer-motion';
import { Pill, Activity, ShieldPlus } from 'lucide-react';

const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0 }
};

export default function MedicineCard({ medicine, index, onClick }) {
    // 7 unique tablet color styles
    const tabletThemes = [
        { outer: 'bg-orange-100', inner: 'bg-white', border: 'border-orange-200', text: 'text-orange-900', accent: 'text-orange-600', score: 'bg-orange-200' },
        { outer: 'bg-yellow-100', inner: 'bg-white', border: 'border-yellow-200', text: 'text-yellow-900', accent: 'text-yellow-600', score: 'bg-yellow-200' },
        { outer: 'bg-white', inner: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-900', accent: 'text-gray-600', score: 'bg-gray-200' }, // White theme
        { outer: 'bg-sky-100', inner: 'bg-white', border: 'border-sky-200', text: 'text-sky-900', accent: 'text-sky-600', score: 'bg-sky-200' },
        { outer: 'bg-emerald-100', inner: 'bg-white', border: 'border-emerald-200', text: 'text-emerald-900', accent: 'text-emerald-600', score: 'bg-emerald-200' },
        { outer: 'bg-purple-100', inner: 'bg-white', border: 'border-purple-200', text: 'text-purple-900', accent: 'text-purple-600', score: 'bg-purple-200' },
        { outer: 'bg-rose-100', inner: 'bg-white', border: 'border-rose-200', text: 'text-rose-900', accent: 'text-rose-600', score: 'bg-rose-200' }
    ];

    const theme = tabletThemes[index % tabletThemes.length];

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ y: -6, scale: 1.02 }}
            onClick={onClick}
            className={`relative p-2 rounded-[3rem] border shadow-sm ${theme.outer} ${theme.border} group cursor-pointer transition-all hover:shadow-lg flex flex-col overflow-hidden h-full`}
        >
            {/* The inner "Capsule" area */}
            <div className={`flex-1 rounded-[2.5rem] ${theme.inner} p-6 pb-8 relative overflow-hidden flex flex-col`}>

                {/* Tablet Score mark (subtle line through the middle to mimic a pill) */}
                <div className={`absolute left-0 right-0 top-1/2 h-[2px] ${theme.score} opacity-40 -z-0`} />

                <div className="relative z-10 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div className="relative">
                            {medicine.isCommon && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="absolute -top-7 -left-1 bg-orange-500 text-white text-[9px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-full shadow-sm border border-orange-400 z-10 hidden sm:flex items-center gap-1"
                                >
                                    <ShieldPlus className="w-2.5 h-2.5" />
                                    Essential
                                </motion.div>
                            )}
                            <h3 className={`text-2xl font-bold tracking-tight ${theme.text} group-hover:opacity-80 transition-opacity`}>
                                {medicine.brandName}
                            </h3>
                            <p className={`text-sm font-medium mt-1 flex items-center gap-1.5 ${theme.accent}`}>
                                <Pill className="w-4 h-4" />
                                {medicine.genericFormula}
                            </p>
                        </div>
                        <span className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${theme.outer} ${theme.text} rounded-full shadow-sm`}>
                            {medicine.dosage}
                        </span>
                    </div>

                    <div className="mt-auto space-y-4">
                        <div className="bg-white/60 p-3 rounded-2xl backdrop-blur-sm border border-white/40">
                            <span className={`text-[10px] font-bold uppercase tracking-widest mb-2 block flex items-center gap-1 ${theme.accent}`}>
                                <Activity className="w-3.5 h-3.5" /> Used For
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                                {medicine.uses.map((use, i) => (
                                    <span key={i} className={`px-3 py-1 bg-white text-xs font-medium rounded-full border border-gray-100 shadow-sm text-gray-700`}>
                                        {use}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
