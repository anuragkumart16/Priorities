'use client';

import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Task, DecisionLog } from '@/lib/db';
import BrainDump from '@/components/BrainDump';
import UrgencyFilter from '@/components/UrgencyFilter';
import DecisionSession from '@/components/DecisionSession';
import ExecutionGate from '@/components/ExecutionGate';
import FocusMode from '@/components/FocusMode';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

type SessionState = 'BRAIN_DUMP' | 'URGENCY' | 'DECISION' | 'GATE' | 'FOCUS' | 'ALL_DONE';

export default function Page() {
  const [state, setState] = useState<SessionState>('BRAIN_DUMP');
  const [sessionTasks, setSessionTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sessionMode, setSessionMode] = useState<'urgent' | 'backlog'>('urgent');

  // Stats for Brain Dump
  const pendingCount = useLiveQuery(() => db.tasks.where('status').equals('pending').count()) || 0;

  // 1. Brain Dump Phase -> Urgency
  const handleBrainDumpComplete = useCallback(async (newItems: string[]) => {
    // 1. Add new items to DB
    if (newItems.length > 0) {
      await db.tasks.bulkAdd(newItems.map(text => ({
        text,
        isUrgent: false, // Default, will determine next
        createdAt: new Date(),
        status: 'pending'
      })));
    }

    // 2. Fetch ALL pending items for Urgency Filter
    const allPending = await db.tasks.where('status').equals('pending').toArray();

    // Sort? Maybe by urgency first to quick confirm?
    // For now, simple array
    setSessionTasks(allPending);
    setState('URGENCY');
  }, []);

  // 2. Urgency Filter -> Decision
  // 2. Urgency Filter -> Decision
  const handleUrgencyComplete = useCallback(async (urgentTasks: Task[]) => {
    // We need to determine which tasks are left for the backlog.
    // The sessionTasks state might contain items we just deleted (dismissed), so we must verify against DB.

    const urgentIds = new Set(urgentTasks.map(t => t.id));
    const potentialBacklogIds = sessionTasks
      .filter(t => !urgentIds.has(t.id))
      .map(t => t.id as number);

    // Fetch only those that still exist in DB (excludes dismissed ones)
    const validBacklogTasks = await db.tasks.where('id').anyOf(potentialBacklogIds).toArray();
    const validBacklogIds = validBacklogTasks.map(t => t.id as number);

    await db.transaction('rw', db.tasks, async () => {
      // Mark urgent
      await Promise.all(urgentTasks.map(t => db.tasks.update(t.id!, { isUrgent: true })));
      // Mark non-urgent (only valid ones)
      await Promise.all(validBacklogIds.map(id => db.tasks.update(id, { isUrgent: false })));
    });

    if (urgentTasks.length > 0) {
      setSessionTasks(urgentTasks);
      setSessionMode('urgent');
      setState('DECISION');
    } else if (validBacklogTasks.length > 0) {
      // Fallback: No urgent tasks, use verified backlog
      setSessionTasks(validBacklogTasks);
      setSessionMode('backlog');
      setState('DECISION');
    } else {
      // No urgent tasks AND no backlog (everything dismissed)
      setState('ALL_DONE');
    }
  }, [sessionTasks]);

  // 3. Decision -> Gate
  const handleDecisionSelect = useCallback(async (task: Task, method: 'manual' | 'auto') => {
    setSelectedTask(task);

    // Log the decision start (optional, or log at end)

    setState('GATE');
  }, []);

  // 4. Gate -> Focus
  const handleGateConfirm = useCallback(async (definition: string) => {
    if (!selectedTask?.id) return;

    await db.tasks.update(selectedTask.id, {
      doneDefinition: definition,
      status: 'active'
    });

    // Update local state to show definition
    setSelectedTask(prev => prev ? ({ ...prev, doneDefinition: definition, status: 'active' }) : null);

    setState('FOCUS');
  }, [selectedTask]);

  // 5. Focus -> Done (Loop back to start)
  const handleFocusComplete = useCallback(async () => {
    if (!selectedTask?.id) return;

    await db.tasks.update(selectedTask.id, {
      status: 'completed'
    });

    // Log to history
    await db.logs.add({
      taskId: selectedTask.id,
      chosenAt: new Date(),
      method: 'manual',
      completedAt: new Date()
    });

    // Reset
    setSelectedTask(null);
    setSessionTasks([]);
    setState('BRAIN_DUMP');
  }, [selectedTask]);

  // Cancel Execution Gate
  const handleGateCancel = () => {
    setSelectedTask(null);
    setState('DECISION');
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-indigo-500/30">
      <AnimatePresence mode="wait">
        {state === 'BRAIN_DUMP' && (
          <motion.div key="dump" className="h-screen" exit={{ opacity: 0, y: -20 }}>
            <BrainDump onComplete={handleBrainDumpComplete} existingCount={pendingCount} />
          </motion.div>
        )}

        {state === 'URGENCY' && (
          <motion.div key="urgency" className="h-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <UrgencyFilter
              tasks={sessionTasks}
              onComplete={handleUrgencyComplete}
              onDismiss={async (task) => {
                // Remove from DB immediately. 
                // Do NOT update sessionTasks state here to avoid re-render/index mismatch in UrgencyFilter.
                // The completion handler will verify DB existence.
                if (task.id) {
                  await db.tasks.delete(task.id);
                }
              }}
            />
          </motion.div>
        )}

        {state === 'DECISION' && (
          <motion.div key="decision" className="h-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DecisionSession tasks={sessionTasks} onSelect={handleDecisionSelect} mode={sessionMode} />
          </motion.div>
        )}

        {state === 'GATE' && selectedTask && (
          <motion.div key="gate" className="h-screen" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }}>
            <ExecutionGate task={selectedTask} onConfirm={handleGateConfirm} onCancel={handleGateCancel} />
          </motion.div>
        )}

        {state === 'FOCUS' && selectedTask && (
          <motion.div key="focus" className="h-screen" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }}>
            <FocusMode task={selectedTask} onComplete={handleFocusComplete} />
          </motion.div>
        )}

        {state === 'ALL_DONE' && (
          <motion.div key="done" className="h-screen flex flex-col items-center justify-center p-8 text-center space-y-6" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="rounded-full bg-green-500/10 p-6">
              <CheckCircle2 size={64} className="text-green-500" />
            </div>
            <h1 className="text-3xl font-light text-white">All Clear</h1>
            <p className="text-zinc-400 max-w-md">
              You've handled the fires and cleared the clutter. Your mind is free.
            </p>
            <button
              onClick={() => setState('BRAIN_DUMP')}
              className="mt-8 px-6 py-3 rounded-full border border-zinc-800 text-zinc-400 hover:bg-zinc-900 transition-colors"
            >
              Start New Session
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
