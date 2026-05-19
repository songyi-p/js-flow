import ButtonStory from "./ButtonStory";

export default function StoryBook() {
  return (
    <>
      <article className="max-w-2xl rounded-2xl border-[1.5px] border-gray-500 p-6">
        <h2 className="mb-4 font-semibold">Button 컴포넌트</h2>
        <ButtonStory />
      </article>
    </>
  );
}
