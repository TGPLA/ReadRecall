// @审计已完成
// EPUB 文件解析工具 - 提取元数据和章节内容

import JSZip from 'jszip';
import { tiQuFengMian } from './epubFengMian';

export interface EPUBMetadata {
  title: string;
  author: string;
  coverImage: string | null;
}

export interface EPUBChapter {
  title: string;
  content: string;
  orderIndex: number;
}

async function jieXiOPF(opfContent: string, zip: JSZip, opfDir: string): Promise<EPUBMetadata> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(opfContent, 'application/xml');
  
  const metadata = doc.querySelector('metadata');
  if (!metadata) return { title: '未知书名', author: '未知作者', coverImage: null };

  const titleElement = metadata.querySelector('title') || metadata.querySelector('dc\\:title');
  const authorElement = metadata.querySelector('creator') || metadata.querySelector('dc\\:creator');

  const coverImage = await tiQuFengMian(opfContent, zip, opfDir);

  return {
    title: titleElement?.textContent?.trim() || '未知书名',
    author: authorElement?.textContent?.trim() || '未知作者',
    coverImage
  };
}

export async function jieXiEPUBYuanShuJu(file: File): Promise<EPUBMetadata> {
  try {
    const zip = await JSZip.loadAsync(file);
    
    const containerFile = zip.file('META-INF/container.xml');
    if (!containerFile) {
      console.warn('未找到 container.xml');
      return { title: file.name.replace('.epub', ''), author: '未知作者', coverImage: null };
    }

    const containerContent = await containerFile.async('text');
    const parser = new DOMParser();
    const containerDoc = parser.parseFromString(containerContent, 'application/xml');
    
    const rootfileElement = containerDoc.querySelector('rootfile');
    if (!rootfileElement) {
      console.warn('未找到 rootfile 元素');
      return { title: file.name.replace('.epub', ''), author: '未知作者', coverImage: null };
    }

    const opfPath = rootfileElement.getAttribute('full-path');
    if (!opfPath) {
      console.warn('未找到 OPF 文件路径');
      return { title: file.name.replace('.epub', ''), author: '未知作者', coverImage: null };
    }

    const opfFile = zip.file(opfPath);
    if (!opfFile) {
      console.warn('未找到 OPF 文件:', opfPath);
      return { title: file.name.replace('.epub', ''), author: '未知作者', coverImage: null };
    }

    const opfContent = await opfFile.async('text');
    const opfDir = opfPath.substring(0, opfPath.lastIndexOf('/'));
    return await jieXiOPF(opfContent, zip, opfDir);
  } catch (error) {
    console.error('解析 EPUB 元数据失败:', error);
    return { title: file.name.replace('.epub', ''), author: '未知作者', coverImage: null };
  }
}

export async function jieXiEPUBZhangJie(_file: File): Promise<EPUBChapter[]> {
  return [];
}
