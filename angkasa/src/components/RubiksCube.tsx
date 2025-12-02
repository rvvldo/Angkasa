import React from 'react';

const RubiksCube: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`cube-container perspective-1000 ${className}`}>
      <div className="cube relative w-full h-full transform-style-3d animate-spin-slow">
        {/* Front Face */}
        <div className="face absolute w-full h-full border-2 border-blue-400 bg-transparent translate-z-10 grid grid-cols-3 gap-1 p-1">
          {[...Array(9)].map((_, i) => (
            <div key={`f-${i}`} className="border border-blue-400/50 rounded-sm"></div>
          ))}
        </div>

        {/* Back Face */}
        <div className="face absolute w-full h-full border-2 border-blue-400 bg-transparent -translate-z-10 rotate-y-180 grid grid-cols-3 gap-1 p-1">
          {[...Array(9)].map((_, i) => (
            <div key={`b-${i}`} className="border border-blue-400/50 rounded-sm"></div>
          ))}
        </div>

        {/* Right Face */}
        <div className="face absolute w-full h-full border-2 border-blue-400 bg-transparent translate-x-10 rotate-y-90 grid grid-cols-3 gap-1 p-1">
          {[...Array(9)].map((_, i) => (
            <div key={`r-${i}`} className="border border-blue-400/50 rounded-sm"></div>
          ))}
        </div>

        {/* Left Face */}
        <div className="face absolute w-full h-full border-2 border-blue-400 bg-transparent -translate-x-10 -rotate-y-90 grid grid-cols-3 gap-1 p-1">
          {[...Array(9)].map((_, i) => (
            <div key={`l-${i}`} className="border border-blue-400/50 rounded-sm"></div>
          ))}
        </div>

        {/* Top Face */}
        <div className="face absolute w-full h-full border-2 border-blue-400 bg-transparent -translate-y-10 rotate-x-90 grid grid-cols-3 gap-1 p-1">
          {[...Array(9)].map((_, i) => (
            <div key={`t-${i}`} className="border border-blue-400/50 rounded-sm"></div>
          ))}
        </div>

        {/* Bottom Face */}
        <div className="face absolute w-full h-full border-2 border-blue-400 bg-transparent translate-y-10 -rotate-x-90 grid grid-cols-3 gap-1 p-1">
          {[...Array(9)].map((_, i) => (
            <div key={`bt-${i}`} className="border border-blue-400/50 rounded-sm"></div>
          ))}
        </div>
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .translate-z-10 {
          transform: translateZ(24px); /* Adjusted for smaller size (48px / 2) */
        }
        .-translate-z-10 {
          transform: translateZ(-24px);
        }
        .translate-x-10 {
          transform: translateX(24px);
        }
        .-translate-x-10 {
          transform: translateX(-24px);
        }
        .translate-y-10 {
          transform: translateY(24px);
        }
        .-translate-y-10 {
          transform: translateY(-24px);
        }
        .rotate-y-180 {
          transform: rotateY(180deg) translateZ(24px);
        }
        .rotate-y-90 {
          transform: rotateY(90deg) translateZ(24px);
        }
        .-rotate-y-90 {
          transform: rotateY(-90deg) translateZ(24px);
        }
        .rotate-x-90 {
          transform: rotateX(90deg) translateZ(24px);
        }
        .-rotate-x-90 {
          transform: rotateX(-90deg) translateZ(24px);
        }
        @keyframes spin-slow {
          0% { transform: rotateX(0deg) rotateY(0deg); }
          100% { transform: rotateX(360deg) rotateY(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default RubiksCube;
