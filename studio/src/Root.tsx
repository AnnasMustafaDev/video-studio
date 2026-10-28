import { Composition, Folder } from "remotion";
import { LibraryShowcase } from "./videos/library-showcase/LibraryShowcase";
import { ShowcaseVertical } from "./videos/library-showcase/ShowcaseVertical";
import { SHOWCASE_DURATION } from "./videos/library-showcase/timeline";
import { Template } from "./videos/_template/Template";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Library">
        <Composition
          id="LibraryShowcase"
          component={LibraryShowcase}
          durationInFrames={SHOWCASE_DURATION}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="Showcase-Vertical"
          component={ShowcaseVertical}
          durationInFrames={255}
          fps={30}
          width={1080}
          height={1920}
        />
      </Folder>
      <Folder name="Templates">
        <Composition
          id="Template"
          component={Template}
          durationInFrames={90}
          fps={30}
          width={1920}
          height={1080}
        />
      </Folder>
    </>
  );
};
