
import React, { useState } from 'react';
import { QuestionMarkIcon } from './Icons';

interface InfoTooltipProps {
  text: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ text }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div 
            className="relative flex items-center" 
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            <button className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700">
                <QuestionMarkIcon />
            </button>
            {isVisible && (
                <div 
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 border border-gray-600 rounded-lg shadow-lg text-sm text-white z-50 text-center"
                    style={{ pointerEvents: 'none' }}
                >
                    {text}
                </div>
            )}
        </div>
    );
};

export default InfoTooltip;