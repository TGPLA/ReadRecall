// @审计已完成
// Toast 工具函数 - 统一的消息提示

import { showToast } from './ToastRongQi';

export function showSuccess(message: string) {
  showToast('success', message);
}

export function showError(message: string) {
  showToast('error', message);
}

export function showWarning(message: string) {
  showToast('warning', message);
}

export function showInfo(message: string) {
  showToast('info', message);
}
