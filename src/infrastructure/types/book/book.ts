export interface Book {
  id: string;
  userId: string;
  title: string;
  author: string;
  coverUrl?: string;
  epubFilePath?: string;
  chapterCount: number;
  questionCount: number;
  summary?: string;
  contents?: string;
  keyPoints?: string[];
  createdAt: number;
  updatedAt?: number;
}

export interface CreateBookInput {
  title: string;
  author: string;
  coverUrl?: string;
}

export interface UpdateBookInput {
  title?: string;
  author?: string;
  coverUrl?: string;
  summary?: string;
  contents?: string;
  keyPoints?: string[];
}
