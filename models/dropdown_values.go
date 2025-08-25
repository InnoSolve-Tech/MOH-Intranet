package models

import "gorm.io/gorm"

type ThematicAreas struct {
	gorm.Model
	Area string `json:"area"`
}

type PartnerCategory struct {
	gorm.Model
	Type  string `json:"type"`
	Value string `json:"value"`
}
