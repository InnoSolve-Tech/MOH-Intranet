package models

import (
	"time"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Partner struct {
	gorm.Model
	UUID                string                `json:"uuid" gorm:"unique;not null"`
	PartnerName         string                `json:"partner_name" gorm:"not null"`
	Acronym             string                `json:"acronym"`
	PartnerType         string                `json:"partner_type" gorm:"not null"`
	PartnerCategory     string                `json:"partner_category" gorm:"not null"`
	OfficialPhone       string                `json:"official_phone" gorm:"not null"`
	OfficialEmail       string                `json:"official_email" gorm:"unique;not null"`
	HasMoU              bool                  `json:"has_mou"`
	MoULink             string                `json:"mou_link"`
	PartnerAddress      []PartnerAddress      `json:"partner_address"`
	PartnerContacts     []PartnerContacts     `json:"partner_contacts"`
	PartnerSupportYears []PartnerSupportYears `json:"partner_support_years"`
	PartnerMoU          *PartnerMoU           `json:"partner_mou"`
}

type PartnerAddress struct {
	gorm.Model
	Address   string  `json:"address"`
	PartnerID uint    `json:"partner_id"`
	Partner   Partner `json:"partner" gorm:"foreignKey:PartnerID;references:ID"`
}

type PartnerContacts struct {
	gorm.Model
	Names         string  `json:"names"`
	Title         string  `json:"title"`
	PhoneNumber   string  `json:"phone_number"`
	OfficialEmail string  `json:"official_email"`
	PartnerID     uint    `json:"partner_id"`
	Partner       Partner `json:"partner" gorm:"foreignKey:PartnerID;references:ID"`
}

type PartnerSupportYears struct {
	gorm.Model
	Year          uint           `json:"year"`
	Quarter       string         `json:"quarter"`
	Level         string         `json:"level"`
	ThematicAreas datatypes.JSON `json:"thematic_areas" gorm:"type:jsonb"` // store array as JSON
	District      string         `json:"district"`
	Subcounties   datatypes.JSON `json:"subcounties" gorm:"type:jsonb"` // store array as JSON
	PartnerID     uint           `json:"partner_id"`
	Partner       Partner        `json:"partner" gorm:"foreignKey:PartnerID;references:ID"`
}

type PartnerMoU struct {
	gorm.Model
	SignedBy   string     `json:"signed_by"`
	WhoTitle   string     `json:"who_title"`
	SignedDate *time.Time `json:"signed_date"`
	ExpiryDate *time.Time `json:"expiry_date"`
	FilePath   string     `json:"file_path"`
	PartnerID  uint       `json:"partner_id"`
	Partner    Partner    `json:"partner" gorm:"foreignKey:PartnerID;references:ID"`
}

// Request struct aligned with frontend JSON
type PartnerSubmissionData struct {
	BasicInfo struct {
		PartnerName   string `json:"partnerName"`
		Acronym       string `json:"acronym"`
		PartnerType   string `json:"partnerType"`
		Category      string `json:"category"`
		OfficialPhone string `json:"officialPhone"`
		OfficialEmail string `json:"officialEmail"`
	} `json:"basicInfo"`

	Addresses []string `json:"addresses"`

	Contacts []struct {
		Name     string `json:"name"`
		Position string `json:"position"`
		Phone    string `json:"phone"`
		Email    string `json:"email"`
	} `json:"contacts"`

	MoU struct {
		HasMoU     bool        `json:"hasMou"`
		SignedBy   string      `json:"signedBy"`
		WhoTitle   string      `json:"whoTitle"`
		SignedDate string      `json:"signedDate"`
		ExpiryDate string      `json:"expiryDate"`
		File       interface{} `json:"file"`
	} `json:"mou"`

	SupportYears []struct {
		Year          int      `json:"year"`
		Quarter       string   `json:"quarter"`
		Level         string   `json:"level"`
		ThematicAreas []string `json:"thematicAreas"`
		District      string   `json:"district"`
		Subcounties   []string `json:"subcounties"`
	} `json:"supportYears"`

	UserAccounts []struct {
		ContactIndex string `json:"contactIndex"`
		Username     string `json:"username"`
		Password     string `json:"password"`
	} `json:"userAccounts"`
}
