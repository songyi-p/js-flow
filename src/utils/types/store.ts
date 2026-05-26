import type { FuncMap, ScopeEnv, Task } from "./parser";

export type FlowPhase = "idle" | "ready" | "running" | "done";

export interface ConsoleEntry {
  id: string;
  message: string;
  kind: "log" | "warn" | "error" | "system";
}

export interface FlowState {
  callStack: Task[];
  macroQueue: Task[];
  microQueue: Task[];
  funcMap: FuncMap;
  consoleLog: ConsoleEntry[];
  phase: FlowPhase;
  activeTaskId: string | null;
  scopeChain: ScopeEnv[];
  lineIndex: number;
  globalScripts: Task[];
}

export interface FlowActions {
  setCallStack: (tasks: Task[]) => void;
  pushToCallStack: (task: Task) => void;
  setMacroQueue: (tasks: Task[]) => void;
  pushToMacroQueue: (task: Task) => void;
  setMicroQueue: (tasks: Task[]) => void;
  pushToMicroQueue: (task: Task) => void;
  setFuncMap: (funcMap: FuncMap) => void;
  setPhase: (phase: FlowPhase) => void;
  setActiveTaskId: (id: string | null) => void;
  pushLog: (message: string, kind?: ConsoleEntry["kind"]) => void;
  clearConsole: () => void;
  reset: () => void;
  pushScope: (env: ScopeEnv) => void;
  popScope: () => void;
  setGlobalScripts: (scripts: Task[]) => void;
  incrementLineIndex: () => void;
}
