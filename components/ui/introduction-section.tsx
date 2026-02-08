export default function IntroductionSection() {
  return (
    <section className="relative py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold tracking-widest text-purple-600 uppercase mb-4">Allt-i-ett Plattform</p>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Allt du behöver.
            <br />
            På ett ställe.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            En svit av produkter designade för att stödja varje fas av din fotograferingsverksamhet. Kraftfulla var för
            sig. Magiska tillsammans.
          </p>
        </div>

        {/* Product Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Client Gallery */}
          <div className="group p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-gray-100">
            <div className="w-12 h-12 mb-5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Klientgalleri</h3>
            <p className="text-gray-600 text-sm mb-4">Dela, leverera och sälj foton online med vackra fotogallerier.</p>
          </div>

          {/* Website */}
          <div className="group p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-gray-100">
            <div className="w-12 h-12 mb-5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Hemsida</h3>
            <p className="text-gray-600 text-sm mb-4">Lansera din fotograferingswebbplats, portfolio och blogg.</p>
          </div>

          {/* Molnlagring */}
          <div className="group p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-orange-50 border border-gray-100">
            <div className="w-12 h-12 mb-5 rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Molnlagring</h3>
            <p className="text-gray-600 text-sm mb-4">Säker och snabb lagring för alla dina högupplösta bilder.</p>
          </div>

          {/* Mobilapp */}
          <div className="group p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-blue-50 border border-gray-100">
            <div className="w-12 h-12 mb-5 rounded-xl bg-gradient-to-r from-orange-500 to-blue-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Mobilapp</h3>
            <p className="text-gray-600 text-sm mb-4">Hantera och dela dina gallerier direkt från mobilen.</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              1M+
            </p>
            <p className="text-gray-600 mt-2">Användare globalt</p>
          </div>
          <div>
            <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              10+
            </p>
            <p className="text-gray-600 mt-2">År av erfarenhet</p>
          </div>
          <div>
            <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
              6B+
            </p>
            <p className="text-gray-600 mt-2">Levererade foton</p>
          </div>
          <div>
            <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
              1.5B+
            </p>
            <p className="text-gray-600 mt-2">SEK sålt</p>
          </div>
        </div>
      </div>
    </section>
  );
}
