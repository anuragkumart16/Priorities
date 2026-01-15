'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowRight } from 'lucide-react';
import QuickCapture from './QuickCapture';

interface BrainDumpProps {
    onComplete: (items: string[]) => void;
    existingCount: number;
}

export default function BrainDump({ onComplete, existingCount }: BrainDumpProps) {
    const [items, setItems] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            setItems([...items, inputValue.trim()]);
            setInputValue('');
        }
    };

    const handleFinish = () => {
        if (items.length > 0 || existingCount > 0) {
            onComplete(items); // Even if empty, if tasks exist in DB, we proceed
        }
    };

    useEffect(() => {
        inputRef.current?.focus();
    }, [items]);

    return (
        <div className="flex flex-col h-full items-center justify-center p-6 space-y-8 max-w-2xl mx-auto w-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-2"
            >
                <h1 className="text-3xl font-light tracking-tight text-white">Unload Your Mind</h1>
                <p className="text-zinc-400">Dump everything holding your attention. Don't organize.</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="w-full relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-6 py-4 text-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
                <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 transition-colors"
                    disabled={!inputValue.trim()}
                >
                    <Plus size={20} />
                </button>
            </form>

            <div className="w-full space-y-2 max-h-[40vh] overflow-y-auto">
                <AnimatePresence>
                    {items.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass p-4 rounded-lg flex items-center justify-between group"
                        >
                            <span className="text-zinc-200">{item}</span>
                            <button
                                onClick={() => setItems(items.filter((_, i) => i !== idx))}
                                className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all"
                            >
                                ×
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {existingCount > 0 && items.length === 0 && (
                    <div className="text-center p-4 text-zinc-600 italic">
                        {existingCount} pending items waiting from previous sessions...
                    </div>
                )}
            </div>

            {(items.length > 0 || existingCount > 0) && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={handleFinish}
                    className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-zinc-200 transition-colors"
                >
                    Process Items <ArrowRight size={18} />
                </motion.button>
            )}

            <QuickCapture />
        </div>
    );
}
