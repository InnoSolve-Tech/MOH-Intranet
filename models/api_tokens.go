package models

import "gorm.io/gorm"

type ApiTokens struct {
	gorm.Model
	UUID  string `gorm:"type:uuid;primaryKey;" json:"uuiid"`
	Name  string `gorm:"type:varchar(255);not null" json:"name"`
	Token string `gorm:"type:text;not null;unique" json:"token"`
}
