"use client";
import { useState } from "react";
import { FaTwitter, FaInstagram, FaGithub, FaLinkedin } from "react-icons/fa";
import { MdExpandMore } from "react-icons/md";
import FooterSection from "@/components/ui/footer";

export default function Om() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const features = [
    {
      title: "Organisera med album",
      description:
        "Skapa album för dina foton. Välj privat (dela via länk) eller offentlig (explorerbar för alla). Fullständig kontroll över vem som kan se vad.",
      icon: "📁",
    },
    {
      title: "Valfri vattenmärkning",
      description:
        "Lägg till vattenmärken eller inte - du väljer. Vi sparar både vattenmärkt och originalversion så du har flexibilitet.",
      icon: "💧",
    },
    {
      title: "Utforskningsfliken",
      description:
        "Andra användare kan utforska alla offentliga foton, gilla favoriter, kommentera och begära originalbilden från dig.",
      icon: "🔍",
    },
    {
      title: "Favoritmarkering",
      description:
        "Spara dina favoriter från utforskningsfliken. Se alla gillade foton på ett ställe för enkel åtkomst senare.",
      icon: "⭐",
    },
    {
      title: "Nedladdningsbegäran",
      description:
        "Andra kan begära originalversion utan vattenmärke från dina offentliga foton. Du godkänner eller nekar varje begäran.",
      icon: "📥",
    },
    {
      title: "Helt gratis",
      description: "Inga dolda avgifter, premiumtier eller krav på registrering. Allt är helt kostnadsfritt.",
      icon: "✨",
    },
  ];

  const steps = [
    {
      number: "1",
      title: "Skapa konto & album",
      description: "Registrera dig och skapa ett album. Välj namn och bestäm om det ska vara privat eller offentligt.",
    },
    {
      number: "2",
      title: "Ladda upp & anpassa",
      description:
        "Ladda upp dina foton. Välj om du vill lägga till vattenmärken eller inte - vi sparar båda versionerna.",
    },
    {
      number: "3",
      title: "Dela privat eller gör offentlig",
      description:
        "Dela album-länk med vänner för privat visning, eller gör foton offentliga så de blir explorerbar i utforskningsfliken för alla.",
    },
    {
      number: "4",
      title: "Interagera & handlera begäran",
      description:
        "Se när andra gilla, kommenterar eller begär originalbilden. Du godkänner begäran och de kan ladda ner originalbilden.",
    },
  ];

  const faqs = [
    {
      question: "Vad är privat kontra offentligt album?",
      answer:
        "Privat album: Du delar en specifik länk - endast de med länken kan se foton. Offentligt album: Foton blir explorerbar i utforskningsfliken för alla användare att utforska, gilla och kommentera.",
    },
    {
      question: "Hur fungerar vattenmärken?",
      answer:
        "När du skapar ett album väljer du om du vill lägga till vattenmärken eller inte. Vi sparar alltid båda versionerna - vattenmärkt för visning och original för nedladdning. Det är helt ditt val.",
    },
    {
      question: "Vad är utforskningsfliken?",
      answer:
        "Utforskningsfliken visar alla offentliga foton från alla användare. Du kan bläddra genom foton, gilla dina favoriter, lämna kommentarer och begära originalbilden från fotografen.",
    },
    {
      question: "Hur sparar jag favoriter?",
      answer:
        "I utforskningsfliken kan du gilla foton du gillar. Alla gillor sparas automatiskt i din favoritsektion för enkel åtkomst senare.",
    },
    {
      question: "Hur delar jag mitt privata album?",
      answer:
        "Kopiera albumlänken från din profil och skicka den direkt till vänner. Endast de med länken kan se albumet - det är helt privat och inte synligt för andra.",
    },
    {
      question: "Vad händer när någon begär mina originalfoton?",
      answer:
        "Du ser alla nedladdningsbegäran i din profil. Du kan välja att godkänna eller neka varje begäran. Om du godkänner kan de ladda ner originalversionen utan vattenmärke.",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 -right-40 w-80 h-80 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-80 h-80 bg-pink-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-4 pt-20 pb-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-600 to-slate-900 bg-clip-text text-transparent mb-6">
              Om Pixel Scout
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
              Skapa album och dela privat via länk eller gör foton offentliga. Utforska andra fotografers bilder, spara
              favoriter, kommentera och begär originalbilder. Du styr vattenmarkering och vem som ser dina foton. Allt
              helt gratis.
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">Hur det fungerar</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">{step.title}</h3>
                  <p className="text-gray-600 text-center text-sm">{step.description}</p>
                </div>
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-1 bg-gradient-to-r from-blue-400 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">Funktioner</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto px-4 py-16">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Vanliga frågor</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-xl overflow-hidden hover:border-blue-300/50 transition-all duration-300">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 hover:bg-blue-50/50 transition-colors">
                  <h3 className="text-lg font-semibold text-gray-900 text-left">{faq.question}</h3>
                  <MdExpandMore
                    className={`text-blue-600 transition-transform duration-300 ${
                      expandedFaq === idx ? "rotate-180" : ""
                    }`}
                    size={24}
                  />
                </button>
                {expandedFaq === idx && (
                  <div className="px-6 pb-6 border-t border-gray-200 bg-blue-50/50">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <section className="relative py-24 overflow-hidden">
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
                  Redo att börja dela dina fotografier?
                </h2>

                {/* Description */}
                <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
                  Helt gratis utan registrering eller gömda avgifter. Full kontroll över ditt arbete.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/sign-up"
                    className="px-8 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-all duration-300 inline-block hover:scale-103 active:scale-95">
                    Skapa konto
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
      </div>

      <FooterSection />
    </div>
  );
}
