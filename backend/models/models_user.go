// @审计已完成
// 数据模型 - 用户与书籍
package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID           string     `gorm:"type:char(36);primaryKey" json:"id"`
	Username     string     `gorm:"type:varchar(16);uniqueIndex;not null" json:"username"`
	PasswordHash string     `gorm:"type:varchar(255);not null" json:"-"`
	Nickname     string     `gorm:"type:varchar(100)" json:"nickname"`
	AvatarUrl    string     `gorm:"type:varchar(512)" json:"avatar_url"`
	CreatedAt    time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
	Books        []Book     `gorm:"foreignKey:UserId;constraint:OnDelete:CASCADE" json:"books,omitempty"`
	Settings     *Settings  `gorm:"foreignKey:UserId;constraint:OnDelete:CASCADE" json:"settings,omitempty"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == "" {
		u.ID = uuid.New().String()
	}
	return nil
}

type Book struct {
	ID            string    `gorm:"type:char(36);primaryKey" json:"id"`
	UserId        string    `gorm:"type:char(36);not null;index" json:"user_id"`
	Title         string    `gorm:"type:varchar(255);not null" json:"title"`
	Author        string    `gorm:"type:varchar(255);not null" json:"author"`
	CoverUrl      string    `gorm:"type:varchar(512)" json:"cover_url"`
	EpubFilePath  string    `gorm:"type:varchar(512)" json:"epub_file_path"`
	ChapterCount  int       `gorm:"default:0" json:"chapter_count"`
	QuestionCount int       `gorm:"default:0" json:"question_count"`
	MasteredCount int       `gorm:"default:0" json:"mastered_count"`
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime" json:"updated_at"`
	Chapters      []Chapter `gorm:"foreignKey:BookId;constraint:OnDelete:CASCADE" json:"chapters,omitempty"`
	User          *User     `gorm:"foreignKey:UserId" json:"user,omitempty"`
}

func (b *Book) BeforeCreate(tx *gorm.DB) error {
	if b.ID == "" {
		b.ID = uuid.New().String()
	}
	return nil
}
