import React from 'react';
import { MindMapNode, AdConcept, CampaignBlueprint, ViewMode, TargetPersona, AwarenessStage, BuyingTriggerObject, CreativeFormat, PlacementFormat } from '../types';
// FIX: Import MindMapCanvasProps from MindMapCanvas
import { MindMapCanvas, MindMapCanvasProps } from './MindMapCanvas';
import { LayoutGridIcon, NetworkIcon } from './icons';

// FIX: Removed the local interface definition. It is now defined and exported from MindMapCanvas.tsx.

export const MindMapView: React.FC<MindMapCanvasProps> = (props) => {
  return (
    <div className="w-full h-screen flex flex-col bg-gray-950 text-white">
      <header className="flex-shrink-0 bg-brand-surface border-b border-gray-700 p-4 flex justify-between items-center z-20">
        <div>
          <h1 className="text-xl font-bold">Peta Strategi Kreatif</h1>
          <p className="text-sm text-brand-text-secondary">Visualisasikan dan bangun alur kampanye Anda.</p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-gray-900 rounded-lg">
          <button
            onClick={() => props.onSetViewMode('dashboard')}
            className={`px-3 py-1.5 text-sm font-semibold rounded-md flex items-center gap-2 transition-colors ${props.viewMode === 'dashboard' ? 'bg-brand-primary text-white' : 'text-brand-text-secondary hover:bg-gray-700'}`}
          >
            <LayoutGridIcon className="w-4 h-4" /> Dasbor Galeri
          </button>
          <button
            onClick={() => props.onSetViewMode('mindmap')}
            className={`px-3 py-1.5 text-sm font-semibold rounded-md flex items-center gap-2 transition-colors ${props.viewMode === 'mindmap' ? 'bg-brand-primary text-white' : 'text-brand-text-secondary hover:bg-gray-700'}`}
          >
            <NetworkIcon className="w-4 h-4" /> Peta Strategi
          </button>
        </div>
      </header>
      
      <main className="flex-grow relative">
        <MindMapCanvas 
          {...props}
        />
      </main>
    </div>
  );
};
