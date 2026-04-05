// @审计已完成
// 搜索 Hook - 书籍全文搜索

import { useState, useCallback } from 'react';
import type { Rendition } from 'epubjs';

interface SouSuoJieGuo {
  cfi: string;
  excerpt: string;
}

export function useSouSuo() {
  const [souSuoCi, setSouSuoCi] = useState('');
  const [souSuoJieGuo, setSouSuoJieGuo] = useState<SouSuoJieGuo[]>([]);
  const [dangQianJieGuoSuoYin, setDangQianJieGuoSuoYin] = useState(0);
  const [shangCiJieGuo, setShangCiJieGuo] = useState<SouSuoJieGuo[]>([]);

  const qingChuHuaXian = useCallback((rendition: Rendition) => {
    shangCiJieGuo.forEach((jieGuo) => {
      rendition.annotations?.remove(jieGuo.cfi, 'highlight');
    });
    setShangCiJieGuo([]);
  }, [shangCiJieGuo]);

  const gaoLiangSouSuoJieGuo = useCallback((rendition: Rendition, jieGuo: SouSuoJieGuo[]) => {
    jieGuo.forEach((jieGuoXiang) => {
      rendition.annotations?.highlight(
        jieGuoXiang.cfi,
        {},
        () => {},
        'epubjs-hl',
        {
          'fill': 'yellow',
          'fill-opacity': '0.3',
          'mix-blend-mode': 'multiply'
        }
      );
    });
  }, []);

  const tiaoDaoXiaYiGe = useCallback(() => {
    if (!souSuoJieGuo.length) return;
    const xiaYiGeSuoYin = (dangQianJieGuoSuoYin + 1) % souSuoJieGuo.length;
    setDangQianJieGuoSuoYin(xiaYiGeSuoYin);
    return souSuoJieGuo[xiaYiGeSuoYin].cfi;
  }, [souSuoJieGuo, dangQianJieGuoSuoYin]);

  const tiaoDaoShangYiGe = useCallback(() => {
    if (!souSuoJieGuo.length) return;
    const shangYiGeSuoYin = (dangQianJieGuoSuoYin - 1 + souSuoJieGuo.length) % souSuoJieGuo.length;
    setDangQianJieGuoSuoYin(shangYiGeSuoYin);
    return souSuoJieGuo[shangYiGeSuoYin].cfi;
  }, [souSuoJieGuo, dangQianJieGuoSuoYin]);

  const chuLiSouSuoJieGuo = useCallback((jieGuo: SouSuoJieGuo[], rendition?: Rendition) => {
    if (rendition) {
      qingChuHuaXian(rendition);
      gaoLiangSouSuoJieGuo(rendition, jieGuo);
    }
    setShangCiJieGuo(jieGuo);
    setSouSuoJieGuo(jieGuo);
    setDangQianJieGuoSuoYin(0);
  }, [qingChuHuaXian, gaoLiangSouSuoJieGuo]);

  return {
    souSuoCi,
    setSouSuoCi,
    souSuoJieGuo,
    dangQianJieGuoSuoYin,
    tiaoDaoXiaYiGe,
    tiaoDaoShangYiGe,
    chuLiSouSuoJieGuo,
  };
}
