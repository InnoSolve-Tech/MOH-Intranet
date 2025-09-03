package models

import (
	"time"

	"gorm.io/gorm"
)

type Scope string

const (
	ScopeGlobal     Scope = "global"
	ScopeDistrict   Scope = "district"
	ScopeIndividual Scope = "individual"
)

type Users struct {
	gorm.Model
	UUID     string `json:"uuid" gorm:"unique;not null"`
	Username string `json:"username" gorm:"unique;not null"`
	Password string `json:"password" gorm:"unique;not null"`
	Scope    Scope  `json:"scope" gorm:"type:varchar(20)"`
	RoleID   uint   `json:"role_id"`
	Active   bool   `json:"active"`
	Role     Roles  `json:"roles" gorm:"foreignKey:RoleID;references:ID"`
}

type PasswordToken struct {
	gorm.Model
	Token     string    `json:"token" gorm:"unique;not null"`
	Email     string    `json:"email"`
	ExpiresAt time.Time `json:"expires_at"`
}
