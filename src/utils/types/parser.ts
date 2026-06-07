interface BaseTask {
  id: string;
  task: string;
}

interface StackTask extends BaseTask {
  type: "stack" | "micro" | "macro";
  bodyTasks?: Task[];
}

export interface ChainStep {
  bodyTasks: Task[];
  callbackParams: string[];
  resolvedValue?: string;
}

export interface MicroTask extends BaseTask {
  type: "micro";
  chain: ChainStep[];
}

interface DeclarationTask extends BaseTask {
  type: "declaration";
  varName: string;
  varValue: string;
}

export type Task = StackTask | MicroTask | DeclarationTask;

export interface MicroQueueItem {
  id: string;
  task: string;
  type: "micro";
  bodyTasks: Task[];
  callbackParams: string[];
  resolvedValue?: string;
  nextChain?: MicroQueueItem;
}

export interface FuncEntry {
  tasks: Task[];
  params: string[];
}

export interface FuncMap {
  [funcName: string]: FuncEntry;
}

export interface ParseResult {
  mainScript: Task[];
  funcMap: FuncMap;
}

export type ScopeEnv = Record<string, string>;
