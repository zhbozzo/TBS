import React from 'react';

export type HighlightCoordinates = {
    top: number;
    left: number;
    width: number;
    height: number;
    shape?: 'rect' | 'circle';
    padding?: number;
} | null;

interface TutorialOverlayProps {
  step: number;
  content: {
    title: string;
    text: string;
    highlight?: HighlightCoordinates;
    nextButton?: string;
    allowSkip?: boolean;
    // If false, do not dim the rest of the screen
    dimBackground?: boolean;
  };
  onNext?: () => void;
  onSkip?: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ content, onNext, onSkip }) => {
    const { title, text, highlight, nextButton, dimBackground } = content;

    const highlightStyle: React.CSSProperties = highlight ? {
        position: 'absolute',
        top: `${highlight.top - (highlight.padding ?? 10)}px`,
        left: `${highlight.left - (highlight.padding ?? 10)}px`,
        width: `${highlight.width + (highlight.padding ?? 10) * 2}px`,
        height: `${highlight.height + (highlight.padding ?? 10) * 2}px`,
        borderRadius: highlight.shape === 'circle' ? '50%' : '12px',
        boxShadow: dimBackground === false
          ? '0 0 15px 5px rgba(250, 204, 21, 0.7)'
          : '0 0 15px 5px rgba(250, 204, 21, 0.7), 0 0 0 9999px rgba(0, 0, 0, 0.7)',
        transition: 'all 0.4s ease-in-out',
        zIndex: 1,
        pointerEvents: 'none', // The highlight itself should not be clickable
    } : {};
    
    // Position the text box relative to the highlight or screen center
    const textBoxStyle: React.CSSProperties = {
        position: 'absolute',
        zIndex: 2,
    };

    if (highlight) {
        const screenHeight = window.innerHeight;
        const screenWidth = window.innerWidth;
        const highlightCenterY = highlight.top + highlight.height / 2;

        if (highlightCenterY > screenHeight / 2) { // Highlight is on bottom half, show text on top
            textBoxStyle.top = '15%';
            textBoxStyle.left = '50%';
            textBoxStyle.transform = 'translateX(-50%)';
        } else { // Highlight is on top half, show text on bottom
            textBoxStyle.bottom = '15%';
            textBoxStyle.left = '50%';
            textBoxStyle.transform = 'translateX(-50%)';
        }
    } else { // No highlight, center the box
        textBoxStyle.top = '50%';
        textBoxStyle.left = '50%';
        textBoxStyle.transform = 'translate(-50%, -50%)';
    }
    
    // This overlay handles two cases:
    // 1. Informational pop-up with a "Next" button: The overlay is clickable to advance.
    // 2. Interactive step highlighting a UI element: The overlay is NOT clickable, allowing interaction with the UI below.
    const isInteractiveStep = !nextButton;

    return (
        <div 
            className="fixed top-[env(safe-area-inset-top)] right-[env(safe-area-inset-right)] bottom-[env(safe-area-inset-bottom)] left-[env(safe-area-inset-left)] z-[1000] animate-fade-in"
            onClick={!isInteractiveStep && onNext ? onNext : undefined}
            style={{ pointerEvents: isInteractiveStep ? 'none' : 'auto' }}
        >
            {highlight && <div style={highlightStyle} />}
            <div 
                style={textBoxStyle} 
                className="bg-gray-800 p-6 rounded-lg border-2 border-yellow-400 shadow-2xl max-w-sm pointer-events-auto text-center animate-scale-in flex flex-col items-center"
                onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to the overlay
            >
                <h3 className="text-2xl font-bold text-yellow-400 mb-3">{title}</h3>
                <p className="text-gray-300 text-base mb-5">{text}</p>
                {nextButton && onNext && (
                    <button onClick={onNext} className="mt-4 px-8 py-2 rounded-lg text-lg font-bold shadow-md transition-all duration-200 bg-yellow-600 hover:bg-yellow-500 text-white animate-pulse">
                        {nextButton}
                    </button>
                )}
                 {content.allowSkip && onSkip && (
                    <button onClick={onSkip} className="mt-4 text-sm text-gray-400 hover:text-white underline">
                        Skip Tutorial
                    </button>
                )}
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; } to { opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                
                @keyframes scale-in {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
                .animate-scale-in {
                    animation: scale-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default TutorialOverlay;