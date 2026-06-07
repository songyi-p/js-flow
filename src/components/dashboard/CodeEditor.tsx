import type { FlowPhase } from "@/utils/types/store";
import { useState, useCallback } from "react";
import { Button, Dashboard } from "../common";
import { javascript } from "@codemirror/lang-javascript";
import CodeMirror from "@uiw/react-codemirror";

interface CodeEditorProps {
  initialCode: string;
  phase: FlowPhase;
  onRun: (code: string) => void;
}

export default function CodeEditor({ initialCode, phase, onRun }: CodeEditorProps) {
  const [userCode, setUserCode] = useState(initialCode);

  const handleCodeChange = useCallback((value: string) => {
    setUserCode(value);
  }, []);

  const isDisabled = phase === "ready" || phase === "running";

  return (
    <Dashboard title="코드 편집기" isRunning={phase === "running"}>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-2">
        <CodeMirror
          value={userCode}
          height="320px"
          extensions={[javascript({ jsx: true })]}
          onChange={handleCodeChange}
          theme="light"
          readOnly={isDisabled}
        />
      </div>
      <Button
        variant="primary"
        className="mt-4 w-full py-3"
        onClick={() => onRun(userCode)}
        disabled={isDisabled}
      >
        ⚡ 스크립트 코드 실행
      </Button>
    </Dashboard>
  );
}
