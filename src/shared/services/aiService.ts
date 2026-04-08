// @审计已完成
// AI 服务 - 统一的 AI 相关 API 调用

import type { ConceptEvaluation } from '@infrastructure/types';
import { YingYongCuoWu } from '@shared/utils/common/CuoWuDingYi';
import { translateError } from '@shared/utils/common/errorTranslator';
import { authService } from './auth';

const API_BASE = '/api';

interface RawGeneratedQuestion {
  question: string;
  answer: string;
  type: string;
  knowledge_point: string;
}

interface RawGeneratedQuestionsResponse {
  questions: RawGeneratedQuestion[];
  count: number;
}

interface RawEvaluationResponse {
  evaluation: string;
  supplement: string;
  translation?: string;
  scenario?: string;
  vocabulary_cards?: Array<{
    term: string;
    definition: string;
    context: string;
  }>;
}

function zhuanHuanTiMu(raw: RawGeneratedQuestion) {
  return {
    question: raw.question,
    answer: raw.answer,
    type: raw.type,
    knowledgePoint: raw.knowledge_point,
  };
}

function zhuanHuanPingJia(raw: RawEvaluationResponse): ConceptEvaluation {
  return {
    evaluation: raw.evaluation,
    supplement: raw.supplement,
    translation: raw.translation,
    scenario: raw.scenario,
    vocabularyCards: raw.vocabulary_cards?.map(card => ({
      term: card.term,
      definition: card.definition,
      context: card.context,
    })),
  };
}

export interface GenerateQuestionsResult {
  questions: Array<{
    question: string;
    answer: string;
    type: string;
    knowledgePoint: string;
  }>;
}

export interface GenerateQuestionsAutoResult {
  questions: Array<{
    question: string;
    answer: string;
    type: string;
    knowledgePoint: string;
  }>;
  questionType: string;
}

export interface TextAnalysisResult {
  type: string;
  title: string;
  options: string[];
  description: string;
}

export interface ConceptExplanationResult {
  explanation: string;
  example: string;
}

export interface ParaphraseResult {
  paraphrase: string;
}

class AIService {
  private getHeaders(): Record<string, string> {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  }

  private async handle401(response: Response): Promise<boolean> {
    if (response.status === 401) {
      await authService.signOut();
      window.location.reload();
      return true;
    }
    return false;
  }

  async generateFromSelection(chapterId: string, selectedText: string, questionType: string, count: number): Promise<{ data: GenerateQuestionsResult | null; error: string | null }> {
    try {
      const response = await fetch(`${API_BASE}/ai/generate-from-selection`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          chapter_id: chapterId,
          selected_text: selectedText,
          question_type: questionType,
          count,
        }),
      });

      if (await this.handle401(response)) {
        return { data: null, error: '登录已过期' };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw YingYongCuoWu.yeWu(translateError(errorData.error || `请求失败：${response.status}`));
      }

      const responseData = await response.json() as RawGeneratedQuestionsResponse;
      const questions = (responseData?.questions || []).map(zhuanHuanTiMu);
      return { data: { questions }, error: null };
    } catch (error) {
      if (error instanceof YingYongCuoWu) {
        return { data: null, error: error.message };
      }
      return { data: null, error: error instanceof Error ? error.message : 'AI 生成题目失败' };
    }
  }

  async generateFromSelectionAuto(chapterId: string, selectedText: string, count: number): Promise<{ data: GenerateQuestionsAutoResult | null; error: string | null }> {
    try {
      const response = await fetch(`${API_BASE}/ai/generate-from-selection-auto`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          chapter_id: chapterId,
          selected_text: selectedText,
          count,
        }),
      });

      if (await this.handle401(response)) {
        return { data: null, error: '登录已过期' };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw YingYongCuoWu.yeWu(translateError(errorData.error || `请求失败：${response.status}`));
      }

      const responseData = await response.json() as {
        questions: RawGeneratedQuestion[];
        count: number;
        question_type: string;
      };
      const questions = (responseData?.questions || []).map(zhuanHuanTiMu);
      return { 
        data: { 
          questions, 
          questionType: responseData.question_type 
        }, 
        error: null 
      };
    } catch (error) {
      if (error instanceof YingYongCuoWu) {
        return { data: null, error: error.message };
      }
      return { data: null, error: error instanceof Error ? error.message : 'AI 生成题目失败' };
    }
  }

  async analyzeText(content: string): Promise<{ data: TextAnalysisResult | null; error: string | null }> {
    try {
      const response = await fetch(`${API_BASE}/ai/analyze-text`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ content }),
      });

      if (await this.handle401(response)) {
        return { data: null, error: '登录已过期' };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw YingYongCuoWu.yeWu(translateError(errorData.error || `请求失败：${response.status}`));
      }

      const responseData = await response.json() as { data: TextAnalysisResult };
      return { data: responseData.data, error: null };
    } catch (error) {
      if (error instanceof YingYongCuoWu) {
        return { data: null, error: error.message };
      }
      return { data: null, error: error instanceof Error ? error.message : 'AI 分析失败' };
    }
  }

  async explainConcept(content: string): Promise<{ data: ConceptExplanationResult | null; error: string | null }> {
    try {
      const response = await fetch(`${API_BASE}/ai/explain-concept`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ content }),
      });

      if (await this.handle401(response)) {
        return { data: null, error: '登录已过期' };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw YingYongCuoWu.yeWu(translateError(errorData.error || `请求失败：${response.status}`));
      }

      const responseData = await response.json() as { data: ConceptExplanationResult };
      return { data: responseData.data, error: null };
    } catch (error) {
      if (error instanceof YingYongCuoWu) {
        return { data: null, error: error.message };
      }
      return { data: null, error: error instanceof Error ? error.message : 'AI 解释失败' };
    }
  }

  async paraphraseText(content: string): Promise<{ data: ParaphraseResult | null; error: string | null }> {
    try {
      const response = await fetch(`${API_BASE}/ai/paraphrase-text`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ content }),
      });

      if (await this.handle401(response)) {
        return { data: null, error: '登录已过期' };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw YingYongCuoWu.yeWu(translateError(errorData.error || `请求失败：${response.status}`));
      }

      const responseData = await response.json() as { data: ParaphraseResult };
      return { data: responseData.data, error: null };
    } catch (error) {
      if (error instanceof YingYongCuoWu) {
        return { data: null, error: error.message };
      }
      return { data: null, error: error instanceof Error ? error.message : 'AI 复述失败' };
    }
  }

  async evaluateAnswer(questionId: string, userAnswer: string): Promise<{ data: ConceptEvaluation | null; error: string | null }> {
    try {
      const response = await fetch(`${API_BASE}/ai/evaluate-answer`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          question_id: questionId,
          user_answer: userAnswer,
        }),
      });

      if (await this.handle401(response)) {
        return { data: null, error: '登录已过期' };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw YingYongCuoWu.yeWu(translateError(errorData.error || `请求失败：${response.status}`));
      }

      const responseData = await response.json() as { data: RawEvaluationResponse };
      return { data: zhuanHuanPingJia(responseData.data), error: null };
    } catch (error) {
      if (error instanceof YingYongCuoWu) {
        return { data: null, error: error.message };
      }
      return { data: null, error: error instanceof Error ? error.message : 'AI 评价失败' };
    }
  }

  async recordPractice(questionId: string, userAnswer: string, aiEvaluation: string): Promise<{ error: string | null }> {
    try {
      const response = await fetch(`${API_BASE}/questions/${questionId}/practice`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          user_answer: userAnswer,
          ai_evaluation: aiEvaluation,
        }),
      });

      if (await this.handle401(response)) {
        return { error: '登录已过期' };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw YingYongCuoWu.yeWu(translateError(errorData.error || `请求失败：${response.status}`));
      }

      return { error: null };
    } catch (error) {
      if (error instanceof YingYongCuoWu) {
        return { error: error.message };
      }
      return { error: error instanceof Error ? error.message : '记录练习失败' };
    }
  }

  async extractConcepts(chapterId?: string, paragraphId?: string, content?: string): Promise<{ data: { concepts: Array<{ id?: string; concept: string; explanation: string }> } | null; error: string | null }> {
    try {
      console.log('🔍 提取概念 - chapterId:', chapterId, 'paragraphId:', paragraphId, 'content 长度:', content?.length);
      const response = await fetch(`${API_BASE}/ai/extract-concepts`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          chapter_id: chapterId || '',
          paragraph_id: paragraphId || '',
          content: content || '',
        }),
      });

      if (await this.handle401(response)) {
        return { data: null, error: '登录已过期' };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw YingYongCuoWu.yeWu(translateError(errorData.error || `请求失败：${response.status}`));
      }

      const responseData = await response.json();
      return { data: responseData.data, error: null };
    } catch (error) {
      if (error instanceof YingYongCuoWu) {
        return { data: null, error: error.message };
      }
      return { data: null, error: error instanceof Error ? error.message : 'AI 提取概念失败' };
    }
  }

  async getConcepts(sourceType: string, sourceId: string): Promise<{ data: { concepts: Array<{ id: string; concept: string; explanation: string; has_practice: boolean; last_practice?: any }> } | null; error: string | null }> {
    try {
      const response = await fetch(`${API_BASE}/concepts/${sourceType}/${sourceId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (await this.handle401(response)) {
        return { data: null, error: '登录已过期' };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw YingYongCuoWu.yeWu(translateError(errorData.error || `请求失败：${response.status}`));
      }

      const responseData = await response.json();
      return { data: responseData.data, error: null };
    } catch (error) {
      if (error instanceof YingYongCuoWu) {
        return { data: null, error: error.message };
      }
      return { data: null, error: error instanceof Error ? error.message : '获取概念失败' };
    }
  }

  async saveConceptPractice(conceptId: string, userAnswer: string, aiEvaluation: string): Promise<{ data: { id: string } | null; error: string | null }> {
    try {
      const response = await fetch(`${API_BASE}/concepts/${conceptId}/practice`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          user_answer: userAnswer,
          ai_evaluation: aiEvaluation,
        }),
      });

      if (await this.handle401(response)) {
        return { data: null, error: '登录已过期' };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw YingYongCuoWu.yeWu(translateError(errorData.error || `请求失败：${response.status}`));
      }

      const responseData = await response.json();
      return { data: responseData.data, error: null };
    } catch (error) {
      if (error instanceof YingYongCuoWu) {
        return { data: null, error: error.message };
      }
      return { data: null, error: error instanceof Error ? error.message : '保存练习记录失败' };
    }
  }

  async evaluateConcept(concept: string, explanation: string, userAnswer: string): Promise<{ data: { evaluation: string } | null; error: string | null }> {
    try {
      const response = await fetch(`${API_BASE}/ai/evaluate-concept`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          concept,
          explanation,
          user_answer: userAnswer,
        }),
      });

      if (await this.handle401(response)) {
        return { data: null, error: '登录已过期' };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw YingYongCuoWu.yeWu(translateError(errorData.error || `请求失败：${response.status}`));
      }

      const responseData = await response.json();
      return { data: responseData.data, error: null };
    } catch (error) {
      if (error instanceof YingYongCuoWu) {
        return { data: null, error: error.message };
      }
      return { data: null, error: error instanceof Error ? error.message : 'AI 评价失败' };
    }
  }

  async evaluateIntention(paragraph: string, userAnswer: string): Promise<{ data: { correct: string; incorrect: string; incomplete: string } | null; error: string | null }> {
    try {
      const response = await fetch(`${API_BASE}/ai/evaluate-intention`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          paragraph,
          user_answer: userAnswer,
        }),
      });

      if (await this.handle401(response)) {
        return { data: null, error: '登录已过期' };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw YingYongCuoWu.yeWu(translateError(errorData.error || `请求失败：${response.status}`));
      }

      const responseData = await response.json();
      return { data: responseData.data, error: null };
    } catch (error) {
      if (error instanceof YingYongCuoWu) {
        return { data: null, error: error.message };
      }
      return { data: null, error: error instanceof Error ? error.message : 'AI 评价失败' };
    }
  }
}

export const aiService = new AIService();
