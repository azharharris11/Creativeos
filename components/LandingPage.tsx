
import React, { useState } from 'react';

interface LandingPageProps {
  onStart: () => void;
}

const faqs = [
    {
        question: "Mengapa Iklan 'Jelek'? Bukankah ini merusak brand?",
        answer: "Iklan cantik diabaikan (Banner Blindness). Iklan 'Jelek' menggunakan Pattern Interrupt untuk menghentikan scrolling. Ini bukan soal terlihat buruk, tapi soal terlihat OTENTIK, mentah, dan relatabel. Konsumen percaya pada manusia, bukan logo korporat."
    },
    {
        question: "Apakah ini hanya membuat gambar jelek asal-asalan?",
        answer: "Tidak. Ada formulanya: Keyword + Key Emotion + Qualifier + Outcome + Thoughtful. Kita menggunakan visual 'Lo-Fi' (seperti MS Paint, Notes App, atau kamar berantakan) untuk melewati filter mental, tetapi pesannya disusun secara strategis untuk konversi."
    },
    {
        question: "Apakah ini bekerja untuk produk mahal (High-Ticket)?",
        answer: "Ya, tapi dengan nuansa. Bahkan untuk produk mahal, visual 'Berfokus pada Masalah' (menunjukkan perjuangan nyata) sering mengalahkan foto studio karena terasa nyata. Kita fokus pada 'Ugly Truth' dari masalah tersebut."
    }
];


export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    
    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <>
        <style>{`
            body {
            font-family: 'Poppins', sans-serif;
            background-color: #020617; /* slate-950 */
            color: #e2e8f0; /* slate-200 */
            }

            @keyframes glitch {
            0% { text-shadow: 0.5px 0 0 #f87171, -0.5px 0 0 #3b82f6; opacity: 1; }
            25% { opacity: 0.8; }
            50% { text-shadow: -0.5px 0 0 #f87171, 0.5px 0 0 #3b82f6; opacity: 1; }
            75% { opacity: 0.7; }
            100% { text-shadow: 0.5px 0 0 #f87171, -0.5px 0 0 #3b82f6; opacity: 1; }
            }

            .glitch {
            animation: glitch 0.3s infinite alternate;
            }

            @keyframes pulse-intense {
            0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.7);
            }
            50% {
            transform: scale(1.05);
            box-shadow: 0 0 20px 10px rgba(22, 163, 74, 0);
            }
            }

            .cta-button {
            background-color: #22c55e; /* green-500 */
            color: #020617; /* slate-950 */
            animation: pulse-intense 2s infinite;
            }

            .cta-button:hover {
            animation: none;
            transform: scale(1.05);
            background-color: #16a34a; /* green-600 */
            }

            .glass-card {
            background: rgba(15, 23, 42, 0.6); /* slate-900/60 */
            backdrop-filter: blur(10px);
            border: 1px solid rgba(51, 65, 85, 0.5); /* slate-700/50 */
            }

            .faq-content {
            transition: max-height 0.3s ease-out;
            }
        `}</style>
        <div className="antialiased scroll-smooth">
            <header className="min-h-screen flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-10">
                    <div style={{backgroundImage: "linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)", backgroundSize: "40px 40px"}} className="w-full h-full"></div>
                </div>
                
                <div className="z-10 max-w-5xl">
                  <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter">
                    Mengapa Iklan 'Jelek'
                    <span className="block text-red-500 underline decoration-red-500 decoration-wavy">Menghasilkan Konversi Gila-gilaan?</span>
                  </h1>
                  
                  <p className="mt-8 text-xl md:text-3xl text-slate-300 max-w-2xl mx-auto">
                    Berhenti memoles. Mulai <span className="font-bold text-yellow-400 glitch">Mengganggu Pola</span>.
                  </p>
                  
                  <p className="mt-4 text-lg md:text-xl text-slate-400 max-w-3xl mx-auto">
                    Berdasarkan analisis 40.000+ iklan: Iklan yang terlihat "jelek", tidak sempurna, dan mentah adalah kunci untuk menembus pertahanan "Banner Blindness". Ini bukan soal estetika, ini soal <span className="font-bold text-white">Psikologi</span>.
                  </p>

                  <div className="mt-12">
                    <button onClick={onStart} className="cta-button font-black text-xl md:text-2xl uppercase py-5 px-12 rounded-lg shadow-2xl shadow-green-500/30 transition-all duration-300">
                      Hasilkan Iklan 'Jelek' Sekarang
                    </button>
                  </div>
                </div>
            </header>
            
            <section className="py-20 px-6 bg-slate-900">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-black text-center">
                        4 Rahasia di Balik <span className="text-red-500">Fenomena Ini</span>
                    </h2>
                    <p className="text-center text-xl text-slate-400 mt-4 max-w-3xl mx-auto">
                        Mengapa iklan yang tidak dipoles begitu efektif?
                    </p>
                    
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <div className="border-2 border-cyan-900 bg-cyan-900/10 p-6 rounded-lg relative overflow-hidden z-10">
                            <h3 className="text-2xl font-bold text-cyan-400">1. Interupsi Pola</h3>
                            <p className="mt-3 text-slate-300">
                              Di tengah lautan iklan yang sempurna, tampilan visual yang berbeda dan "mentah" memaksa otak untuk berhenti sejenak dan memperhatikan.
                            </p>
                          </div>
                          
                          <div className="border-2 border-cyan-900 bg-cyan-900/10 p-6 rounded-lg relative overflow-hidden z-10">
                            <h3 className="text-2xl font-bold text-cyan-400">2. Keaslian (Authenticity)</h3>
                            <p className="mt-3 text-slate-300">
                              Terasa jujur dan tidak dibuat-buat. Memberi kesan ada manusia di baliknya, membangun kepercayaan instan.
                            </p>
                          </div>
                          
                          <div className="border-2 border-cyan-900 bg-cyan-900/10 p-6 rounded-lg relative overflow-hidden z-10">
                            <h3 className="text-2xl font-bold text-cyan-400">3. Bias Kelompok (Ingroup)</h3>
                            <p className="mt-3 text-slate-300">
                              Terlihat seperti konten organik dari teman (misal: format Notes atau Story), memanfaatkan bias kepercayaan kita pada orang yang mirip dengan kita.
                            </p>
                          </div>
                          
                          <div className="border-2 border-cyan-900 bg-cyan-900/10 p-6 rounded-lg relative overflow-hidden z-10">
                            <h3 className="text-2xl font-bold text-cyan-400">4. Efek Kontras</h3>
                            <p className="mt-3 text-slate-300">
                               Otak memperhatikan perbedaan. Di feed yang penuh polesan AI, ketidaksempurnaan manusia menjadi hal yang paling menonjol.
                            </p>
                          </div>
                    </div>
                </div>
            </section>
            
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-4xl md:text-6xl font-black text-center tracking-tighter">
                        Jangan Malas.<br/>Jadilah <span className="text-cyan-400">Jelek Secara Strategis.</span>
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 text-left">
                        <div className="glass-card rounded-xl p-8 border-red-700 border-2 opacity-70">
                          <h3 className="text-3xl font-bold text-red-400">Jebakan Iklan Cantik</h3>
                          <p className="text-lg text-slate-300 mt-2">Menghabiskan waktu & uang untuk estetika yang gagal.</p>
                          <ul className="mt-6 space-y-3">
                            <li className="flex items-center text-lg"><span className="text-red-500 mr-2">✖</span> Mahal & Lama</li>
                            <li className="flex items-center text-lg"><span className="text-red-500 mr-2">✖</span> Terlihat seperti "Jualan"</li>
                            <li className="flex items-center text-lg"><span className="text-red-500 mr-2">✖</span> Diabaikan Otak (Banner Blindness)</li>
                          </ul>
                        </div>
                        
                        <div className="glass-card rounded-xl p-8 border-green-500 border-2 shadow-2xl shadow-green-500/30">
                          <h3 className="text-3xl font-bold text-green-400">Formula Ugly Ads</h3>
                          <p className="text-lg text-slate-300 mt-2">Keyword + Key Emotion + Qualifier + Outcome.</p>
                          <ul className="mt-6 space-y-3">
                            <li className="flex items-center text-lg"><span className="text-green-500 mr-2">✔</span> Big Font & MS Paint Style</li>
                            <li className="flex items-center text-lg"><span className="text-green-500 mr-2">✔</span> Raw Photos (Masalah Nyata)</li>
                            <li className="flex items-center text-lg"><span className="text-green-500 mr-2">✔</span> CTR & ROAS Tinggi</li>
                          </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 bg-slate-900">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-center text-2xl text-cyan-400 font-bold uppercase tracking-widest">13 Format Terbukti yang Kami Hasilkan</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                         <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                             <div className="h-40 bg-yellow-100 mb-4 rounded flex items-center justify-center text-gray-400 font-mono">
                                 [Notes App UI]
                             </div>
                             <h3 className="font-bold text-xl text-white">Iklan Teks Panjang</h3>
                             <p className="text-gray-400 mt-2">Meniru aplikasi catatan. Seperti "Video Sales Letter" dalam teks. Membangun argumen persuasif yang intim.</p>
                         </div>
                         <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                             <div className="h-40 bg-gray-700 mb-4 rounded flex items-center justify-center text-gray-400 font-mono overflow-hidden">
                                 [Blank Billboard]
                             </div>
                             <h3 className="font-bold text-xl text-white">Iklan Papan Reklame</h3>
                             <p className="text-gray-400 mt-2">Memanfaatkan "Familiarity Bias". Kita menyuntikkan pesan Anda ke rambu jalan. Mustahil diabaikan.</p>
                         </div>
                         <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                             <div className="h-40 bg-white mb-4 rounded flex items-center justify-center text-gray-400 font-mono border-4 border-red-500">
                                 [MS Paint Style]
                             </div>
                             <h3 className="font-bold text-xl text-white">MS Paint Nostalgia</h3>
                             <p className="text-gray-400 mt-2">Estetika "Graphic design is my passion". Warna tabrakan dan cropping buruk menandakan "Manusia Asli".</p>
                         </div>
                         <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                             <div className="h-40 bg-blue-900/30 mb-4 rounded flex items-center justify-center text-gray-400 font-mono">
                                 [Big Font]
                             </div>
                             <h3 className="font-bold text-xl text-white">Iklan Font Besar</h3>
                             <p className="text-gray-400 mt-2">Menyoroti masalah spesifik dengan teks raksasa untuk mengganggu pola visual feed.</p>
                         </div>
                         <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                             <div className="h-40 bg-gray-900 mb-4 rounded flex items-center justify-center text-gray-400 font-mono">
                                 [Ugly Problem]
                             </div>
                             <h3 className="font-bold text-xl text-white">Visual Masalah 'Jelek'</h3>
                             <p className="text-gray-400 mt-2">Menunjukkan masalah secara gamblang (jerawat, kamar berantakan) untuk koneksi emosional instan.</p>
                         </div>
                         <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                             <div className="h-40 bg-white mb-4 rounded flex items-center justify-center text-gray-400 font-mono border border-gray-300">
                                 [Gmail UX]
                             </div>
                             <h3 className="font-bold text-xl text-white">Iklan Surat / Gmail</h3>
                             <p className="text-gray-400 mt-2">Meniru antarmuka email. Membangkitkan rasa ingin tahu ("We apologize...", "Did you see this?").</p>
                         </div>
                    </div>
                </div>
            </section>
            
            <section className="py-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-black text-center mb-12">
                        FAQ
                    </h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="glass-card rounded-lg overflow-hidden">
                                <button onClick={() => toggleFaq(index)} className="w-full p-6 text-left flex justify-between items-center">
                                    <span className="text-xl font-bold text-slate-100">{faq.question}</span>
                                    <svg className={`w-6 h-6 text-slate-400 flex-shrink-0 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </button>
                                <div className="faq-content max-h-0 overflow-hidden px-6" style={{ maxHeight: openFaq === index ? '200px' : '0' }}>
                                    <p className="pb-6 text-slate-300">{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            <section className="py-20 px-6" id="instal">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-5xl font-black">Siap Berpikir 'Jelek' demi Hasil Lebih Baik?</h2>
                    <p className="text-xl text-gray-400 mt-4">Hasilkan 3 Konsep "Ugly Ads" dalam 30 detik.</p>

                    <div className="mt-12 text-center">
                        <button onClick={onStart} className="cta-button font-black text-xl md:text-2xl uppercase py-5 px-12 rounded-lg shadow-2xl shadow-green-500/30 transition-all duration-300">
                          Mulai Generator
                        </button>
                    </div>
                </div>
            </section>
            
            <footer className="text-center py-12 px-6 border-t border-slate-800">
                <p className="text-slate-500">&copy; 2025 CreatifOS v2. All Rights Reserved.</p>
            </footer>
        </div>
        </>
    );
};
