// @审计已完成
// 标注控制器 - 请求结构体定义
package controllers

type CreateAnnotationRequest struct {
	BookId   string `json:"book_id" binding:"required"`
	Text     string `json:"text" binding:"required"`
	CfiRange string `json:"cfi_range" binding:"required"`
	YanSe    string `json:"yan_se" binding:"required"`
	LeiXing  string `json:"lei_xing" binding:"required"`
	BeiZhu   string `json:"bei_zhu"`
}

type UpdateAnnotationRequest struct {
	YanSe  string `json:"yan_se"`
	LeiXing string `json:"lei_xing"`
	BeiZhu  string `json:"bei_zhu"`
}
