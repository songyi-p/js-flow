import type { ReactNode } from "react";

export default function LayoutStory({ name, children }: { name: string; children: ReactNode }) {
  return (
    <article className="mb-6 max-w-2xl rounded-2xl border border-gray-500 p-6">
      <h2 className="font-semibold">{name} 컴포넌트</h2>
      <hr className="my-4 border-gray-300" />
      {children}
    </article>
  );
}
