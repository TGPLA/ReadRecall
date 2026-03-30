// @审计已完成
// 章节控制器 - 查询操作
package controllers

import (
	"net/http"
	"reading-reflection/config"
	"reading-reflection/middleware"
	"reading-reflection/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetChaptersByBook(c *gin.Context) {
	userId := middleware.GetUserId(c)
	bookId := c.Param("book_id")
	db := config.GetDB()

	var chapters []models.Chapter
	db.Where("book_id = ? AND user_id = ?", bookId, userId).Order("order_index ASC").Find(&chapters)

	c.JSON(http.StatusOK, gin.H{"success": true, "data": chapters})
}

func GetChapterDetail(c *gin.Context) {
	userId := middleware.GetUserId(c)
	chapterId := c.Param("id")
	db := config.GetDB()

	var chapter models.Chapter
	result := db.Where("id = ? AND user_id = ?", chapterId, userId).
		Preload("Questions", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at DESC")
		}).
		First(&chapter)

	if result.Error == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "章节不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": chapter})
}
