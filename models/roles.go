package models

import "gorm.io/gorm"

type Roles struct {
	gorm.Model
	RoleName string `json:"role_name"`
	Function string `json:"function"`
	Scope    string `json:"scope"`
	View     bool   `json:"view"`
	Create   bool   `json:"create"`
	Edit     bool   `json:"edit"`
	Remove   bool   `json:"remove"`
}
