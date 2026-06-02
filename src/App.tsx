import { useCallStack } from "@/hooks/useCallStack";
import { Layout, Dashboard } from "@/components/common";
import { CallStack, CodeEditor, Terminal } from "@/components/dashboard";
// import StoryBook from "./storybook";

const DEFAULT_CODE = `console.log('시작');
 
function multiply(a, b) {
  console.log(a * b);
}
 
multiply(2, 3);
console.log('종료');`;

export default function App() {
  const { callStack, consoleLog, phase, canStep, activeTaskId, run, step, reset, clearConsole } =
    useCallStack();

  return (
    <Layout onStep={step} onReset={reset} canStep={canStep}>
      <main className="flex flex-1 flex-col gap-4">
        <div className="grid grid-cols-7 gap-4">
          <div className="col-span-2">
            <CodeEditor initialCode={DEFAULT_CODE} phase={phase} onRun={run} />
          </div>

          <div className="col-span-5 grid grid-cols-10 gap-4">
            <div className="col-span-3">
              <CallStack tasks={callStack} activeTaskId={activeTaskId} />
            </div>
            {/* TODO : 추후 components/dashboard 폴더 내 컴포넌트화 예정 */}
            <div className="col-span-3">
              <Dashboard title="🔄 이벤트 루프 | Event-Loop" isRunning={false}>
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  준비 중
                </div>
              </Dashboard>
            </div>
            <div className="col-span-4 flex flex-col gap-4">
              <Dashboard title="🧬 마이크로 큐 | Micro-Queue" variant="micro" isRunning={false}>
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  비어 있음
                </div>
              </Dashboard>
              <Dashboard title="⏳ 매크로 큐 | Macro-Queue" variant="macro" isRunning={false}>
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  비어 있음
                </div>
              </Dashboard>
            </div>
          </div>
        </div>

        <Terminal logs={consoleLog} onClear={clearConsole} />
      </main>

      {/* <StoryBook /> */}
    </Layout>
  );
}
