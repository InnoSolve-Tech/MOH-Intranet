package models

import (
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Scope string

const (
	ScopeGlobal     Scope = "global"
	ScopeDistrict   Scope = "district"
	ScopeIndividual Scope = "individual"
)

type Roles struct {
	gorm.Model
	RoleName string         `json:"role_name"`
	Function datatypes.JSON `json:"function" gorm:"type:jsonb"`
	Scope    Scope          `json:"scope" gorm:"type:varchar(20)"`
	View     bool           `json:"view"`
	Create   bool           `json:"create"`
	Edit     bool           `json:"edit"`
	Remove   bool           `json:"remove"`
}
