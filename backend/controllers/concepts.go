// @审计已完成
// AI控制器 - 概念提取和管理
package controllers

import (
	"net/http"
	"reading-reflection/config"
	"reading-reflection/middleware"
	"reading-reflection/models"
	"reading-reflection/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func AIExtractConcepts(c *gin.Context) {
	userId := middleware.GetUserId(c)
	if userId == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "未授权"})
		return
	}

	var req struct {
		ChapterId   string `json:"chapter_id"`
		ParagraphId string `json:"paragraph_id"`
		Content     string `json:"content"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "请求参数错误：" + err.Error()})
		return
	}

	println("📝 收到请求 - ChapterId:", req.ChapterId, "ParagraphId:", req.ParagraphId)

	var sourceType string
	var sourceId string
	var content string

	db := config.GetDB()

	if req.ChapterId != "" {
		sourceType = "chapter"
		sourceId = req.ChapterId
		var chapter models.Chapter
		result := db.Where("id = ? AND user_id = ?", req.ChapterId, userId).First(&chapter)
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "章节不存在"})
			return
		}
		content = chapter.Content
	} else if req.ParagraphId != "" {
		sourceType = "paragraph"
		sourceId = req.ParagraphId
		var paragraph models.Paragraph
		result := db.Where("id = ? AND user_id = ?", req.ParagraphId, userId).First(&paragraph)
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "段落不存在"})
			return
		}
		content = paragraph.Content
	} else if req.Content != "" {
		sourceType = "temporary"
		sourceId = ""
		content = req.Content
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "必须提供 chapter_id、paragraph_id 或 content"})
		return
	}

	if sourceType != "temporary" && sourceId != "" {
		var existingConcepts []models.Concept
		result := db.Where("user_id = ? AND source_type = ? AND source_id = ?", userId, sourceType, sourceId).
			Order("order_index ASC").
			Find(&existingConcepts)
		println("📊 查询结果 - 错误:", result.Error, "数量:", len(existingConcepts))
		if result.Error == nil && len(existingConcepts) > 0 {
			println("✅ 从数据库返回概念，数量:", len(existingConcepts))
			
			seenConcepts := make(map[string]bool)
			var uniqueConcepts []map[string]string
			
			for _, concept := range existingConcepts {
				if !seenConcepts[concept.Concept] {
					seenConcepts[concept.Concept] = true
					uniqueConcepts = append(uniqueConcepts, map[string]string{
						"id":         concept.ID,
						"concept":    concept.Concept,
						"explanation": concept.Explanation,
					})
				}
			}
			
			if len(uniqueConcepts) != len(existingConcepts) {
				println("⚠️ 发现重复概念，已去重。原数量:", len(existingConcepts), "去重后数量:", len(uniqueConcepts))
			}
			
			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"data": gin.H{
					"concepts": uniqueConcepts,
				},
			})
			return
		}
		println("🤖 数据库中没有概念，需要调用 AI 提取")
	}

	var userSettings models.Settings
	db.Where("user_id = ?", userId).First(&userSettings)

	apiKey := config.GetZhipuAPIKey(userSettings.ZhipuAPIKey)
	if apiKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "请先在设置页面配置智谱 AI API Key"})
		return
	}

	model := userSettings.ZhipuModel
	if model == "" {
		model = config.AppConfig.ZhipuModel
	}

	aiService := services.NewZhipuAIService(apiKey, model)
	result, err := aiService.ExtractConcepts(content)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "AI 提取概念失败：" + err.Error()})
		return
	}

	if sourceType != "temporary" && sourceId != "" {
		println("💾 开始保存概念到数据库，数量:", len(result.Concepts))
		type ConceptWithID struct {
			ID         string `json:"id"`
			Concept    string `json:"concept"`
			Explanation string `json:"explanation"`
		}
		var conceptsWithID []ConceptWithID

		tx := db.Begin()
		seenConcepts := make(map[string]bool)
		for _, conceptData := range result.Concepts {
			if seenConcepts[conceptData.Concept] {
				println("⚠️ 概念已在本次处理中出现，跳过:", conceptData.Concept)
				continue
			}
			
			var existingConcept models.Concept
			checkResult := tx.Where("user_id = ? AND source_type = ? AND source_id = ? AND concept = ?",
				userId, sourceType, sourceId, conceptData.Concept).First(&existingConcept)
			
			if checkResult.Error == nil {
				println("⚠️ 概念已在数据库中存在，跳过:", conceptData.Concept)
				seenConcepts[conceptData.Concept] = true
				conceptsWithID = append(conceptsWithID, ConceptWithID{
					ID:         existingConcept.ID,
					Concept:    existingConcept.Concept,
					Explanation: existingConcept.Explanation,
				})
				continue
			}
			
			seenConcepts[conceptData.Concept] = true

			concept := models.Concept{
				UserId:     userId,
				SourceType: sourceType,
				SourceId:   sourceId,
				Concept:    conceptData.Concept,
				Explanation: conceptData.Explanation,
				OrderIndex:  len(conceptsWithID),
			}
			if err := tx.Create(&concept).Error; err != nil {
				println("❌ 保存概念失败:", err.Error())
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "保存概念失败：" + err.Error()})
				return
			}
			println("✅ 保存概念成功:", concept.Concept, "ID:", concept.ID)
			conceptsWithID = append(conceptsWithID, ConceptWithID{
				ID:         concept.ID,
				Concept:    conceptData.Concept,
				Explanation: conceptData.Explanation,
			})
		}
		tx.Commit()
		println("🎉 所有概念保存完成，返回数量:", len(conceptsWithID))

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data": gin.H{
				"concepts": conceptsWithID,
			},
		})
		return
	}

	println("📤 返回临时概念（不保存）")
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    result,
	})
}

func GetConcepts(c *gin.Context) {
	userId := middleware.GetUserId(c)
	if userId == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "未授权"})
		return
	}

	sourceType := c.Param("source_type")
	sourceId := c.Param("source_id")

	db := config.GetDB()
	var concepts []models.Concept
	result := db.Where("user_id = ? AND source_type = ? AND source_id = ?", userId, sourceType, sourceId).
		Order("order_index ASC").
		Preload("PracticeRecords", func(db *gorm.DB) *gorm.DB {
			return db.Order("practiced_at DESC").Limit(1)
		}).
		Find(&concepts)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "查询概念失败：" + result.Error.Error()})
		return
	}

	type ConceptWithPractice struct {
		ID           string                 `json:"id"`
		Concept      string                 `json:"concept"`
		Explanation  string                 `json:"explanation"`
		HasPractice  bool                   `json:"has_practice"`
		LastPractice *map[string]interface{} `json:"last_practice,omitempty"`
	}

	seenConcepts := make(map[string]bool)
	var conceptsWithPractice []ConceptWithPractice
	for _, concept := range concepts {
		if !seenConcepts[concept.Concept] {
			seenConcepts[concept.Concept] = true
			hasPractice := len(concept.PracticeRecords) > 0
			var lastPractice *map[string]interface{}
			if hasPractice {
				record := concept.PracticeRecords[0]
				lastPractice = &map[string]interface{}{
					"user_answer":   record.UserAnswer,
					"ai_evaluation": record.AIEvaluation,
					"practiced_at":  record.PracticedAt,
				}
			}
			conceptsWithPractice = append(conceptsWithPractice, ConceptWithPractice{
				ID:           concept.ID,
				Concept:      concept.Concept,
				Explanation:  concept.Explanation,
				HasPractice:  hasPractice,
				LastPractice: lastPractice,
			})
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"concepts": conceptsWithPractice,
		},
	})
}

func CreateConceptPracticeRecord(c *gin.Context) {
	userId := middleware.GetUserId(c)
	if userId == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "未授权"})
		return
	}

	conceptId := c.Param("id")

	var req struct {
		UserAnswer   string `json:"user_answer"`
		AIEvaluation string `json:"ai_evaluation"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "请求参数错误：" + err.Error()})
		return
	}

	db := config.GetDB()
	var concept models.Concept
	result := db.Where("id = ? AND user_id = ?", conceptId, userId).First(&concept)
	if result.Error == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "概念不存在"})
		return
	}

	practiceRecord := models.ConceptPracticeRecord{
		UserId:       userId,
		ConceptId:    conceptId,
		UserAnswer:   req.UserAnswer,
		AIEvaluation: req.AIEvaluation,
	}

	if err := db.Create(&practiceRecord).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "保存练习记录失败：" + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"id": practiceRecord.ID,
		},
	})
}
