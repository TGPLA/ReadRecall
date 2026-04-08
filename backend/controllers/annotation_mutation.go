// @审计已完成
// 标注控制器 - 创建、更新、删除操作
package controllers

import (
	"net/http"
	"reading-reflection/config"
	"reading-reflection/middleware"
	"reading-reflection/models"

	"github.com/gin-gonic/gin"
)

func CreateAnnotation(c *gin.Context) {
	userId := middleware.GetUserId(c)
	var req CreateAnnotationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	db := config.GetDB()

	var existingAnnotation models.Annotation
	db.Where("user_id = ? AND book_id = ? AND cfi_range = ? AND lei_xing = ?", 
		userId, req.BookId, req.CfiRange, req.LeiXing).First(&existingAnnotation)
	if existingAnnotation.ID != "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "该位置已有相同类型的标注"})
		return
	}

	annotation := models.Annotation{
		UserId:   userId,
		BookId:   req.BookId,
		Text:     req.Text,
		CfiRange: req.CfiRange,
		YanSe:    req.YanSe,
		LeiXing:  req.LeiXing,
		BeiZhu:   req.BeiZhu,
	}

	if err := db.Create(&annotation).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "创建失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": annotation})
}

func UpdateAnnotation(c *gin.Context) {
	userId := middleware.GetUserId(c)
	id := c.Param("id")
	var req UpdateAnnotationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	db := config.GetDB()

	var annotation models.Annotation
	result := db.Where("id = ? AND user_id = ?", id, userId).First(&annotation)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "标注不存在"})
		return
	}

	if req.YanSe != "" {
		annotation.YanSe = req.YanSe
	}
	if req.LeiXing != "" {
		annotation.LeiXing = req.LeiXing
	}
	if req.BeiZhu != "" {
		annotation.BeiZhu = req.BeiZhu
	}

	if err := db.Save(&annotation).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "更新失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": annotation})
}

func DeleteAnnotation(c *gin.Context) {
	userId := middleware.GetUserId(c)
	id := c.Param("id")

	db := config.GetDB()

	result := db.Where("id = ? AND user_id = ?", id, userId).Delete(&models.Annotation{})
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "删除失败"})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "标注不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
