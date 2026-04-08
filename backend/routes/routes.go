package routes

import (
	"reading-reflection/controllers"
	"reading-reflection/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func InitRoutes() *gin.Engine {
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * 3600,
	}))

	router.Static("/uploads", "./uploads")

	api := router.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/signup", controllers.Register)
			auth.POST("/signin", controllers.Login)
			auth.POST("/signout", controllers.Logout)
			auth.POST("/reset-password", controllers.ResetPassword)
			auth.POST("/update-password", middleware.AuthMiddleware(), controllers.UpdatePassword)
		}

		books := api.Group("/books")
		books.Use(middleware.AuthMiddleware())
		{
			books.GET("", controllers.GetBooks)
			books.POST("", controllers.CreateBook)
			books.PUT("/:id", controllers.UpdateBook)
			books.DELETE("/:id", controllers.DeleteBook)
			books.GET("/:id", controllers.GetBookDetail)
			books.POST("/:id/upload-epub", controllers.UploadEPUB)
			books.GET("/:id/epub", controllers.DownloadEPUB)
		}

		chapters := api.Group("/chapters")
		chapters.Use(middleware.AuthMiddleware())
		{
			chapters.GET("/book/:book_id", controllers.GetChaptersByBook)
			chapters.POST("", controllers.CreateChapter)
			chapters.GET("/:id", controllers.GetChapterDetail)
			chapters.PUT("/:id", controllers.UpdateChapter)
			chapters.DELETE("/:id", controllers.DeleteChapter)
			chapters.PUT("/:id/order", controllers.UpdateChapterOrder)
		}

		paragraphs := api.Group("/paragraphs")
		paragraphs.Use(middleware.AuthMiddleware())
		{
			paragraphs.GET("/chapter/:chapter_id", controllers.GetParagraphsByChapter)
			paragraphs.POST("", controllers.CreateParagraph)
			paragraphs.POST("/batch", controllers.BatchCreateParagraphs)
			paragraphs.GET("/:id", controllers.GetParagraphDetail)
			paragraphs.PUT("/:id", controllers.UpdateParagraph)
			paragraphs.DELETE("/:id", controllers.DeleteParagraph)
		}

		prompts := api.Group("/prompts")
		prompts.Use(middleware.AuthMiddleware())
		{
			prompts.GET("", controllers.GetPromptTemplates)
			prompts.GET("/type/:type", controllers.GetPromptTemplatesByType)
			prompts.POST("", controllers.CreatePromptTemplate)
			prompts.GET("/:id", controllers.GetPromptTemplateDetail)
			prompts.PUT("/:id", controllers.UpdatePromptTemplate)
			prompts.DELETE("/:id", controllers.DeletePromptTemplate)
			prompts.POST("/init-system", controllers.InitSystemPrompts) // 临时接口：初始化系统模板
		}

		questions := api.Group("/questions")
		questions.Use(middleware.AuthMiddleware())
		{
			questions.GET("/chapter/:chapter_id", controllers.GetQuestionsByChapter)
			questions.GET("/book/:book_id", controllers.GetQuestionsByBook)
			questions.POST("", controllers.CreateQuestion)
			questions.GET("/:id", controllers.GetQuestionDetail)
			questions.PUT("/:id", controllers.UpdateQuestion)
			questions.DELETE("/:id", controllers.DeleteQuestion)
			questions.GET("/:id/records", controllers.GetPracticeRecords)
			questions.POST("/:id/practice", controllers.RecordPractice)
		}

		ai := api.Group("/ai")
		ai.Use(middleware.AuthMiddleware())
		{
			ai.POST("/generate-from-selection", controllers.AIGenerateFromSelection)
			ai.POST("/evaluate-answer", controllers.AIEvaluateAnswer)
			ai.POST("/extract-concepts", controllers.AIExtractConcepts)
			ai.POST("/evaluate-concept", controllers.AIEvaluateConcept)
			ai.POST("/evaluate-intention", controllers.AIEvaluateIntention)
		}

		concepts := api.Group("/concepts")
		concepts.Use(middleware.AuthMiddleware())
		{
			concepts.GET("/:source_type/:source_id", controllers.GetConcepts)
			concepts.POST("/:id/practice", controllers.CreateConceptPracticeRecord)
		}

		settings := api.Group("/settings")
		settings.Use(middleware.AuthMiddleware())
		{
			settings.GET("", controllers.GetSettings)
			settings.PUT("", controllers.UpdateSettings)
		}

		annotations := api.Group("/annotations")
		annotations.Use(middleware.AuthMiddleware())
		{
			annotations.GET("/book/:book_id", controllers.GetAnnotationsByBook)
			annotations.POST("", controllers.CreateAnnotation)
			annotations.GET("/:id", controllers.GetAnnotationDetail)
			annotations.PUT("/:id", controllers.UpdateAnnotation)
			annotations.DELETE("/:id", controllers.DeleteAnnotation)
		}

		statistics := api.Group("/statistics")
		statistics.Use(middleware.AuthMiddleware())
		{
			statistics.GET("", controllers.GetStatistics)
		}
	}

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "阅读回响后端服务运行正常",
		})
	})
	
	api.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "阅读回响后端服务运行正常",
		})
	})

	return router
}
