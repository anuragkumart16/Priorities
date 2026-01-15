'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Task } from '@/lib/db';
import { Clock, MousePointer2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface DecisionSessionProps {
    tasks: Task[];
    onSelect: (task: Task, method: 'manual' | 'auto') => void;
    mode: 'urgent' | 'backlog';
}

const TIMER_DURATION = 60; // 60 seconds

export default function DecisionSession({ tasks, onSelect, mode }: DecisionSessionProps) {
    const [candidates] = useState(() => tasks.slice(0, 5)); // Take top 5
    const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);

    useEffect(() => {
        if (timeLeft <= 0) {
            // Auto-select the first one (highest priority/impact assumption)
            onSelect(candidates[0], 'auto');
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, candidates, onSelect]);

    const progress = (timeLeft / TIMER_DURATION) * 100;

    return (
        <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto w-full p-6 space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-light text-white">
                    {mode === 'urgent' ? 'Urgent Action Required' : 'Commit to One'}
                </h2>
                <p className="text-zinc-400">
                    {mode === 'urgent'
                        ? 'Select the most critical task to tackle now.'
                        : 'No fires detected. Select the highest impact action from your backlog.'}
                </p>
            </div>

            {/* Timer Bar */}
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden relative">
                <motion.div
                    className={twMerge("h-full absolute left-0 top-0 bg-indigo-500", timeLeft < 10 && "bg-red-500")}
                    initial={{ width: "100%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                />
            </div>
            <div className="flex items-center gap-2 text-zinc-500 font-mono text-sm">
                <Clock size={16} /> {timeLeft}s remaining
            </div>

            <div className="w-full grid gap-4">
                {candidates.map((task, idx) => (
                    <motion.button
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => onSelect(task, 'manual')}
                        className="group glass-card p-6 rounded-xl text-left hover:bg-zinc-800 transition-all border-l-4 border-l-transparent hover:border-l-indigo-500 flex items-center justify-between"
                    >
                        <span className="text-lg text-zinc-200 font-medium group-hover:text-white">{task.text}</span>
                        <MousePointer2 className="opacity-0 group-hover:opacity-100 text-indigo-400 transition-opacity" size={20} />
                    </motion.button>
                ))}
            </div>

            {tasks.length > 5 && (
                <p className="text-zinc-600 text-xs text-center">
                    + {tasks.length - 5} other {mode === 'urgent' ? 'urgent' : 'pending'} items hidden to prevent paralysis.
                </p>
            )}
        </div>
    );
}
