// @审计已完成
// 智谱AI服务 - 请求响应结构体
package services

type ZhipuRequest struct {
	Model       string         `json:"model"`
	Messages    []ZhipuMessage `json:"messages"`
	Temperature float64        `json:"temperature"`
	MaxTokens   int            `json:"max_tokens"`
}

type ZhipuMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ZhipuResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error"`
}

type GenerateQuestionsResult struct {
	Questions []QuestionData `json:"questions"`
}

type QuestionData struct {
	Question       string `json:"question"`
	Answer         string `json:"answer"`
	Type           string `json:"type"`
	KnowledgePoint string `json:"knowledgePoint"`
}

type EvaluateAnswerResult struct {
	Evaluation      string          `json:"evaluation"`
	Supplement      string          `json:"supplement"`
	Translation     string          `json:"translation"`
	Scenario        string          `json:"scenario"`
	VocabularyCards []VocabularyCard `json:"vocabularyCards"`
}

type VocabularyCard struct {
	Term       string `json:"term"`
	Definition string `json:"definition"`
	Context    string `json:"context"`
}

type SelectionQuestionData struct {
	Question       string `json:"question"`
	Answer         string `json:"answer"`
	KnowledgePoint string `json:"knowledge_point"`
}

type GenerateSelectionQuestionsResult struct {
	Questions []SelectionQuestionData `json:"questions"`
}
