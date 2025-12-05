import CircularGallery from "@/components/CircularGallery";
import TrueFocus from "@/components/TrueFocus";
import { ThreeDMarquee } from "@/components/ui/3d-marquee";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { BackgroundLines } from "@/components/ui/background-lines";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { MacbookScroll } from "@/components/ui/macbook-scroll";
import { SparklesCore } from "@/components/ui/sparkles";
import { VideoText } from "@/components/ui/video-text";
import Image from "next/image";

export default function Home() {
  const testimonials = [
    {
      quote:
        "Pixel Scout har helt förändrat mitt arbete som fotograf. Möjligheten att hantera alla mina bilder och bokningar på ett ställe sparar mig timmar varje vecka.",
      name: "Sarah Chen",
      designation: "Bröllopsfotograf",
      src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "Som kommersiell fotograf behövde jag ett enkelt sätt att organisera projekt och presentera bilder för klienter. Pixel Scout löste alla mina behov perfekt.",
      name: "Michael Rodriguez",
      designation: "Kommersiell Fotograf",
      src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "Redaktionsfotografin kräver effektivitet och Pixel Scout gör arbetsflödet sömlös. Mina klienter älskar de vackra galleripresentationerna.",
      name: "Emily Watson",
      designation: "Redaktionsfotograf",
      src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "Porträttfotografi handlar om att fånga ögonblick. Med Pixel Scout kan jag fokusera på min konst istället för administrationen.",
      name: "James Kim",
      designation: "Porträttfotograf",
      src: "https://images.unsplash.com/photo-1636041293178-808a6762ab39?q=80&w=3464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "Från evenemangsfotografi till produktfoto, Pixel Scout har skalats perfekt med min växande verksamhet. Absolut rekommenderad för alla fotografer.",
      name: "Lisa Thompson",
      designation: "Eventfotograf & Studioproducent",
      src: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=2592&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

  /*--------- Image data for slider ----------*/
  const images = [
    "/splash/pexels-bayfilm9-19746370.jpg",
    "/splash/pexels-cigdem-bilgin-2154409770-35014789.jpg",
    "/splash/pexels-ebahir-34724908.jpg",
    "/splash/pexels-esra-afsar-123882149-34644108.jpg",
    "/splash/pexels-frank-wesneck-2154020533-34513549.jpg",
    "/splash/pexels-galina-kolonitskaia-485466282-33486190.jpg",
    "/splash/pexels-hatice-796619215-27731412.jpg",
    "/splash/pexels-jit-roy-2028348030-31136767.jpg",
    "/splash/pexels-marco-alhelm-1479977387-26937015.jpg",
    "/splash/pexels-nerosable-31365474.jpg",
    "/splash/pexels-nicole-seidl-35046781.jpg",
    "/splash/pexels-pat-saengcharoen-774865114-31641491.jpg",
    "/splash/pexels-seats-photographix-1039095083-20747753.jpg",
    "/splash/pexels-selcuk-g-2157682854-34894148.jpg",
    "/splash/pexels-zzzzlz-17654643.jpg",
    "/splash/pexels-bayfilm9-19746370.jpg",
    "/splash/pexels-cigdem-bilgin-2154409770-35014789.jpg",
    "/splash/pexels-ebahir-34724908.jpg",
    "/splash/pexels-esra-afsar-123882149-34644108.jpg",
    "/splash/pexels-frank-wesneck-2154020533-34513549.jpg",
    "/splash/pexels-galina-kolonitskaia-485466282-33486190.jpg",
    "/splash/pexels-hatice-796619215-27731412.jpg",
    "/splash/pexels-jit-roy-2028348030-31136767.jpg",
    "/splash/pexels-marco-alhelm-1479977387-26937015.jpg",
    "/splash/pexels-nerosable-31365474.jpg",
    "/splash/pexels-nicole-seidl-35046781.jpg",
    "/splash/pexels-pat-saengcharoen-774865114-31641491.jpg",
    "/splash/pexels-seats-photographix-1039095083-20747753.jpg",
    "/splash/pexels-selcuk-g-2157682854-34894148.jpg",
    "/splash/pexels-zzzzlz-17654643.jpg",
    "/splash/pexels-bayfilm9-19746370.jpg",
    "/splash/pexels-cigdem-bilgin-2154409770-35014789.jpg",
  ];

  return (
    <div>
      {/*--------- title section ----------*/}
      <BackgroundLines className="sm:pb-300 pb-250">
        <ContainerScroll
          titleComponent={
            <div className="relative  sm:h-45 h-20 w-full overflow-hidden">
              <h1 className="font-black sm:text-4xl text-md bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tighter">
                VÄLKOMMEN TILL
              </h1>
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
      <TrueFocus sentence="Fånga varje ögonblick,  vårda varje minne,  dela varje berättelse." blurAmount={5} />
      <div className="mt-100" style={{ height: "600px", position: "relative" }}>
        <CircularGallery bend={3} textColor="red" borderRadius={0.05} scrollEase={0.009} scrollSpeed={8} />
      </div>

      {/*--------- Photograpthers section ----------*/}
      <div className="overflow-hidden">
        <AnimatedTestimonials testimonials={testimonials} />
      </div>

      {/*--------- sparkles section ----------*/}
      <div className="w-full bg-white flex flex-col items-center justify-center overflow-hidden rounded-md">
        <h1 className="md:text-7xl text-3xl lg:text-9xl font-bold text-center text-slate-900 relative z-20">
          Bli en av oss!
        </h1>
        <div className="w-[40rem] h-40 relative">
          {/* Gradients */}
          <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent h-[2px] w-3/4 blur-sm" />
          <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px w-3/4" />
          <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-purple-400 to-transparent h-[5px] w-1/4 blur-sm" />
          <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent h-px w-1/4" />

          {/* Core component */}
          <SparklesCore
            background="transparent"
            minSize={0.4}
            maxSize={1.5}
            particleDensity={1900}
            className="w-full"
            particleColor="#0ea5e9"
          />
          <div className="absolute inset-0 w-full h-full bg-white [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
        </div>
      </div>
      {/*--------- animated macbook section ----------*/}
      <div className="w-full overflow-hidden bg-white">
        <MacbookScroll
          title={
            <span>
              This Macbook is built with Tailwindcss. <br /> No kidding.
            </span>
          }
          src={`/macbook.png`}
          showGradient={false}
        />
      </div>

      {/*--------- slider section ----------*/}
      <div className="relative mx-auto flex h-screen w-full max-w-7xl flex-col items-center justify-center overflow-hidden rounded-3xl">
        <h2 className="relative z-20 mx-auto max-w-4xl text-center text-2xl font-bold text-balance text-white md:text-4xl lg:text-6xl">
          Varje{" "}
          <span className="relative z-20 inline-block rounded-xl bg-blue-500/40 px-4 py-1 text-white underline decoration-sky-500 decoration-[6px] underline-offset-[16px] backdrop-blur-sm">
            bild
          </span>{" "}
          berättar en historia.
        </h2>
        <p className="relative z-20 mx-auto max-w-2xl py-8 text-center text-sm text-neutral-200 md:text-base">
          Med Pixel Scout kan du fokusera på det du älskar - att ta fantastiska bilder. Vi hanterar säkerhet, gallerier
          och klientkommunikation så du kan göra det du gör bäst.
        </p>

        <div className="relative z-20 flex flex-wrap items-center justify-center gap-4 pt-4">
          <button className="rounded-md bg-sky-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-700 focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-black focus:outline-none">
            Börja gratis
          </button>
          <button className="rounded-md border border-white/20 bg-white/10 px-6 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black focus:outline-none">
            Läs mer
          </button>
        </div>

        {/* overlay */}
        <div className="absolute inset-0 z-10 h-full w-full bg-black/80 dark:bg-black/40" />
        <ThreeDMarquee className="pointer-events-none absolute inset-0 h-full w-full" images={images} />
      </div>
    </div>
  );
}
