import type { FlowActions, FlowState } from "@/utils/types/store";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

const INITIAL_STATE: FlowState = {
  callStack: [],
  macroQueue: [],
  microQueue: [],
  funcMap: {},
  consoleLog: [{ id: crypto.randomUUID(), message: "시뮬레이터 준비 완료", kind: "system" }],
  phase: "idle",
  activeTaskId: null,
  scopeChain: [{}],
  lineIndex: 0,
  globalScripts: [],
  funcCallStack: [],
};

export const useFlowStore = create<FlowState & FlowActions>()(
  immer((set) => ({
    ...INITIAL_STATE,
    updateStore: (fn) =>
      set((s) => {
        fn(s);
      }),
    setCallStack: (tasks) =>
      set((s) => {
        s.callStack = tasks;
      }),
    pushToCallStack: (task) =>
      set((s) => {
        s.callStack.push(task);
      }),
    setMacroQueue: (tasks) =>
      set((s) => {
        s.macroQueue = tasks;
      }),
    pushToMacroQueue: (task) =>
      set((s) => {
        s.macroQueue.push(task);
      }),
    setMicroQueue: (tasks) =>
      set((s) => {
        s.microQueue = tasks;
      }),
    pushToMicroQueue: (task) =>
      set((s) => {
        s.microQueue.push(task);
      }),
    setFuncMap: (funcMap) =>
      set((s) => {
        s.funcMap = funcMap;
      }),
    setPhase: (phase) =>
      set((s) => {
        s.phase = phase;
      }),
    setActiveTaskId: (id) =>
      set((s) => {
        s.activeTaskId = id;
      }),
    pushLog: (message, kind = "log") =>
      set((s) => {
        s.consoleLog.push({ id: crypto.randomUUID(), message, kind });
      }),
    clearConsole: () =>
      set((s) => {
        s.consoleLog = [];
      }),
    pushScope: (env) =>
      set((s) => {
        s.scopeChain.push(env);
      }),
    popScope: () =>
      set((s) => {
        s.scopeChain.pop();
      }),
    setGlobalScripts: (scripts) =>
      set((s) => {
        s.globalScripts = scripts;
      }),
    incrementLineIndex: () =>
      set((s) => {
        s.lineIndex += 1;
      }),
    reset: () =>
      set(() => ({
        ...INITIAL_STATE,
        consoleLog: [
          { id: crypto.randomUUID(), message: "시뮬레이터 준비 완료", kind: "system" as const },
        ],
      })),
  })),
);
