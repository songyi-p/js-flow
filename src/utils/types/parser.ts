interface BaseTask {
  id: string;
  task: string;
}

interface StackTask extends BaseTask {
  type: "stack" | "micro" | "macro";
  bodyTasks?: Task[];
  nextChain?: Task[];
}

interface DeclarationTask extends BaseTask {
  type: "declaration";
  varName: string;
  varValue: string;
}

export type Task = StackTask | DeclarationTask;

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
