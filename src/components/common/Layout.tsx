import type { ReactNode } from "react";
import Button from "./Button";

interface LayoutProps {
  onStep: () => void;
  onReset: () => void;
  canStep: boolean;
  children: ReactNode;
}

export default function Layout({ onStep, onReset, canStep, children }: LayoutProps) {
  return (
    <div className="mx-auto flex min-h-screen flex-col gap-6 bg-gray-50 p-8">
      <header className="flex items-center justify-between border-b border-gray-200 pb-5 select-none">
        <div>
          <h1 className="font-semibold text-gray-700">
            <span className="text-primary">JS Flow | </span>
            자바스크립트 런타임 시뮬레이터
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            자바스크립트 엔진의 동작 원리를 눈으로 확인하는 실시간 런타임 시뮬레이터
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="default" onClick={onReset}>
            초기화
          </Button>
          <Button variant="primary" onClick={onStep} disabled={!canStep}>
            다음 단계 진행 ▶
          </Button>
        </div>
      </header>
      {children}
      <footer className="border-t border-gray-200 pt-4 text-center text-xs text-gray-400 select-none">
        <p>© 2026 JS Flow Simulator. Powered by Acorn Parser.</p>
      </footer>
    </div>
  );
}
