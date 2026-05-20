import Badge from "@/components/common/Badge";

export default function BadgeStory() {
  return (
    <section className="flex gap-4">
      <Badge name="stack" variant="stack" />
      <Badge name="micro" variant="micro" />
      <Badge name="macro" variant="macro" />
    </section>
  );
}
