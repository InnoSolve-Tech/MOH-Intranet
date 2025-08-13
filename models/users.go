package models

import (
	"gorm.io/gorm"
)

type Users struct {
	gorm.Model
	UUID     string `json:"uuid" gorm:"unique;not null"`
	Username string `json:"username" gorm:"unique;not null"`
	Password string `json:"password" gorm:"unique;not null"`
	RoleID   uint   `json:"role_id"`
	Role     Roles  `json:"roles" gorm:"foreignKey:RoleID;references:ID"`
}
