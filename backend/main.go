package main

import (
	"log"
	"reading-reflection/config"
	"reading-reflection/routes"
)

func main() {
	config.LoadConfig()
	config.ValidateStartup()
	config.InitDB()
	router := routes.InitRoutes()
	log.Println("🚀 服务器启动成功，监听端口: " + config.AppConfig.ServerPort)
	if err := router.Run(":" + config.AppConfig.ServerPort); err != nil {
		log.Fatal("服务器启动失败:", err)
	}
}
