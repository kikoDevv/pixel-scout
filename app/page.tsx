import { BackgroundLines } from "@/components/ui/background-lines";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { VideoText } from "@/components/ui/video-text";

export default function Home() {
  return (
    <div className="">
      <BackgroundLines>
        <ContainerScroll
          titleComponent={
            <div className="relative h-30 w-full overflow-hidden">
              <VideoText
                fontSize={12}
                src="https://videos.pexels.com/video-files/1918465/1918465-uhd_2560_1440_24fps.mp4">
                VÄLKOMMEN
              </VideoText>
            </div>
          }>
          {" "}
        </ContainerScroll>
      </BackgroundLines>
    </div>
  );
}
