package models

import (
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Roles struct {
	gorm.Model
	RoleName string         `json:"role_name"`
	Function datatypes.JSON `json:"function" gorm:"type:jsonb"`
	View     bool           `json:"view"`
	Create   bool           `json:"create"`
	Edit     bool           `json:"edit"`
	Remove   bool           `json:"remove"`
}
