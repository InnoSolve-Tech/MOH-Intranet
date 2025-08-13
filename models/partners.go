package models

import "gorm.io/gorm"

type Partner struct {
	gorm.Model
	UUID                string                `json:"uuid" gorm:"unique;not null"`
	Acronym             string                `json:"acronym" gorm:"not null"`
	PartnerType         string                `json:"partner_type" gorm:"not null"`
	PartnerCategory     string                `json:"partner_category" gorm:"not null"`
	OfficialPhone       string                `json:"official_phone" gorm:"not null"`
	OfficialEmail       string                `json:"official_email" gorm:"unique;not null"`
	HasMoU              bool                  `json:"has_mou"`
	MoULink             string                `json:"mou_link" gorm:"unique;not null"`
	PartnerAddress      []PartnerAddress      `json:"partner_address"`
	PartnerContacts     []PartnerContacts     `json:"partner_contacts"`
	PartnerSupportYears []PartnerSupportYears `json:"partner_support_years"`
}

type PartnerAddress struct {
	gorm.Model
	Address   string  `json:"official_phone"`
	PartnerID uint    `json:"partner_id"`
	Partner   Partner `json:"partner" gorm:"foreignKey:PartnerID;references:ID"`
}

type PartnerContacts struct {
	gorm.Model
	Names          string `json:"names"`
	Title          string `json:"title"`
	PhoneNumber    string `json:"phone_number"`
	AltPhoneNumber string `json:"alt_phone_number"`
	OfficialEmail  string `json:"offical_email"`
	Address        string `json:"address"`
	UserID         uint   `json:"user_id"`
	User           Users  `json:"user" gorm:"foreignKey:UserID;references:ID"`
}

type PartnerSupportYears struct {
	gorm.Model
	Year                uint   `json:"year"`
	LevelOfSupport      string `json:"level_of_support"`
	ThematicAreas       string `json:"thematic_areas"`
	District            string `json:"district"`
	DistrictSupportType string `json:"district_support_type"`
}
