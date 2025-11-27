import { useState, useEffect, useRef } from 'react';
import { ChevronRight, Check } from 'lucide-react';

interface TutorialStep {
  targetId: string;
  title: string;
  message: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface TutorialOverlayProps {
  steps: TutorialStep[];
  onComplete: () => void;
}

export default function TutorialOverlay({ steps, onComplete }: TutorialOverlayProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [robotPosition, setRobotPosition] = useState({ top: '50%', left: '50%' });
  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    const updatePosition = () => {
      const targetElement = document.getElementById(currentStep.targetId);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        setTargetRect(rect);

        // Calculate robot position based on target and preferred position
        let top = '50%';
        let left = '50%';
        const offset = 200; // Distance from target

        switch (currentStep.position) {
          case 'top':
            top = `${rect.top - offset}px`;
            left = `${rect.left + rect.width / 2}px`;
            break;
          case 'bottom':
            top = `${rect.bottom + offset}px`;
            left = `${rect.left + rect.width / 2}px`;
            break;
          case 'left':
            top = `${rect.top + rect.height / 2}px`;
            left = `${rect.left - offset}px`;
            break;
          case 'right':
            top = `${rect.top + rect.height / 2}px`;
            left = `${rect.right + offset}px`;
            break;
          case 'center':
          default:
            top = '50%';
            left = '50%';
            break;
        }
        setRobotPosition({ top, left });
      } else {
        // Fallback if target not found (e.g. initial load)
        setRobotPosition({ top: '50%', left: '50%' });
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(updatePosition, 100);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
    };
  }, [currentStepIndex, currentStep.targetId, currentStep.position]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Backdrop with hole effect (using clip-path or simple overlay with opacity) */}
      {/* For simplicity, we use a dark overlay. To highlight the element, we could use SVG masks, but a simple dark overlay is safer for now. */}
      <div className="absolute inset-0 bg-black/40 transition-opacity duration-500"></div>

      {/* Highlight Box (Optional - adds a border around the target) */}
      {targetRect && (
        <div 
          className="absolute border-4 border-yellow-400 rounded-xl shadow-[0_0_20px_rgba(250,204,21,0.5)] transition-all duration-700 ease-in-out z-[101]"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        ></div>
      )}

      {/* Floating Robot Container */}
      <div 
        className="absolute z-[102] transition-all duration-1000 ease-in-out flex flex-col items-center"
        style={{ 
          top: robotPosition.top, 
          left: robotPosition.left,
          transform: 'translate(-50%, -50%)' 
        }}
      >
        {/* Speech Bubble */}
        <div className="mb-4 relative bg-white text-slate-900 p-6 rounded-2xl shadow-2xl max-w-sm w-80 animate-in fade-in zoom-in duration-500">
          <h3 className="text-lg font-bold mb-2 text-indigo-600">{currentStep.title}</h3>
          <p className="text-slate-600 mb-6 leading-relaxed">{currentStep.message}</p>
          
          <div className="flex justify-between items-center">
            <div className="flex gap-1">
              {steps.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-2 h-2 rounded-full transition-colors ${idx === currentStepIndex ? 'bg-indigo-600' : 'bg-slate-300'}`}
                />
              ))}
            </div>
            <button 
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-indigo-500/30"
            >
              {currentStepIndex === steps.length - 1 ? 'Selesai' : 'Lanjut'}
              {currentStepIndex === steps.length - 1 ? <Check className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Bubble Triangle */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white transform rotate-45"></div>
        </div>

        {/* Robot Character */}
        <div className="relative w-32 h-40 animate-bounce-slow">
          {/* Head */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-14 bg-slate-200 rounded-2xl border-2 border-slate-400 shadow-lg z-10 flex flex-col items-center justify-center overflow-hidden">
            {/* Eyes */}
            <div className="flex gap-2 mb-1">
              <div className="w-3 h-3 bg-indigo-500 rounded-full animate-blink"></div>
              <div className="w-3 h-3 bg-indigo-500 rounded-full animate-blink"></div>
            </div>
            {/* Mouth */}
            <div className="w-6 h-1 bg-slate-400 rounded-full"></div>
            {/* Antenna */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-3 bg-slate-400"></div>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </div>

          {/* Body */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-20 h-24 bg-gradient-to-b from-indigo-500 to-indigo-700 rounded-3xl border-2 border-indigo-400 shadow-xl z-0 flex items-center justify-center">
             <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.8)]"></div>
             </div>
          </div>

          {/* Arms */}
          <div className="absolute top-16 -left-2 w-4 h-16 bg-slate-300 rounded-full border border-slate-400 origin-top transform -rotate-12 animate-wave-left"></div>
          <div className="absolute top-16 -right-2 w-4 h-16 bg-slate-300 rounded-full border border-slate-400 origin-top transform rotate-12 animate-wave-right"></div>

          {/* Legs */}
          <div className="absolute bottom-0 left-8 w-5 h-10 bg-slate-300 rounded-b-xl border border-slate-400"></div>
          <div className="absolute bottom-0 right-8 w-5 h-10 bg-slate-300 rounded-b-xl border border-slate-400"></div>
          
          {/* Jetpack Flame (Floating effect) */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
             <div className="w-2 h-6 bg-orange-500 rounded-full blur-sm animate-flame"></div>
             <div className="w-2 h-8 bg-yellow-500 rounded-full blur-sm animate-flame delay-75"></div>
             <div className="w-2 h-6 bg-orange-500 rounded-full blur-sm animate-flame delay-150"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
