// @审计已完成
// 智谱AI服务 - 划线出题功能（统一出题入口）

package services

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
)

func GetTypePrompt(questionType string) string {
	typePrompts := map[string]string{
		"名词解释": `请针对文本中的重要概念或术语出题。
题目格式：请解释"XXX"的含义
答案应包含：定义、特点、应用场景`,

		"意图理解": `请针对文本的核心思想或作者意图出题。
题目格式：作者在这里想要表达什么？/这段话的核心观点是什么？
答案应包含：核心观点、论证逻辑、深层含义`,

		"生活应用": `请将文本知识与实际生活场景结合出题。
题目格式：在生活中，如何应用XXX？/请举一个XXX的实际应用例子
答案应包含：应用场景、具体步骤、注意事项`,
	}

	if prompt, ok := typePrompts[questionType]; ok {
		return prompt
	}
	return typePrompts["名词解释"]
}

func (s *ZhipuAIService) GenerateQuestionsFromSelection(content, questionType string, count int) (*GenerateSelectionQuestionsResult, error) {
	typePrompt := GetTypePrompt(questionType)

	systemPrompt := `你是一个专业的教育出题专家，擅长基于给定文本内容生成高质量的主动回忆练习题。

重要原则：
1. 只根据用户提供的【文本】内容出题
2. 严禁使用任何文本之外的知识或信息
3. 题目必须严谨、准确、贴合文本
4. 所有答案必须能在文本中找到依据`

	userPrompt := fmt.Sprintf(`请根据以下【文本】内容，生成 %d 个基于主动回忆原则的练习题。

题型要求：
%s

【文本】：
%s

请输出纯 JSON 数组格式，不要包含其他文字或解释。
格式：[{"question": "题目内容", "answer": "答案内容", "knowledge_point": "知识点"}]`, count, typePrompt, content)

	responseContent, err := s.callAPI(systemPrompt, userPrompt, 4000)
	if err != nil {
		return nil, err
	}

	questions := parseSelectionQuestionsJSON(responseContent)
	if len(questions) == 0 {
		return nil, fmt.Errorf("无法解析 AI 返回的题目，请重试")
	}

	return &GenerateSelectionQuestionsResult{Questions: questions}, nil
}

func parseSelectionQuestionsJSON(content string) []SelectionQuestionData {
	content = strings.TrimSpace(content)
	content = regexp.MustCompile("```json\\s*").ReplaceAllString(content, "")
	content = regexp.MustCompile("```\\s*").ReplaceAllString(content, "")

	match := regexp.MustCompile(`\[[\s\S]*\]`).FindString(content)
	if match == "" {
		return nil
	}

	var questions []SelectionQuestionData
	if err := json.Unmarshal([]byte(match), &questions); err != nil {
		return nil
	}

	return questions
}

func (s *ZhipuAIService) AutoDetectQuestionType(content string) (string, error) {
	systemPrompt := `你是一个专业的教育专家，擅长判断一段文本最适合哪种练习题型。

请只返回选项字母，不要包含其他文字。`

	userPrompt := fmt.Sprintf(`请判断以下【文本】最适合哪种练习题型？

选项：
A) 名词解释 - 文本中有重要概念、术语、定义需要解释
B) 意图理解 - 文本表达作者观点、思想、情感需要理解
C) 生活应用 - 文本内容可以与实际生活场景结合应用

【文本】：
%s

请只返回 A、B 或 C，不要包含其他任何文字。`, content)

	responseContent, err := s.callAPI(systemPrompt, userPrompt, 500)
	if err != nil {
		return "", err
	}

	responseContent = strings.TrimSpace(responseContent)
	
	if strings.Contains(responseContent, "A") {
		return "名词解释", nil
	} else if strings.Contains(responseContent, "B") {
		return "意图理解", nil
	} else if strings.Contains(responseContent, "C") {
		return "生活应用", nil
	}

	return "名词解释", nil
}

func (s *ZhipuAIService) GenerateQuestionsAutoType(content string, count int) (*GenerateSelectionQuestionsResult, string, error) {
	questionType, err := s.AutoDetectQuestionType(content)
	if err != nil {
		return nil, "名词解释", err
	}

	result, err := s.GenerateQuestionsFromSelection(content, questionType, count)
	return result, questionType, err
}

type TextAnalysisResult struct {
	Type        string   `json:"type"`
	Title       string   `json:"title"`
	Options     []string `json:"options"`
	Description string   `json:"description"`
}

func (s *ZhipuAIService) AnalyzeText(content string) (*TextAnalysisResult, error) {
	systemPrompt := `你是一个专业的教育专家，擅长分析一段文本最适合哪种学习方式。你的目标是根据文本内容，推荐最合适的学习选项。`

	userPrompt := fmt.Sprintf(`请分析以下【文本】的类型，并给出最适合的学习选项。

【文本】：
%s

判断标准：
- concept（概念）：文本包含专业术语、定义、重要概念，需要解释
- argument（论点）：文本表达观点、思想、论证，需要理解作者意图
- story（故事）：文本是叙事、故事、例子，可以复述
- fact（事实）：文本是事实性内容，可以出题考察
- other（其他）：不属于以上类型

请返回JSON格式，包含以下字段：
- type: 文本类型（concept/argument/story/fact/other）
- title: 简短的类型描述（如"专业概念"、"作者观点"、"故事内容"、"事实陈述"）
- options: 学习选项数组，推荐1-3个，可包含：
  - "explain" - 解释概念（当type为concept时必须包含）
  - "paraphrase" - 用自己的话复述（适合story或argument）
  - "quiz" - AI出题（适合所有类型）
- description: 对文本的简短描述（20字以内）

只返回JSON，不要包含其他文字。`, content)

	responseContent, err := s.callAPI(systemPrompt, userPrompt, 1000)
	if err != nil {
		return nil, err
	}

	responseContent = strings.TrimSpace(responseContent)
	
	jsonMatch := regexp.MustCompile(`\{[\s\S]*\}`).FindString(responseContent)
	if jsonMatch == "" {
		return &TextAnalysisResult{
			Type:        "other",
			Title:       "文本",
			Options:     []string{"paraphrase", "quiz"},
			Description: "这段文本可以通过复述或出题来学习",
		}, nil
	}

	var result TextAnalysisResult
	err = json.Unmarshal([]byte(jsonMatch), &result)
	if err != nil {
		return &TextAnalysisResult{
			Type:        "other",
			Title:       "文本",
			Options:     []string{"paraphrase", "quiz"},
			Description: "这段文本可以通过复述或出题来学习",
		}, nil
	}

	if result.Type == "concept" {
		hasExplain := false
		for _, opt := range result.Options {
			if opt == "explain" {
				hasExplain = true
				break
			}
		}
		if !hasExplain {
			result.Options = append([]string{"explain"}, result.Options...)
		}
	}

	if len(result.Options) == 0 {
		result.Options = []string{"paraphrase", "quiz"}
	}

	return &result, nil
}

type ConceptExplanationResult struct {
	Explanation string `json:"explanation"`
	Example     string `json:"example"`
}

func (s *ZhipuAIService) ExplainConcept(content string) (*ConceptExplanationResult, error) {
	systemPrompt := `你是一个专业的教育专家，擅长用最简单、最通俗的语言解释复杂的概念。你特别擅长用生活化的例子让抽象概念变得具体易懂。`

	userPrompt := fmt.Sprintf(`请用简单易懂的语言解释以下【概念】。

【概念】：
%s

解释要求：
1. 用大白话，不要用学术术语
2. 200字以内，越简短越好
3. 重点讲清楚"是什么"和"有什么用"

例子要求：
1. 生活化的例子，贴近日常
2. 100字以内
3. 让读者一看就懂

请返回JSON格式，包含以下字段：
- explanation: 详细解释
- example: 一个简单的例子

只返回JSON，不要包含其他文字。`, content)

	responseContent, err := s.callAPI(systemPrompt, userPrompt, 1000)
	if err != nil {
		return nil, err
	}

	responseContent = strings.TrimSpace(responseContent)
	
	jsonMatch := regexp.MustCompile(`\{[\s\S]*\}`).FindString(responseContent)
	if jsonMatch == "" {
		return &ConceptExplanationResult{
			Explanation: content,
			Example:     "",
		}, nil
	}

	var result ConceptExplanationResult
	err = json.Unmarshal([]byte(jsonMatch), &result)
	if err != nil {
		return &ConceptExplanationResult{
			Explanation: content,
			Example:     "",
		}, nil
	}

	return &result, nil
}

type ParaphraseResult struct {
	Paraphrase string `json:"paraphrase"`
}

func (s *ZhipuAIService) ParaphraseText(content string) (*ParaphraseResult, error) {
	systemPrompt := `你是一个专业的教育专家，擅长用不同的表达方式复述同一段内容。你的目标是帮助用户用自己的话理解文本，而不是简单的同义词替换。`

	userPrompt := fmt.Sprintf(`请用你自己的话复述以下【文本】。

【文本】：
%s

复述要求：
1. 保持原意不变，但表达方式完全不同
2. 用更通俗易懂的语言
3. 300字以内
4. 像给朋友讲解一样自然

请返回JSON格式，包含以下字段：
- paraphrase: 复述后的内容

只返回JSON，不要包含其他文字。`, content)

	responseContent, err := s.callAPI(systemPrompt, userPrompt, 1500)
	if err != nil {
		return nil, err
	}

	responseContent = strings.TrimSpace(responseContent)
	
	jsonMatch := regexp.MustCompile(`\{[\s\S]*\}`).FindString(responseContent)
	if jsonMatch == "" {
		return &ParaphraseResult{
			Paraphrase: content,
		}, nil
	}

	var result ParaphraseResult
	err = json.Unmarshal([]byte(jsonMatch), &result)
	if err != nil {
		return &ParaphraseResult{
			Paraphrase: content,
		}, nil
	}

	return &result, nil
}
