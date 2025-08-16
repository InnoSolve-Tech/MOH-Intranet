package models

import (
	"time"

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
	Names          string  `json:"names"`
	Title          string  `json:"title"`
	PhoneNumber    string  `json:"phone_number"`
	AltPhoneNumber string  `json:"alt_phone_number"`
	OfficialEmail  string  `json:"official_email"`
	Address        string  `json:"address"`
	UserID         *uint   `json:"user_id"`
	User           *Users  `json:"user" gorm:"foreignKey:UserID;references:ID"`
	PartnerID      uint    `json:"partner_id"`
	Partner        Partner `json:"partner" gorm:"foreignKey:PartnerID;references:ID"`
}

type PartnerSupportYears struct {
	gorm.Model
	Year                uint    `json:"year"`
	LevelOfSupport      string  `json:"level_of_support"`
	ThematicAreas       string  `json:"thematic_areas"`
	District            string  `json:"district"`
	DistrictSupportType string  `json:"district_support_type"`
	PartnerID           uint    `json:"partner_id"`
	Partner             Partner `json:"partner" gorm:"foreignKey:PartnerID;references:ID"`
}

// New MoU model
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

// Updated request structure to match frontend data
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
	Contacts  []struct {
		Name     string `json:"name"`     // Updated to match frontend
		Position string `json:"position"` // Updated to match frontend
		Phone    string `json:"phone"`    // Updated to match frontend
		Email    string `json:"email"`    // Updated to match frontend
	} `json:"contacts"`
	MoU struct {
		HasMoU     bool        `json:"hasMou"`
		SignedBy   string      `json:"signedBy"`
		WhoTitle   string      `json:"whoTitle"`
		SignedDate string      `json:"signedDate"`
		ExpiryDate string      `json:"expiryDate"`
		File       interface{} `json:"file"` // Changed to interface{} to handle different types
	} `json:"mou"`
	SupportYears []struct {
		Year          int               `json:"year"`
		Level         string            `json:"level"`
		ThematicAreas string            `json:"thematicAreas"` // Updated to match frontend
		Districts     []string          `json:"districts"`
		Coverage      map[string]string `json:"coverage"`
	} `json:"supportYears"`
	UserAccounts []struct {
		ContactIndex string `json:"contactIndex"`
		Username     string `json:"username"`
		Password     string `json:"password"`
		AssignedUser string `json:"assignedUser"`
	} `json:"userAccounts"`
}
