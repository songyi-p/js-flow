import BadgeStory from "./BadgeStory";
import ButtonStory from "./ButtonStory";
import LayoutStory from "./LayoutStory";

export default function StoryBook() {
  return (
    <>
      <LayoutStory name="Button">
        <ButtonStory />
      </LayoutStory>
      <LayoutStory name="Badge">
        <BadgeStory />
      </LayoutStory>
    </>
  );
}
