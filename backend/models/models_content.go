// @审计已完成
// 数据模型 - 章节与题目
package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Chapter struct {
	ID             string      `gorm:"type:char(36);primaryKey" json:"id"`
	BookId         string      `gorm:"type:char(36);not null;index" json:"book_id"`
	UserId         string      `gorm:"type:char(36);not null;index" json:"user_id"`
	Title          string      `gorm:"type:varchar(255);not null" json:"title"`
	Content        string      `gorm:"type:text;not null" json:"content"`
	OrderIndex     int         `gorm:"default:0" json:"order_index"`
	ParagraphCount int         `gorm:"default:0" json:"paragraph_count"`
	QuestionCount  int         `gorm:"default:0" json:"question_count"`
	MasteredCount  int         `gorm:"default:0" json:"mastered_count"`
	CreatedAt      time.Time   `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt      time.Time   `gorm:"autoUpdateTime" json:"updated_at"`
	Paragraphs     []Paragraph `gorm:"foreignKey:ChapterId;constraint:OnDelete:CASCADE" json:"paragraphs,omitempty"`
	Questions      []Question  `gorm:"foreignKey:ChapterId;constraint:OnDelete:CASCADE" json:"questions,omitempty"`
	Concepts       []Concept   `gorm:"foreignKey:SourceId" json:"concepts,omitempty"`
	Book           *Book       `gorm:"foreignKey:BookId" json:"book,omitempty"`
}

func (c *Chapter) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	return nil
}

type Paragraph struct {
	ID        string    `gorm:"type:char(36);primaryKey" json:"id"`
	UserId    string    `gorm:"type:char(36);not null;index" json:"user_id"`
	BookId   string    `gorm:"type:char(36);not null;index" json:"book_id"`
	ChapterId string   `gorm:"type:char(36);not null;index" json:"chapter_id"`
	Content  string    `gorm:"type:text;not null" json:"content"`
	OrderIndex int    `gorm:"default:0" json:"order_index"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (p *Paragraph) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = uuid.New().String()
	}
	return nil
}

type Concept struct {
	ID           string                  `gorm:"type:char(36);primaryKey" json:"id"`
	UserId       string                  `gorm:"type:char(36);not null;index" json:"user_id"`
	SourceType   string                  `gorm:"type:varchar(50);not null;index" json:"source_type"`
	SourceId     string                  `gorm:"type:char(36);not null;index" json:"source_id"`
	Concept      string                  `gorm:"type:varchar(255);not null" json:"concept"`
	Explanation  string                  `gorm:"type:text;not null" json:"explanation"`
	OrderIndex   int                     `gorm:"default:0" json:"order_index"`
	PracticeRecords []ConceptPracticeRecord `gorm:"foreignKey:ConceptId;constraint:OnDelete:CASCADE" json:"practice_records,omitempty"`
	CreatedAt    time.Time               `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time               `gorm:"autoUpdateTime" json:"updated_at"`
}

func (c *Concept) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	return nil
}

type ConceptPracticeRecord struct {
	ID          string    `gorm:"type:char(36);primaryKey" json:"id"`
	UserId      string    `gorm:"type:char(36);not null;index" json:"user_id"`
	ConceptId   string    `gorm:"type:char(36);not null;index" json:"concept_id"`
	UserAnswer  string    `gorm:"type:text" json:"user_answer"`
	AIEvaluation string   `gorm:"type:text" json:"ai_evaluation"`
	PracticedAt time.Time `gorm:"autoCreateTime" json:"practiced_at"`
}

func (c *ConceptPracticeRecord) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	return nil
}

type Question struct {
	ID              string     `gorm:"type:char(36);primaryKey" json:"id"`
	UserId          string     `gorm:"type:char(36);not null;index" json:"user_id"`
	BookId          string     `gorm:"type:char(36);not null;index" json:"book_id"`
	ChapterId       string     `gorm:"type:char(36);not null;index" json:"chapter_id"`
	ParagraphId     *string    `gorm:"type:char(36);index" json:"paragraph_id"`
	Question        string     `gorm:"type:text;not null" json:"question"`
	QuestionType    string     `gorm:"type:varchar(50);not null" json:"question_type"`
	Category        string     `gorm:"type:varchar(50);not null" json:"category"`
	Answer          string     `gorm:"type:text;not null" json:"answer"`
	Options         *string    `gorm:"type:json" json:"options"`
	CorrectIndex    *int       `json:"correct_index"`
	Explanation     string     `gorm:"type:text" json:"explanation"`
	Difficulty      string     `gorm:"type:varchar(50);not null" json:"difficulty"`
	KnowledgePoint  string     `gorm:"type:varchar(255)" json:"knowledge_point"`
	MasteryLevel    string     `gorm:"type:varchar(50);default:'未掌握'" json:"mastery_level"`
	PracticeCount   int        `gorm:"default:0" json:"practice_count"`
	LastPracticedAt *time.Time `json:"last_practiced_at"`
	CreatedAt       time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt       time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
	Chapter         *Chapter   `gorm:"foreignKey:ChapterId" json:"chapter,omitempty"`
	Paragraph       *Paragraph `gorm:"foreignKey:ParagraphId" json:"paragraph,omitempty"`
}

func (q *Question) BeforeCreate(tx *gorm.DB) error {
	if q.ID == "" {
		q.ID = uuid.New().String()
	}
	return nil
}
