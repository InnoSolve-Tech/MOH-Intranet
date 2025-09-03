package models

import (
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Emails struct {
	gorm.Model
	Subject        string         `json:"subject"`
	TargetAudience string         `json:"target_audience"`
	Targets        datatypes.JSON `json:"targets"`
	Priority       string         `json:"priority"`
	Content        string         `json:"content"`
}
