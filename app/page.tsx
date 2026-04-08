"use client";

import CircularGallery from "@/components/CircularGallery";
import TrueFocus from "@/components/TrueFocus";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { BackgroundLines } from "@/components/ui/background-lines";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import FooterSection from "@/components/ui/footer";
import IntroductionSection from "@/components/ui/introduction-section";
import { MacbookScroll } from "@/components/ui/macbook-scroll";
import { SparklesCore } from "@/components/ui/sparkles";
import { VideoText } from "@/components/ui/video-text";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const testimonials = [
    {
      quote:
        "Pixel Scout har helt förändrat mitt arbete som fotograf. Möjligheten att hantera alla mina bilder och bokningar på ett ställe sparar mig timmar varje vecka.",
      name: "Mike Aker",
      designation: "Bröllopsfotograf",
      src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "Som kommersiell fotograf behövde jag ett enkelt sätt att organisera projekt och presentera bilder för klienter. Pixel Scout löste alla mina behov perfekt.",
      name: "Alice Rodriguez",
      designation: "Kommersiell Fotograf",
      src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "Redaktionsfotografin kräver effektivitet och Pixel Scout gör arbetsflödet sömlös. Mina klienter älskar de vackra galleripresentationerna.",
      name: "Hakam Watson",
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
      name: "Ali Ibrahim",
      designation: "Eventfotograf & Studioproducent",
      src: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=2592&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

  return (
    <div>
      {/*--------- title section ----------*/}
      <BackgroundLines className="sm:pb-300 pb-200">
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
      <TrueFocus sentence="Fånga varje ögonblick,  vårda varje minne,  dela varje berättelse." blurAmount={2} />
      <div className="mt-30" style={{ height: "600px", position: "relative" }}>
        <CircularGallery
          bend={isSmallScreen ? 0.5 : 2}
          textColor="red"
          borderRadius={0.05}
          scrollEase={0.01}
          scrollSpeed={8}
        />
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
      <div className="w-full overflow-hidden pb-100 sm:pb-1">
        <MacbookScroll
          title={
            <span>
              Allt du behöver för att utveckla som fotograf. <br />
              På en och samma ställe.
            </span>
          }
          src={`/macbook.png`}
          showGradient={false}
        />
      </div>

      {/*--------- Introduction strip ----------*/}
      <IntroductionSection />

      {/*--------- CTA section ----------*/}
      <section className="relative py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          {/* CTA Card */}
          <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-slate-900 to-slate-950 p-12 md:p-20 text-center relative overflow-hidden">
            {/* Background gradient effect */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20"></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
              {/* Top accent */}
              <div className="inline-block mb-6">
                <span className="text-sm font-semibold tracking-widest text-blue-300 uppercase opacity-80">
                  Börja nu
                </span>
              </div>

              {/* Headline */}
              <h2 className="text-xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Hantera, dela och väx din fotograferingsverksamhet.
              </h2>

              {/* Description */}
              <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
                Allt du behöver för att organisera bilder, leverera gallerier till klienter och hantera din verksamhet
                från en plats.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/sign-up"
                  className="px-8 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-all duration-300 inline-block hover:scale-103 active:scale-95">
                  Kom Igång
                </a>
                <a
                  href="/gallery"
                  className="px-8 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all duration-300 inline-block border border-slate-600 hover:scale-103 active:scale-95">
                  Utforska galleriet
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*--------- footer section ----------*/}
      <FooterSection />
    </div>
  );
}
