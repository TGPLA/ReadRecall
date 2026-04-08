// @审计已完成
// 数据模型 - 标注/划线
package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Annotation struct {
	ID        string    `gorm:"type:char(36);primaryKey" json:"id"`
	UserId    string    `gorm:"type:char(36);not null;index" json:"user_id"`
	BookId    string    `gorm:"type:char(36);not null;index" json:"book_id"`
	Text      string    `gorm:"type:text;not null" json:"text"`
	CfiRange  string    `gorm:"type:text;not null" json:"cfi_range"`
	YanSe     string    `gorm:"type:varchar(20);not null" json:"yan_se"`
	LeiXing   string    `gorm:"type:varchar(20);not null" json:"lei_xing"`
	BeiZhu    string    `gorm:"type:text" json:"bei_zhu"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (a *Annotation) BeforeCreate(tx *gorm.DB) error {
	if a.ID == "" {
		a.ID = uuid.New().String()
	}
	return nil
}
