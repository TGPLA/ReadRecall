// @审计已完成
// 主题 Hook - 管理阅读主题配色（浅色/深色）

import useLocalStorageState from 'use-local-storage-state';
import type { Rendition } from 'epubjs';

export type ZhuTiLeiXing = 'light' | 'dark';

interface ZhuTiSheZhi {
  backgroundColor: string;
  textColor: string;
  titleColor: string;
}

const ZHU_TI_PEIZHI: Record<ZhuTiLeiXing, ZhuTiSheZhi> = {
  light: { backgroundColor: '#F2F2F4', textColor: '#1A1A2E', titleColor: '#A04030' },
  dark: { backgroundColor: '#222228', textColor: '#BBBBc4', titleColor: '#D4707E' },
};

interface UseZhuTiProps {
  userId: string;
  bookId: string;
}

export function useZhuTi({ userId, bookId }: UseZhuTiProps) {
  const storageKey = `zhuti_${userId}_${bookId}`;
  const [zhuTi, setZhuTi] = useLocalStorageState<ZhuTiLeiXing>(storageKey, { defaultValue: 'light' });

  const qieHuanZhuTi = () => {
    setZhuTi(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const yingYongZhuTi = (rendition: Rendition, theme: ZhuTiLeiXing) => {
    const peizhi = ZHU_TI_PEIZHI[theme];
    const themes = rendition.themes;
    themes.override('color', peizhi.textColor);
    themes.override('background', peizhi.backgroundColor);
    themes.default({
      body: {
        'background-color': `${peizhi.backgroundColor} !important`,
        'color': `${peizhi.textColor} !important`,
      },
      '*': {
        'background-color': `${peizhi.backgroundColor} !important`,
        'color': `${peizhi.textColor} !important`,
        'max-width': 'none !important',
      },
      '.epubjs-hl': { 'fill-opacity': '0.3', 'mix-blend-mode': 'multiply' },
      '.hl-yellow': { 'fill': '#fef08a' },
      '.hl-green': { 'fill': '#86efac' },
      '.hl-blue': { 'fill': '#93c5fd' },
      '.hl-pink': { 'fill': '#f9a8d4' },
    });
  };

  return { zhuTi, setZhuTi, qieHuanZhuTi, yingYongZhuTi, ZHU_TI_PEIZHI };
}