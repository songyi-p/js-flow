import Button from "@/components/common/Button";
import { Play, RotateCcw, AlertTriangle, Atom } from "lucide-react";

export default function ButtonStory() {
  return (
    <>
      {/* 1. 사각형 텍스트 버튼 (shape="square") */}
      <section className="mb-4 space-y-4 rounded-2xl border border-gray-200 bg-gray-900 p-6 shadow-sm">
        <h3 className="font-medium">1. 사각형 텍스트 타입</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Default</Button>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled>Default</Button>
          <Button variant="primary" disabled>
            Primary
          </Button>
          <Button variant="secondary" disabled>
            Secondary
          </Button>
          <Button variant="danger" disabled>
            Danger
          </Button>
        </div>
      </section>

      {/* 2. 원형 아이콘 버튼 세트 (shape="round") */}
      <section className="space-y-4 rounded-2xl border border-gray-200 bg-gray-900 p-6 shadow-sm">
        <h3 className="font-medium">2. 원형 아이콘 타입</h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <Button shape="round">
              <Atom size={20} />
            </Button>
            <span className="py-2 text-sm">Default</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Button variant="primary" shape="round">
              <Play size={20} fill="currentColor" />
            </Button>
            <span className="py-2 text-sm">Primary</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Button variant="secondary" shape="round">
              <RotateCcw size={20} />
            </Button>
            <span className="py-2 text-sm">Secondary</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Button variant="danger" shape="round">
              <AlertTriangle size={20} />
            </Button>
            <span className="py-2 text-sm">Danger</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Button variant="primary" shape="round" disabled>
              <Play size={20} fill="currentColor" />
            </Button>
            <span className="py-2 text-sm">Disabled</span>
          </div>
        </div>
      </section>
    </>
  );
}
