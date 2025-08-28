import { Capacitor } from '@capacitor/core';
import { AdMob, AdOptions, BannerAdOptions, BannerAdSize, BannerAdPosition, RewardAdOptions, InterstitialAdOptions } from '@capacitor-community/admob';

type InitIds = { appId: string; banner: string; interstitial: string; rewarded: string };

let initialized = false;
let cachedIds: InitIds | null = null;

const TEST_IDS = {
  appId: 'ca-app-pub-3940256099942544~1458002511',
  banner: 'ca-app-pub-3940256099942544/2934735716',
  interstitial: 'ca-app-pub-3940256099942544/4411468910',
  rewarded: 'ca-app-pub-3940256099942544/1712485313',
};

export async function initAds(ids: InitIds): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    const useTest = import.meta.env.DEV;
    const appId = useTest ? TEST_IDS.appId : ids.appId;
    try {
      await AdMob.initialize({ initializeForTesting: useTest, requestTrackingAuthorization: false, appId });
      initialized = true;
      cachedIds = ids;
    } catch {}
  }
}

export async function showBanner(): Promise<void> {
  if (!initialized || !cachedIds) return;
  const useTest = import.meta.env.DEV;
  const adId = useTest ? TEST_IDS.banner : cachedIds.banner;
  const opts: BannerAdOptions = {
    adId,
    adSize: BannerAdSize.ADAPTIVE_BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 0,
    isTesting: useTest,
  } as any;
  try {
    await AdMob.showBanner(opts);
  } catch {}
}

export async function hideBanner(): Promise<void> {
  try { await AdMob.hideBanner(); } catch {}
}

export async function showInterstitial(): Promise<void> {
  if (!initialized || !cachedIds) return;
  const useTest = import.meta.env.DEV;
  const adId = useTest ? TEST_IDS.interstitial : cachedIds.interstitial;
  const opts: InterstitialAdOptions = { adId, isTesting: useTest } as any;
  try {
    await AdMob.prepareInterstitial(opts);
    await AdMob.showInterstitial();
  } catch {}
}

export async function showRewarded(onReward?: () => void): Promise<void> {
  const useTest = import.meta.env.DEV;
  // Web/dev fallback: simulate rewarded ad so flows can be tested on localhost
  if (!Capacitor.isNativePlatform() || !initialized || !cachedIds) {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (onReward) onReward();
    } catch {}
    return;
  }
  const adId = useTest ? TEST_IDS.rewarded : cachedIds.rewarded;
  const opts: RewardAdOptions = { adId, isTesting: useTest } as any;
  try {
    await AdMob.prepareRewardVideoAd(opts);
    const res = await AdMob.showRewardVideoAd();
    if (res?.adReward && onReward) onReward();
  } catch {}
}


