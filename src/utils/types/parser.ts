export interface Task {
  id: string;
  task: string;
  type: "stack" | "micro" | "macro";
}

export interface FuncMap {
  [funcName: string]: {
    tasks: Task[];
  };
}

export interface ParseResult {
  mainScript: Task[];
  funcMap: FuncMap;
}

export type ScopeEnv = Record<string, string>;
