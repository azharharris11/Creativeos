
import React, { useState } from 'react';
import { CampaignBlueprint, TargetPersona } from '../types';
import { ChevronRightIcon, CheckCircleIcon } from './icons';

interface BlueprintValidationStepProps {
  initialBlueprint: CampaignBlueprint;
  referenceImage: string;
  onStartCampaign: (validatedBlueprint: CampaignBlueprint) => void;
  onBack: () => void;
  allowVisualExploration: boolean;
  onAllowVisualExplorationChange: (checked: boolean) => void;
}

const EditableField: React.FC<{label: string, value: string, name: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({label, value, name, onChange}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-brand-text-secondary mb-1">{label}</label>
        <input type="text" id={name} name={name} value={value} onChange={onChange} className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-brand-primary text-white"/>
    </div>
);

const EditableTextarea: React.FC<{label: string, value: string, name: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, rows?: number}> = ({label, value, name, onChange, rows=2}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-brand-text-secondary mb-1">{label}</label>
        <textarea id={name} name={name} rows={rows} value={value} onChange={onChange} className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-brand-primary text-white"/>
    </div>
);

// Internal Accordion Item
const AccordionItem: React.FC<{ title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode; }> = ({ title, isOpen, onToggle, children }) => {
    return (
        <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800/50 mb-4">
            <button 
                onClick={onToggle}
                className={`w-full px-4 py-3 flex items-center justify-between font-semibold transition-colors ${isOpen ? 'bg-brand-primary/20 text-brand-primary' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}
            >
                <span>{title}</span>
                <ChevronRightIcon className={`w-5 h-5 transform transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 animate-fadeIn">
                    {children}
                </div>
            )}
        </div>
    )
}

export const DnaValidationStep: React.FC<BlueprintValidationStepProps> = ({ initialBlueprint, referenceImage, onStartCampaign, onBack }) => {
  const [blueprint, setBlueprint] = useState<CampaignBlueprint>(initialBlueprint);
  
  // Accordion State
  const [openSection, setOpenSection] = useState<'product' | 'persona' | 'dna'>('product');

  const handleConfirm = () => {
    onStartCampaign(blueprint);
  };
  
  const handlePersonaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof TargetPersona) => {
      const { value } = e.target;
      const isArray = field === 'painPoints' || field === 'desiredOutcomes';
      setBlueprint(prev => ({
          ...prev,
          targetPersona: {
              ...prev.targetPersona,
              [field]: isArray ? value.split(',').map(s => s.trim()) : value
          }
      }));
  }

  const handleDnaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof CampaignBlueprint['adDna']) => {
      const { value } = e.target;
      const isArray = field === 'specificLanguagePatterns';
      setBlueprint(prev => ({
          ...prev,
          adDna: {
              ...prev.adDna,
              [field]: isArray ? value.split(',').map(s => s.trim()) : value
          }
      }));
  }

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof CampaignBlueprint['productAnalysis']) => {
    const { value } = e.target;
    setBlueprint(prev => ({
        ...prev,
        productAnalysis: {
            ...prev.productAnalysis,
            [field]: value
        }
    }));
  };
  
  return (
    <div className="w-full flex flex-col items-center justify-center p-4 md:p-8 animate-fadeIn">
        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }`}</style>
        
        <div className="text-center mb-6 flex-shrink-0">
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">1. Validasi DNA Iklan</h1>
            <p className="text-brand-text-secondary mt-2 text-lg">Tinjau analisis AI. Pastikan strategi ini benar sebelum kita membangun visual.</p>
        </div>

        <div className="w-full max-w-6xl bg-brand-surface rounded-xl shadow-2xl p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 border border-gray-700">
            {/* Left Column: Visual Reference (Sticky) */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <div className="w-full aspect-square bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center border border-gray-700 shadow-inner sticky top-24">
                  {referenceImage ? (
                      <img src={referenceImage} alt="Iklan Referensi" className="max-h-full max-w-full object-contain rounded-md" />
                  ) : (
                      <div className="text-gray-500 text-sm">Tidak ada referensi gambar</div>
                  )}
              </div>
            </div>

            {/* Right Column: Accordion Editors */}
            <div className="lg:col-span-2">
                <AccordionItem 
                    title="1. Analisis Produk & Manfaat Utama" 
                    isOpen={openSection === 'product'} 
                    onToggle={() => setOpenSection(openSection === 'product' ? 'dna' : 'product')}
                >
                   <div className="space-y-4">
                      <EditableField label="Nama Produk/Layanan" name="name" value={blueprint.productAnalysis.name} onChange={e => handleProductChange(e, 'name')} />
                      <EditableField label="Manfaat Utama (The Big Promise)" name="keyBenefit" value={blueprint.productAnalysis.keyBenefit} onChange={e => handleProductChange(e, 'keyBenefit')} />
                      <EditableField label="Ringkasan Penawaran" name="offerSummary" value={blueprint.adDna.offerSummary} onChange={e => handleDnaChange(e, 'offerSummary')} />
                      <EditableField label="Ajakan Bertindak (CTA)" name="cta" value={blueprint.adDna.cta} onChange={e => handleDnaChange(e, 'cta')} />
                   </div>
                </AccordionItem>

                <AccordionItem 
                    title="2. Target Persona & Psikologi" 
                    isOpen={openSection === 'persona'} 
                    onToggle={() => setOpenSection(openSection === 'persona' ? 'dna' : 'persona')}
                >
                    <div className="space-y-4">
                        <EditableTextarea label="Deskripsi Persona" name="description" value={blueprint.targetPersona.description} onChange={e => handlePersonaChange(e, 'description')} />
                        <div className="grid grid-cols-2 gap-4">
                            <EditableField label="Rentang Usia" name="age" value={blueprint.targetPersona.age} onChange={e => handlePersonaChange(e, 'age')} />
                            <EditableField label="Tipe Kreator" name="creatorType" value={blueprint.targetPersona.creatorType} onChange={e => handlePersonaChange(e, 'creatorType')} />
                        </div>
                        <EditableTextarea label="Poin Masalah / Pain Points (pisahkan koma)" name="painPoints" value={blueprint.targetPersona.painPoints.join(', ')} onChange={e => handlePersonaChange(e, 'painPoints')} />
                        <EditableTextarea label="Hasil yang Diinginkan / Desires (pisahkan koma)" name="desiredOutcomes" value={blueprint.targetPersona.desiredOutcomes.join(', ')} onChange={e => handlePersonaChange(e, 'desiredOutcomes')} />
                    </div>
                </AccordionItem>

                <AccordionItem 
                    title="3. DNA Iklan & Strategi" 
                    isOpen={openSection === 'dna'} 
                    onToggle={() => setOpenSection(openSection === 'dna' ? 'product' : 'dna')}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableField label="Formula Persuasi" name="persuasionFormula" value={blueprint.adDna.persuasionFormula} onChange={e => handleDnaChange(e, 'persuasionFormula')} />
                        <EditableField label="Mekanisme Penjualan" name="salesMechanism" value={blueprint.adDna.salesMechanism} onChange={e => handleDnaChange(e, 'salesMechanism')} />
                        <EditableField label="Nada Suara" name="toneOfVoice" value={blueprint.adDna.toneOfVoice} onChange={e => handleDnaChange(e, 'toneOfVoice')} />
                        <EditableTextarea label="Pola Teks Iklan" name="copyPattern" value={blueprint.adDna.copyPattern} onChange={e => handleDnaChange(e, 'copyPattern')} />
                        <EditableField label="Gaya Visual" name="visualStyle" value={blueprint.adDna.visualStyle} onChange={e => handleDnaChange(e, 'visualStyle')} />
                        <EditableField label="Negara Target" name="targetCountry" value={blueprint.adDna.targetCountry} onChange={e => handleDnaChange(e, 'targetCountry')} />
                    </div>
                </AccordionItem>
            </div>
        </div>

        <div className="mt-4 flex flex-col items-center justify-center gap-4 pb-10 w-full max-w-3xl">
            <button
                onClick={handleConfirm}
                className="w-full py-4 bg-brand-primary text-white font-bold rounded-lg hover:bg-indigo-500 transition-transform transform hover:scale-[1.02] shadow-lg shadow-indigo-900/50 flex items-center justify-center gap-2 text-lg uppercase tracking-widest"
            >
                <CheckCircleIcon className="w-6 h-6" />
                Konfirmasi DNA & Lanjut ke Matrix
            </button>
            <button onClick={onBack} className="text-sm text-brand-text-secondary hover:text-white underline">Batal & Kembali ke Input</button>
        </div>
    </div>
  );
}
