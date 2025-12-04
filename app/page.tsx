
import TrueFocus from "@/components/TrueFocus";
import { BackgroundLines } from "@/components/ui/background-lines";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { VideoText } from "@/components/ui/video-text";
import Image from "next/image";

export default function Home() {
  return (
    <div className="mb-600">
      {/*--------- title section ----------*/}
      <BackgroundLines className="sm:pb-300 pb-250">
        <ContainerScroll
          titleComponent={
            <div className="relative  sm:h-45 h-20 w-full overflow-hidden">
              <h1 className="font-black sm:text-4xl text-md bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tighter">VÄLKOMMEN TILL</h1>
              <VideoText fontSize={12} src="/text-video.mp4">
                PIXEL-SCOUT
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
      {/*--------- hero section ----------*/}
      <TrueFocus sentence="Capture every moment,  treasure every memory,  share every story." blurAmount={5}/>
    </div>
  );
}
