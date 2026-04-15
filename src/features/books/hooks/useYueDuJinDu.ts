// @审计已完成
// 阅读进度 Hook - 持久化阅读位置

import useLocalStorageState from 'use-local-storage-state';

interface YueDuJinDuProps {
  userId: string;
  bookId: string;
}

export function useYueDuJinDu({ userId, bookId }: YueDuJinDuProps) {
  const storageKey = `yuedu_jindu_${userId}_${bookId}`;
  
  const [location, setLocation] = useLocalStorageState<string | number>(
    storageKey,
    { defaultValue: 0 }
  );

  const wrappedSetLocation = (newLocation: string | number) => {
    console.log('useYueDuJinDu - 保存位置:', newLocation, 'storageKey:', storageKey);
    setLocation(newLocation);
  };

  console.log('useYueDuJinDu - 读取位置:', location, 'storageKey:', storageKey);

  return {
    location,
    setLocation: wrappedSetLocation,
  };
}
