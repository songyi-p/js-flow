import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface FlowState {
  code: string;
}

export const useFlowStore = create<FlowState>()(
  immer(() => ({
    code: "function main() {}",
  })),
);
