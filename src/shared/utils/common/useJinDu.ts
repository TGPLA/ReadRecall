// @审计已完成
// AI 操作进度管理 Hook

import { useState, useCallback } from 'react';

interface JinDuZhuangTai {
  tiShi: string;
  jinDu?: number;
}

export function useJinDu() {
  const [zhuangTai, setZhuangTai] = useState<JinDuZhuangTai | null>(null);

  const xianShiJinDu = useCallback((tiShi: string, jinDu?: number) => {
    setZhuangTai({ tiShi, jinDu });
  }, []);

  const yinCangJinDu = useCallback(() => {
    setZhuangTai(null);
  }, []);

  const yiBuCaoZuo = useCallback(async <T,>(
    tiShi: string,
    caoZuo: () => Promise<T>,
  ): Promise<T | undefined> => {
    xianShiJinDu(tiShi);
    try {
      const result = await caoZuo();
      yinCangJinDu();
      return result;
    } catch (error) {
      yinCangJinDu();
      throw error;
    }
  }, [xianShiJinDu, yinCangJinDu]);

  return {
    zhuangTai,
    xianShiJinDu,
    yinCangJinDu,
    yiBuCaoZuo,
  };
}