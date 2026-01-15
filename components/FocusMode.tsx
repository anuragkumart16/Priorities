'use client';
import { Task } from '@/lib/db';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface FocusModeProps {
    task: Task;
    onComplete: () => void;
}

export default function FocusMode({ task, onComplete }: FocusModeProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full bg-black relative overflow-hidden">
            {/* Ambient background pulse */}
            <motion.div
                animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-radial-gradient from-indigo-900/20 to-transparent pointer-events-none"
            />

            <div className="relative z-10 max-w-2xl w-full p-8 text-center space-y-12">
                <div className="space-y-4">
                    <span className="text-zinc-500 uppercase tracking-widest text-sm font-medium">Currently Executing</span>
                    <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                        {task.text}
                    </h1>
                </div>

                <div className="glass p-6 rounded-xl border-l-4 border-l-green-500 text-left">
                    <span className="text-xs text-zinc-500 uppercase font-bold block mb-2">Definition of Done</span>
                    <p className="text-xl text-zinc-200">{task.doneDefinition}</p>
                </div>

                <button
                    onClick={onComplete}
                    className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-full transition-all hover:scale-105"
                >
                    <div className="absolute inset-0 border border-zinc-700 rounded-full group-hover:border-green-500 transition-colors"></div>
                    <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
                    <span className="relative flex items-center gap-3 text-zinc-300 group-hover:text-green-400 font-medium text-lg">
                        <CheckCircle2 size={24} /> Mark as Complete
                    </span>
                </button>
            </div>
        </div>
    );
}
