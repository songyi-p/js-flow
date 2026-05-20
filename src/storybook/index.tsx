import BadgeStory from "./common/BadgeStory";
import ButtonStory from "./common/ButtonStory";
import LayoutStory from "./LayoutStory";
import TaskBoxStory from "./common/TaskBoxStory";

export default function StoryBook() {
  return (
    <>
      <LayoutStory name="Button">
        <ButtonStory />
      </LayoutStory>
      <LayoutStory name="Badge">
        <BadgeStory />
      </LayoutStory>
      <LayoutStory name="TaskBox">
        <TaskBoxStory />
      </LayoutStory>
    </>
  );
}
