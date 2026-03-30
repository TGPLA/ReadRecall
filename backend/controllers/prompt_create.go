// @审计已完成
// 提示词模板控制器 - 创建操作
package controllers

import (
	"net/http"
	"reading-reflection/config"
	"reading-reflection/middleware"
	"reading-reflection/models"

	"github.com/gin-gonic/gin"
)

func CreatePromptTemplate(c *gin.Context) {
	userId := middleware.GetUserId(c)
	var req CreatePromptTemplateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	db := config.GetDB()

	template := models.PromptTemplate{
		UserId:       &userId,
		Name:         req.Name,
		QuestionType: req.QuestionType,
		Content:      req.Content,
		IsDefault:    req.IsDefault,
		IsSystem:     false,
	}

	if req.IsDefault {
		db.Model(&models.PromptTemplate{}).
			Where("user_id = ? AND question_type = ?", userId, req.QuestionType).
			Update("is_default", false)
	}

	if err := db.Create(&template).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "创建失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": template})
}

// InitSystemPrompts 初始化系统预设模板（临时接口）
func InitSystemPrompts(c *gin.Context) {
	db := config.GetDB()
	
	// 删除旧的系统模板
	db.Where("is_system = ?", 1).Delete(&models.PromptTemplate{})
	
	// 插入名词解释模板
	db.Create(&models.PromptTemplate{
		Name:         "名词解释 - 标准模板",
		QuestionType: "名词解释",
		Content: `你是一位专业的知识讲解老师。请根据以下段落内容，生成一道名词解释题。

【段落内容】
{{content}}

【要求】
1. 选择段落中的一个重要概念或术语
2. 题目格式：请解释"XXX"的含义
3. 答案应包含：定义、特点、应用场景
4. 答案长度：100-200 字

请以 JSON 格式返回：
{
  "question": "题目内容",
  "answer": "答案内容"
}`,
		IsDefault: true,
		IsSystem:  true,
	})
	
	// 插入意图理解模板
	db.Create(&models.PromptTemplate{
		Name:         "意图理解 - 标准模板",
		QuestionType: "意图理解",
		Content: `你是一位专业的阅读理解老师。请根据以下段落内容，生成一道意图理解题。

【段落内容】
{{content}}

【要求】
1. 针对段落的核心思想或作者意图提问
2. 题目格式：作者在这里想要表达什么？/这段话的核心观点是什么？
3. 答案应包含：核心观点、论证逻辑、深层含义
4. 答案长度：100-200 字

请以 JSON 格式返回：
{
  "question": "题目内容",
  "answer": "答案内容"
}`,
		IsDefault: true,
		IsSystem:  true,
	})
	
	// 插入生活应用模板
	db.Create(&models.PromptTemplate{
		Name:         "生活应用 - 标准模板",
		QuestionType: "生活应用",
		Content: `你是一位专业的应用指导老师。请根据以下段落内容，生成一道生活应用题。

【段落内容】
{{content}}

【要求】
1. 将段落知识与实际生活场景结合
2. 题目格式：在生活中，如何应用 XXX？/请举一个 XXX 的实际应用例子
3. 答案应包含：应用场景、具体步骤、注意事项
4. 答案长度：100-200 字

请以 JSON 格式返回：
{
  "question": "题目内容",
  "answer": "答案内容"
}`,
		IsDefault: true,
		IsSystem:  true,
	})
	
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "系统模板初始化成功"})
}
