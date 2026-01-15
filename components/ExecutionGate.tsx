'use client';
import { useState } from 'react';
import { Task } from '@/lib/db';
import { ArrowLeft, Play } from 'lucide-react';

interface ExecutionGateProps {
    task: Task;
    onConfirm: (definition: string) => void;
    onCancel: () => void;
}

export default function ExecutionGate({ task, onConfirm, onCancel }: ExecutionGateProps) {
    const [definition, setDefinition] = useState(task.doneDefinition || '');

    return (
        <div className="flex flex-col items-center justify-center h-full max-w-xl mx-auto w-full p-6 space-y-8">
            <div className="w-full">
                <button onClick={onCancel} className="text-zinc-500 hover:text-zinc-300 flex items-center gap-2 mb-8">
                    <ArrowLeft size={16} /> Back
                </button>
                <h1 className="text-3xl font-bold text-white mb-2">{task.text}</h1>
                <div className="h-1 w-20 bg-indigo-500 rounded-full mb-8"></div>

                <div className="space-y-4">
                    <label className="block text-zinc-400 text-lg">
                        What does <span className="text-white font-medium">"Done"</span> look like?
                    </label>
                    <p className="text-sm text-zinc-600">
                        Outcome-based completion only. No vague starts. No purely time-based commitments.
                    </p>
                    <textarea
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none h-32 resize-none"
                        placeholder="E.g. The email is sent. The code is committed. The trash is in the bin."
                        value={definition}
                        onChange={(e) => setDefinition(e.target.value)}
                        autoFocus
                    />
                </div>
            </div>

            <button
                onClick={() => onConfirm(definition)}
                disabled={!definition.trim() || definition.length < 5}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
            >
                <Play size={20} fill="currentColor" /> Begin Execution
            </button>
        </div>
    );
}
