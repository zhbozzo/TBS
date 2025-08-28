

import React, { useState, useEffect } from 'react';
import { GoldIcon, BackArrowIcon, CalendarDaysIcon, PlayCircleIcon, CoinStackIcon, TreasureChestIcon, GemIcon, NoAdsIcon } from '../components/Icons';

interface DailyRewardState {
  lastClaimed: number | null;
}

interface AdsWatchedState {
  count: number;
  date: string | null;
}

interface GetGoldScreenProps {
  onBack: () => void;
  dailyRewardState: DailyRewardState;
  adsWatchedState: AdsWatchedState;
  onClaimDailyReward: () => void;
  onWatchAd: () => void;
  onPurchaseGold: (amount: number) => void;
  isAdFree: boolean;
  onPurchaseAdFree: () => void;
}

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const ADS_PER_DAY = 3;

const GetGoldScreen: React.FC<GetGoldScreenProps> = ({
  onBack,
  dailyRewardState,
  adsWatchedState,
  onClaimDailyReward,
  onWatchAd,
  onPurchaseGold,
  isAdFree,
  onPurchaseAdFree,
}) => {
  const [timeLeft, setTimeLeft] = useState('');
  
  const isDailyRewardReady = !dailyRewardState.lastClaimed || (Date.now() - dailyRewardState.lastClaimed) > TWENTY_FOUR_HOURS_MS;
  
  const adsWatchedToday = adsWatchedState.date === new Date().toDateString() ? adsWatchedState.count : 0;
  const adsRemaining = ADS_PER_DAY - adsWatchedToday;

  useEffect(() => {
    if (isDailyRewardReady) {
        setTimeLeft('');
        return;
    }

    const intervalId = setInterval(() => {
      const now = Date.now();
      const timeRemaining = (dailyRewardState.lastClaimed! + TWENTY_FOUR_HOURS_MS) - now;

      if (timeRemaining <= 0) {
        setTimeLeft('');
        clearInterval(intervalId);
      } else {
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining / (1000 * 60)) % 60);
        const seconds = Math.floor((timeRemaining / 1000) % 60);
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [dailyRewardState.lastClaimed, isDailyRewardReady]);

  const buttonClasses = "w-full py-3 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center shadow-lg disabled:cursor-not-allowed";

  return (
    <div className="w-full h-full p-8 flex flex-col items-center bg-gray-900 text-white overflow-y-auto">
      <header className="w-full max-w-4xl flex justify-between items-center mb-8">
        <button
          onClick={onBack}
          className="px-6 py-2 rounded-lg text-lg font-bold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 bg-gray-600 hover:bg-gray-500 text-white flex items-center gap-2"
        >
          <BackArrowIcon className="w-5 h-5"/>
          Back
        </button>
        <h1 className="text-4xl font-bold text-yellow-400 tracking-wider">Get More Gold</h1>
        <div className="w-32"></div>
      </header>

      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Daily Reward Card */}
        <div className="bg-gray-800 rounded-xl border-2 border-indigo-500/50 p-6 flex flex-col items-center text-center shadow-lg shadow-indigo-500/10">
            <div className="bg-indigo-500/20 p-4 rounded-full mb-4">
                <CalendarDaysIcon className="w-16 h-16 text-indigo-300" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Daily Reward</h2>
            <p className="text-gray-400 mb-4 h-12">Come back every day to claim your free gold reward!</p>
            <div className="flex items-center text-3xl font-bold text-yellow-300 mb-6">
                300 <GoldIcon className="w-8 h-8 ml-2"/>
            </div>
            <button
                onClick={onClaimDailyReward}
                disabled={!isDailyRewardReady}
                className={`${buttonClasses} ${isDailyRewardReady ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-gray-700 text-gray-400'}`}
            >
                {isDailyRewardReady ? 'Claim Now' : `Claim in ${timeLeft}`}
            </button>
        </div>

        {/* Watch Ad Card */}
        <div className="bg-gray-800 rounded-xl border-2 border-teal-500/50 p-6 flex flex-col items-center text-center shadow-lg shadow-teal-500/10">
            <div className="bg-teal-500/20 p-4 rounded-full mb-4">
                <PlayCircleIcon className="w-16 h-16 text-teal-300" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{isAdFree ? 'Ad-Free Bonus' : 'Watch & Earn'}</h2>
            <p className="text-gray-400 mb-4 h-12">{isAdFree ? 'You have the Ad-Free pack! Claim your gold bonus without watching videos.' : 'Watch a short video to get an instant gold reward. Limited per day.'}</p>
            <div className="flex items-center text-3xl font-bold text-yellow-300 mb-2">
                150 <GoldIcon className="w-8 h-8 ml-2"/>
            </div>
            <p className="text-sm text-gray-400 mb-2">{adsRemaining} / {ADS_PER_DAY} remaining today</p>
            <button
                onClick={onWatchAd}
                disabled={adsRemaining <= 0}
                className={`${buttonClasses} ${adsRemaining > 0 ? 'bg-teal-600 hover:bg-teal-500' : 'bg-gray-700 text-gray-400'}`}
            >
                {isAdFree ? 'Claim Bonus' : 'Watch Video'}
            </button>
        </div>
      </main>
      
      <section className="w-full max-w-4xl mt-12">
          <h2 className="text-center text-3xl font-bold mb-6 text-purple-400">Premium Store</h2>
          <div className={`grid grid-cols-1 gap-6 ${isAdFree ? 'md:grid-cols-3' : 'md:grid-cols-4'}`}>
              <GoldPackCard 
                icon={CoinStackIcon} 
                amount={1000} 
                price="$0.99"
                onPurchase={() => onPurchaseGold(1000)}
              />
              <GoldPackCard 
                icon={TreasureChestIcon} 
                amount={5500} 
                price="$4.99"
                onPurchase={() => onPurchaseGold(5500)}
                isBestValue
              />
              <GoldPackCard 
                icon={GemIcon} 
                amount={12000} 
                price="$9.99"
                onPurchase={() => onPurchaseGold(12000)}
              />
              {!isAdFree && <AdFreeCard onPurchase={onPurchaseAdFree} />}
          </div>
      </section>
    </div>
  );
};


interface GoldPackCardProps {
    icon: React.FC<{className?: string}>;
    amount: number;
    price: string;
    onPurchase: () => void;
    isBestValue?: boolean;
}

const GoldPackCard: React.FC<GoldPackCardProps> = ({ icon: Icon, amount, price, onPurchase, isBestValue }) => (
    <div className={`relative bg-gray-800 rounded-xl border-2 border-purple-500/50 p-5 flex flex-col items-center shadow-lg shadow-purple-500/10`}>
        {isBestValue && (
            <div className="absolute -top-3 bg-yellow-400 text-gray-900 font-bold px-4 py-1 rounded-full text-sm">
                Best Offer!
            </div>
        )}
        <div className="bg-purple-500/20 p-3 rounded-full mb-4">
            <Icon className="w-12 h-12 text-purple-300" />
        </div>
        <div className="flex items-center text-2xl font-bold text-yellow-300 mb-3">
            {amount.toLocaleString()} <GoldIcon className="w-6 h-6 ml-2"/>
        </div>
        <button
            onClick={onPurchase}
            className="w-full py-2 mt-auto rounded-lg font-bold text-lg transition-colors duration-200 bg-purple-600 hover:bg-purple-500"
        >
            {price}
        </button>
    </div>
);

const AdFreeCard: React.FC<{ onPurchase: () => void }> = ({ onPurchase }) => (
    <div className={`relative bg-gray-800 rounded-xl border-2 border-green-500/50 p-5 flex flex-col items-center shadow-lg shadow-green-500/10`}>
        <div className="bg-green-500/20 p-3 rounded-full mb-4">
            <NoAdsIcon className="w-12 h-12 text-green-300" />
        </div>
        <div className="text-center mb-3 flex-grow">
             <h3 className="text-xl font-bold text-white">Remove Ads</h3>
             <p className="text-sm text-gray-400 mt-1">Permanently remove all video ads from the game.</p>
        </div>
        <button
            onClick={onPurchase}
            className="w-full py-2 mt-auto rounded-lg font-bold text-lg transition-colors duration-200 bg-green-600 hover:bg-green-500"
        >
            $4.99
        </button>
    </div>
);


export default GetGoldScreen;
