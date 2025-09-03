package models

import (
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type InternalGroups struct {
	gorm.Model
	UUID          string         `json:"uuid" gorm:"unique;not null"`
	Name          string         `json:"name" gorm:"not null"`
	Description   string         `json:"description"`
	ThematicAreas datatypes.JSON `json:"thematic_areas" gorm:"type:jsonb"`
	Districts     datatypes.JSON `json:"districts" gorm:"type:jsonb"`
	Color         string         `json:"color"`
}
