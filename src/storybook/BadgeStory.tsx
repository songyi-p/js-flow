import Badge from "@/components/common/Badge";

export default function BadgeStory() {
  return (
    <section className="flex gap-4">
      <Badge name="실행 중" variant="stack" />
      <Badge name="실행 중" variant="micro" />
      <Badge name="실행 중" variant="macro" />
    </section>
  );
}
