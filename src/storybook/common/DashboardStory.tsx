import Badge from "@/components/common/Badge";
import Dashboard from "@/components/common/Dashboard";

export default function DashboardStory() {
  return (
    <div className="p-6">
      <Dashboard
        title="엔진 콜스택"
        variant="stack"
        headerRight={<Badge name="실행 중" variant="stack" />}
      >
        <div className="min-h-75 rounded-xl bg-gray-50 p-4" />
      </Dashboard>
      <Dashboard
        title="브라우저 콘솔 출력 결과 (Console)"
        className="mt-6"
        headerRight={
          <button className="text-xs text-gray-400 transition-colors hover:text-gray-600">
            기록 삭제
          </button>
        }
      >
        <div className="min-h-40" />
      </Dashboard>
    </div>
  );
}
