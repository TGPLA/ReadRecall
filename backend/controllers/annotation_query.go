// @审计已完成
// 标注控制器 - 查询操作
package controllers

import (
	"net/http"
	"reading-reflection/config"
	"reading-reflection/middleware"
	"reading-reflection/models"

	"github.com/gin-gonic/gin"
)

func GetAnnotationsByBook(c *gin.Context) {
	userId := middleware.GetUserId(c)
	bookId := c.Param("book_id")

	db := config.GetDB()

	var annotations []models.Annotation
	result := db.Where("user_id = ? AND book_id = ?", userId, bookId).Order("created_at DESC").Find(&annotations)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "查询失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": annotations})
}

func GetAnnotationDetail(c *gin.Context) {
	userId := middleware.GetUserId(c)
	id := c.Param("id")

	db := config.GetDB()

	var annotation models.Annotation
	result := db.Where("id = ? AND user_id = ?", id, userId).First(&annotation)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "标注不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": annotation})
}
