

import React from 'react';

interface IconProps {
  className?: string;
}

export const SwordIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m-4-12h8m-8 4h8m-8 4h8" transform="rotate(45 12 12)" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" transform="rotate(45 12 12)" />
  </svg>
);

export const BowIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h11" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 5v14" />
  </svg>
);

export const ShieldIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.917a12.02 12.02 0 009 2.083c4.255 0 7.93-2.61 9.47-6.244a12.02 12.02 0 00-3.852-11.667z" />
  </svg>
);

export const FireballIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.64-.1 2.42-.29-.26-.62-.42-1.3-.42-2.01 0-2.21 1.79-4 4-4 .71 0 1.39.16 2.01.42.19-.78.29-1.59.29-2.42C22 6.48 17.52 2 12 2zm-2.09 14.91c-.39.39-1.02.39-1.41 0l-1.41-1.41c-.39-.39-.39-1.02 0-1.41l4.24-4.24c.39-.39 1.02-.39 1.41 0l1.41 1.41c.39.39.39 1.02 0 1.41l-4.24 4.24z"/>
    </svg>
);

export const HealIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4 13h-3v3h-2v-3H8v-2h3V9h2v3h3v2z"/>
    </svg>
);

export const CrossbowIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4m16 0l-4-4m4 4l-4 4M4 12l4-4M4 12l4 4M12 4v16"/>
    </svg>
);

export const AssassinIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7" />
    </svg>
);

export const BerserkerIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.874 1.75a2.5 2.5 0 00-2.498 3.334l.5 2.5a2.5 2.5 0 004.998-.668l-.5-2.5a2.5 2.5 0 00-2.5-2.666zM19.126 1.75a2.5 2.5 0 012.498 3.334l-.5 2.5a2.5 2.5 0 01-4.998-.668l.5-2.5a2.5 2.5 0 012.5-2.666z"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 10v2m6-2v2m-3 4h.01M9 16h6M6.343 17.657L5.636 18.364m12.728-12.728l-.707-.707M12 21a9 9 0 110-18 9 9 0 010 18z"/>
    </svg>
);

export const FrostMageIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a1 1 0 011 1v18a1 1 0 11-2 0V3a1 1 0 011-1z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.929 7.929l1.414 1.414m11.314-2.828l-1.414 1.414" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16h10M7 12h10M7 8h10" />
    </svg>
);

export const PaladinIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const DragonIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 8.618a4.5 4.5 0 00-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H12a.75.75 0 01-.75-.75V15.75z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.093 15.442a.5.5 0 01.316.634 9.002 9.002 0 0015.182 0 .5.5 0 01.316-.634l-.5-1.5a.5.5 0 01.634-.316 10.002 10.002 0 01-15.83 0 .5.5 0 01.634.316l-.5 1.5z" />
    </svg>
);

export const GolemIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7L12 3 4 7v10l8 4 8-4V7zM4 7l8 4M12 11v10M20 7l-8 4M8 5l4 2 4-2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 13v4l4 2 4-2v-4" />
    </svg>
);
export const LancerIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 12l4-4M3 12l4 4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 8l-4 8" />
    </svg>
);
export const NecromancerIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a2.5 2.5 0 00-2.5 2.5V7h5V4.5A2.5 2.5 0 0012 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10a4 4 0 108 0H8z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14v3m3-3v3m3-3v3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 22h10" />
    </svg>
);
export const SandwormIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10c0 4.418 4.03 8 9 8s9-3.582 9-8" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10V6a2 2 0 012-2h14a2 2 0 012 2v4" />
        <circle cx="7" cy="10" r="1" />
        <circle cx="12" cy="10" r="1" />
        <circle cx="17" cy="10" r="1" />
    </svg>
);
export const EnchantressIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 10.5l5 3-5 3" />
    </svg>
);
export const PrismGuardIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 17l10 5 10-5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 7v10l10 5V12L2 7z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M22 7v10l-10 5V12l10-5z" />
    </svg>
);
export const ImpIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75h-7.5a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l.001 4.5m4.5-4.5l-.001 4.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c0 5.385 4.365 9.75 9.75 9.75s9.75-4.365 9.75-9.75S17.385 2.25 12 2.25 2.25 6.615 2.25 12z" />
    </svg>
);
export const MagmaElementalIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 8.5c-1.5 1.5-1.5 4.5 0 6s4.5 1.5 6 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 15.5c1.5-1.5 1.5-4.5 0-6s-4.5-1.5-6 0" />
    </svg>
);
export const ValkyrieIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v8m-4-4h8" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.764a2 2 0 01-1.205 1.832l-5.32 2.66A2 2 0 0112 15.5V4.5a2 2 0 012.475-1.796l5.32 2.66A2 2 0 0121 7.236v5.528z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12.764a2 2 0 001.205 1.832l5.32 2.66A2 2 0 0012 15.5V4.5A2 2 0 009.525 2.704l-5.32 2.66A2 2 0 003 7.236v5.528z" />
    </svg>
);
export const IceGiantIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v4m-4 4h8m-4 4v4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636l12.728 12.728M18.364 5.636L5.636 18.364" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 110-18 9 9 0 010 18z" />
    </svg>
);

export const FarmerIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V11m-4 0V4a2 2 0 012-2h4a2 2 0 012 2v7" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 4a4 4 0 018 0" />
  </svg>
);

export const TucTucTucSahurIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 2.25L10.5 6l-3.75 3.75 2.25 2.25 3.75-3.75 3.75 3.75-2.25 2.25L21.75 21" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5L2.25 17.25" />
    </svg>
);

export const TralaleroTralalaIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l9-8 9 8-9 8-9-8z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 17v4m8-4v4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h2m6 0h2"/>
    </svg>
);

export const BombardinoCrocodiloIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 13l2-2h16l2 2-2 2H4l-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 11V9l2-2h12l2 2v2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 11l-2-2 2-2m14 4l2-2-2-2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v3m-4-3v3m8-3v3" />
    </svg>
);

export const MusqueteerIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h16M4 14h16m-4-8l-4-4-4 4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v14m-4 0h8" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 6L8 12" />
    </svg>
);

export const BomberIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="14" r="6" stroke="currentColor" />
        <path d="M12,8 V6 M13,5 H11" stroke="currentColor" strokeLinecap="round" />
        <path d="M8.5,10 C5.5,10 5.5,14 8.5,14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M15.5,10 C18.5,10 18.5,14 15.5,14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
);

export const GearIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const VsIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <div className={`${className} flex items-center justify-center`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-1/2 h-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
             <path strokeLinecap="round" strokeLinejoin="round" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
             <path strokeLinecap="round" strokeLinejoin="round" d="M10 10l4 4m0-4l-4 4"/>
        </svg>
        <span className="font-extrabold text-sm absolute text-center select-none" style={{ color: 'rgba(0,0,0,0.4)'}}>VS</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-1/2 h-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
             <path strokeLinecap="round" strokeLinejoin="round" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
             <path strokeLinecap="round" strokeLinejoin="round" d="M10 10l4 4m0-4l-4 4"/>
        </svg>
    </div>
);

export const QuestionMarkIcon: React.FC<IconProps> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4 0 .863-.27 1.66-.744 2.267l-1.06 1.06c-.44.44-.657 1.057-.657 1.676v.3c0 .552-.448 1-1 1s-1-.448-1-1v-.3c0-1.06.44-2.06.657-2.676l.22-.22c.26-.26.417-.624.417-1.007 0-1.104-.896-2-2-2s-2 .896-2 2c0 .383.157.747.417 1.007l.22.22c.217.616.657 1.616.657 2.676v.3c0 .552-.448 1-1 1s-1-.448-1-1v-.3c0-1.06-.44-2.06-.657-2.676l-1.06-1.06A4.982 4.982 0 018 13c0-1.165.451-2.223 1.228-3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01" />
    </svg>
);

export const StoreIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

export const FastForwardIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
    </svg>
);

export const ChevronUpIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

export const BackArrowIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

export const PauseIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
    </svg>
);

export const PlayIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
    </svg>
);

export const GoldIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none">
        <defs>
            <radialGradient id="goldGradient" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="100%" stopColor="#FBBF24" />
            </radialGradient>
        </defs>
        <circle cx="12" cy="12" r="10" fill="url(#goldGradient)" stroke="#B45309" strokeWidth="1.5"/>
        <path d="M12 6.5l1.41 2.86 3.16.46-2.29 2.23.54 3.15L12 13.5l-2.82 1.74.54-3.15-2.29-2.23 3.16-.46L12 6.5z" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="0.75" strokeLinejoin="round"/>
        <path d="M8.5 8.5 C 10 7.5, 11 7.5, 12.5 8" stroke="white" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5" />
    </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export const CalendarDaysIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3.5a2.5 2.5 0 015 0V7m0 0h5a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13h14M8 17h.01" />
    </svg>
);

export const PlayCircleIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const CoinStackIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-4-6h8m-4-4a4 4 0 100 8 4 4 0 000-8z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10a4 4 0 018 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 14a4 4 0 018 0" />
    </svg>
);

export const TreasureChestIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7a2 2 0 012-2h12a2 2 0 012 2v2H4V7z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11v6m-3-3h6" />
    </svg>
);

export const GemIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 9l10 12L22 9l-10-7z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 9l10 3 10-3M12 21V12" />
    </svg>
);

export const NoAdsIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6" />
    </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const SpeedCycleIcon: React.FC<IconProps & { speed: number }> = ({ className = "h-6 w-6", speed }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {speed === 1 && <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />}
            {speed === 2 && <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />}
            {speed === 4 && <>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 5l6 7-6 7" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 5l6 7-6 7" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 5l6 7-6 7" />
            </>}
        </svg>
    )
};