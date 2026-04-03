// @审计已完成
// 主题 Hook - 管理阅读主题

import useLocalStorageState from 'use-local-storage-state';
import type { Rendition } from 'epubjs';

export type ZhuTiLeiXing = 'light' | 'dark' | 'eye';

interface ZhuTiSheZhi {
  backgroundColor: string;
  textColor: string;
}

const ZHU_TI_PEIZHI: Record<ZhuTiLeiXing, ZhuTiSheZhi> = {
  light: { backgroundColor: '#ffffff', textColor: '#000000' },
  dark: { backgroundColor: '#111827', textColor: '#f9fafb' },
  eye: { backgroundColor: '#f5f5dc', textColor: '#333333' },
};

interface UseZhuTiProps {
  userId: string;
  bookId: string;
}

export function useZhuTi({ userId, bookId }: UseZhuTiProps) {
  const storageKey = `zhuti_${userId}_${bookId}`;
  
  const [zhuTi, setZhuTi] = useLocalStorageState<ZhuTiLeiXing>(
    storageKey,
    { defaultValue: 'light' }
  );

  const yingYongZhuTi = (rendition: Rendition, theme: ZhuTiLeiXing) => {
    const peizhi = ZHU_TI_PEIZHI[theme];
    const themes = rendition.themes;
    themes.override('color', peizhi.textColor);
    themes.override('background', peizhi.backgroundColor);
    themes.default({
      '.epubjs-hl': {
        'fill': 'yellow',
        'fill-opacity': '0.3',
        'mix-blend-mode': 'multiply'
      }
    });
  };

  return {
    zhuTi,
    setZhuTi,
    yingYongZhuTi,
    ZHU_TI_PEIZHI,
  };
}
