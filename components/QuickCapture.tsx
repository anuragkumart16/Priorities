'use client';
import { useState } from 'react';
import { db } from '@/lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, Plus } from 'lucide-react';

export default function QuickCapture() {
    const [showQuickCapture, setShowQuickCapture] = useState(false);
    const [quickTask, setQuickTask] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [savedFeedback, setSavedFeedback] = useState(false);

    const handleQuickCapture = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!quickTask.trim()) return;

        setIsSaving(true);
        try {
            await db.tasks.add({
                text: quickTask,
                isUrgent: true,
                createdAt: new Date(),
                status: 'pending'
            });

            setQuickTask('');
            setShowQuickCapture(false);
            setSavedFeedback(true);
            setTimeout(() => setSavedFeedback(false), 2000);
        } catch (error) {
            console.error('Failed to save task:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <div className="absolute bottom-8 right-8 z-20 flex flex-col items-end gap-2">
                <AnimatePresence>
                    {savedFeedback && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg border border-green-500/30 text-sm font-medium"
                        >
                            Captured for later
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={() => setShowQuickCapture(true)}
                    className="p-4 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-indigo-400 hover:border-indigo-500 transition-all shadow-lg group"
                    title="Quick Capture Urgent Task"
                >
                    <Zap className="group-hover:fill-indigo-400/20" size={24} />
                </button>
            </div>

            <AnimatePresence>
                {showQuickCapture && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative"
                        >
                            <button
                                onClick={() => setShowQuickCapture(false)}
                                className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"
                            >
                                <X size={20} />
                            </button>

                            <h3 className="text-xl font-medium text-white mb-1">Quick Capture</h3>
                            <p className="text-zinc-500 text-sm mb-6">Something urgent came up? Dump it here and get back to focus.</p>

                            <form onSubmit={handleQuickCapture} className="flex gap-2">
                                <input
                                    autoFocus
                                    type="text"
                                    value={quickTask}
                                    onChange={(e) => setQuickTask(e.target.value)}
                                    placeholder="What's urgent?"
                                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape') setShowQuickCapture(false);
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={!quickTask.trim() || isSaving}
                                    className="px-4 py-3 bg-indigo-600 rounded-xl text-white font-medium hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSaving ? 'Saving...' : <Plus size={24} />}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
