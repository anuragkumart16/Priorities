import Dexie, { Table } from 'dexie';

export interface Task {
  id?: number;
  text: string;
  isUrgent: boolean;
  createdAt: Date;
  status: 'pending' | 'active' | 'completed' | 'dismissed';
  doneDefinition?: string;
}

export interface DecisionLog {
  id?: number;
  taskId: number;
  chosenAt: Date;
  method: 'manual' | 'auto';
  completedAt?: Date;
}

class PriorityDb extends Dexie {
  tasks!: Table<Task>;
  logs!: Table<DecisionLog>;

  constructor() {
    super('PriorityEngineDb');
    this.version(1).stores({
      tasks: '++id, status, isUrgent, createdAt',
      logs: '++id, taskId, chosenAt'
    });
  }
}

export const db = new PriorityDb();
