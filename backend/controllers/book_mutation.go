// @审计已完成
// 书籍控制器 - 写入操作
package controllers

import (
	"log"
	"net/http"
	"reading-reflection/config"
	"reading-reflection/middleware"
	"reading-reflection/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func CreateBook(c *gin.Context) {
	log.Println("📚 开始创建书籍")
	
	userId := middleware.GetUserId(c)
	log.Printf("👤 用户ID: %s", userId)

	var req CreateBookRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("❌ 请求参数绑定失败: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "请求参数错误：" + err.Error()})
		return
	}
	log.Printf("📋 请求参数: Title=%s, Author=%s, CoverUrl=%s", req.Title, req.Author, req.CoverUrl)

	db := config.GetDB()
	newBook := models.Book{
		UserId:   userId,
		Title:    req.Title,
		Author:   req.Author,
		CoverUrl: req.CoverUrl,
	}

	if err := db.Create(&newBook).Error; err != nil {
		log.Printf("❌ 创建书籍失败: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "创建书籍失败: " + err.Error()})
		return
	}
	log.Printf("✅ 书籍创建成功: ID=%s, Title=%s", newBook.ID, newBook.Title)

	c.JSON(http.StatusOK, gin.H{"success": true, "data": newBook})
}

func UpdateBook(c *gin.Context) {
	userId := middleware.GetUserId(c)
	bookId := c.Param("id")

	var req UpdateBookRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "请求参数错误：" + err.Error()})
		return
	}

	db := config.GetDB()
	var book models.Book
	result := db.Where("id = ? AND user_id = ?", bookId, userId).First(&book)
	if result.Error == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "书籍不存在"})
		return
	}

	updates := map[string]interface{}{
		"title":     req.Title,
		"author":    req.Author,
		"cover_url": req.CoverUrl,
	}

	if err := db.Model(&book).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "更新书籍失败"})
		return
	}

	db.First(&book, bookId)
	c.JSON(http.StatusOK, gin.H{"success": true, "data": book})
}

func DeleteBook(c *gin.Context) {
	userId := middleware.GetUserId(c)
	bookId := c.Param("id")
	db := config.GetDB()

	var book models.Book
	result := db.Where("id = ? AND user_id = ?", bookId, userId).First(&book)
	if result.Error == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "书籍不存在"})
		return
	}

	if err := db.Delete(&book).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "删除书籍失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "书籍删除成功"})
}
