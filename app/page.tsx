import { BackgroundLines } from "@/components/ui/background-lines";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { VideoText } from "@/components/ui/video-text";
import Image from "next/image";

export default function Home() {
  return (
    <div className="mb-600">
      <BackgroundLines>
        <ContainerScroll
          titleComponent={
            <div className="relative h-30 w-full overflow-hidden">
              <VideoText
                fontSize={12}
                src="/text-video.mp4">
                VÄLKOMMEN
              </VideoText>
            </div>
          }>
          <Image
            src="/title.jpg"
            alt="Hero image"
            unoptimized
            height={720}
            width={1280}
            className="w-full h-full object-cover rounded-xl"
          />
        </ContainerScroll>
      </BackgroundLines>
    </div>
  );
}
