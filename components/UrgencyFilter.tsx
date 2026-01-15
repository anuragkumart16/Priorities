'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/lib/db';
import { Check, X, AlertCircle } from 'lucide-react';

interface UrgencyFilterProps {
    tasks: Task[];
    onComplete: (urgentTasks: Task[]) => void;
}

export default function UrgencyFilter({ tasks, onComplete }: UrgencyFilterProps) {
    const [index, setIndex] = useState(0);
    const [urgentTasks, setUrgentTasks] = useState<Task[]>([]);
    const [direction, setDirection] = useState(0);

    const currentTask = tasks[index];

    const handleDecision = (isUrgent: boolean) => {
        setDirection(isUrgent ? 1 : -1);

        if (isUrgent) {
            setUrgentTasks(prev => [...prev, currentTask]);
        }

        setTimeout(() => {
            if (index < tasks.length - 1) {
                setIndex(index + 1);
                setDirection(0);
            } else {
                // Finished
                const finalUrgent = isUrgent ? [...urgentTasks, currentTask] : urgentTasks;
                onComplete(finalUrgent);
            }
        }, 200); // Small delay for animation
    };

    if (!currentTask) return null;

    return (
        <div className="flex flex-col items-center justify-center h-full max-w-xl mx-auto w-full p-6 text-center space-y-8">
            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-medium border border-indigo-500/20">
                    <AlertCircle size={14} /> Urgency Filter
                </div>
                <h2 className="text-2xl font-light text-zinc-400">
                    If I don't act on this within the <span className="text-white font-medium">next 24 hours</span>, will something break, expire, or penalize me?
                </h2>
            </div>

            <div className="relative w-full h-64 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentTask.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{
                            opacity: 0,
                            x: direction * 100,
                            rotate: direction * 10
                        }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <div className="glass-card w-full p-8 rounded-2xl flex items-center justify-center min-h-[200px]">
                            <p className="text-3xl font-medium text-white">{currentTask.text}</p>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="flex gap-4 w-full">
                <button
                    onClick={() => handleDecision(false)}
                    className="flex-1 flex flex-col items-center justify-center gap-2 py-6 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-all group"
                >
                    <X className="text-zinc-500 group-hover:text-zinc-300" size={32} />
                    <span className="text-zinc-500 group-hover:text-zinc-300 font-medium">Defer</span>
                </button>

                <button
                    onClick={() => handleDecision(true)}
                    className="flex-1 flex flex-col items-center justify-center gap-2 py-6 rounded-xl bg-zinc-900 border border-indigo-500/30 hover:bg-indigo-500/10 hover:border-indigo-500 transition-all group"
                >
                    <Check className="text-indigo-400 group-hover:text-indigo-300" size={32} />
                    <span className="text-indigo-400 group-hover:text-indigo-300 font-medium bold">Urgent</span>
                </button>
            </div>

            <p className="text-zinc-600 text-sm">
                {index + 1} of {tasks.length}
            </p>
        </div>
    );
}
