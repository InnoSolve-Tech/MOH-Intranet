// service/partner.go
package service

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"mime"
	"mime/multipart"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"moh-intranet.com/database"
	"moh-intranet.com/helpers"
	"moh-intranet.com/models"
)

// CreatePartner creates a new partner record with all related data
func CreatePartner(c *fiber.Ctx) error {
	var submissionData models.PartnerSubmissionData

	contentType := c.Get("Content-Type")

	// Parse JSON data from multipart form or raw JSON
	if strings.Contains(contentType, "multipart/form-data") {
		dataField := c.FormValue("data")
		if dataField == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Missing data field in form submission",
			})
		}
		if err := json.Unmarshal([]byte(dataField), &submissionData); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Invalid JSON data in form field",
				"details": err.Error(),
			})
		}
	} else {
		if err := c.BodyParser(&submissionData); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Invalid JSON data",
				"details": err.Error(),
			})
		}
	}

	// Validate basic information
	if err := validateBasicInfo(submissionData.BasicInfo); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Invalid basic information",
			"details": err.Error(),
		})
	}

	// Begin DB transaction
	tx := database.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	partner := models.Partner{
		UUID:            uuid.New().String(),
		PartnerName:     submissionData.BasicInfo.PartnerName,
		Acronym:         submissionData.BasicInfo.Acronym,
		PartnerType:     submissionData.BasicInfo.PartnerType,
		PartnerCategory: submissionData.BasicInfo.Category,
		OfficialPhone:   submissionData.BasicInfo.OfficialPhone,
		OfficialEmail:   submissionData.BasicInfo.OfficialEmail,

		HasMoUMoH:  submissionData.MoU.MoH.HasMoU,
		HasMoUURSB: submissionData.MoU.URSB.HasMoU,
		HasMoUNGO:  submissionData.MoU.NGO.HasMoU,
	}

	if err := tx.Create(&partner).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to create partner",
			"details": err.Error(),
		})
	}

	// Save addresses and contacts
	if err := saveAddresses(tx, submissionData.Addresses, partner.ID); err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to save addresses",
			"details": err.Error(),
		})
	}

	if err := saveContacts(tx, submissionData.Contacts, partner.ID); err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to save contacts",
			"details": err.Error(),
		})
	}

	// -------------------------------
	// Handle uploaded MoU files using saveUploadedFile
	// -------------------------------
	saveFileFromField := func(fieldName string) (string, error) {
		file, err := c.FormFile(fieldName)
		if err != nil || file == nil {
			return "", nil
		}
		return saveUploadedFile(c, file)
	}

	mohFilePath, _ := saveFileFromField("mouFileMoH")
	ursbFilePath, _ := saveFileFromField("mouFileURSB")
	ngoFilePath, _ := saveFileFromField("mouFileNGO")

	// -------------------------------
	// Save SupportDocuments
	// -------------------------------
	saveDocument := func(docType, signedBy, whoTitle, signedDateStr, expiryDateStr, filePath string) error {
		if filePath == "" && signedDateStr == "" && expiryDateStr == "" {
			return nil
		}

		var signedDate, expiryDate time.Time
		if signedDateStr != "" {
			if t, err := time.Parse("2006-01-02", signedDateStr); err == nil {
				signedDate = t
			}
		}
		if expiryDateStr != "" {
			if t, err := time.Parse("2006-01-02", expiryDateStr); err == nil {
				expiryDate = t
			}
		}

		doc := models.SupportDocuments{
			PartnerID:    partner.ID,
			DocumentType: docType,
			SignedBy:     signedBy,
			WhoTitle:     whoTitle,
			SignedDate:   signedDate,
			ExpiryDate:   expiryDate,
			FileLink:     filePath,
		}

		return tx.Create(&doc).Error
	}

	if submissionData.MoU.MoH.HasMoU {
		if err := saveDocument("MoH MoU", submissionData.MoU.MoH.SignedBy, submissionData.MoU.MoH.WhoTitle,
			submissionData.MoU.MoH.SignedDate, submissionData.MoU.MoH.ExpiryDate, mohFilePath); err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   "Failed to save MoH document",
				"details": err.Error(),
			})
		}
	}

	if submissionData.MoU.URSB.HasMoU {
		if err := saveDocument("URSB Certificate", "", "", submissionData.MoU.URSB.SignedDate, submissionData.MoU.URSB.ExpiryDate, ursbFilePath); err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   "Failed to save URSB document",
				"details": err.Error(),
			})
		}
	}

	if submissionData.MoU.NGO.HasMoU {
		if err := saveDocument("NGO Registration", "", "", submissionData.MoU.NGO.SignedDate, submissionData.MoU.NGO.ExpiryDate, ngoFilePath); err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   "Failed to save NGO document",
				"details": err.Error(),
			})
		}
	}

	// -------------------------------
	// Save support years
	// -------------------------------
	if err := saveSupportYears(tx, submissionData.SupportYears, partner.ID); err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to save support years",
			"details": err.Error(),
		})
	}

	// -------------------------------
	// Handle user accounts
	// -------------------------------
	if len(submissionData.UserAccounts) > 0 {
		if err := handleUserAccounts(c, tx, submissionData.UserAccounts, submissionData.Contacts, partner.ID); err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   "Failed to create user accounts",
				"details": err.Error(),
			})
		}
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to commit transaction",
			"details": err.Error(),
		})
	}

	// Load partner with preloads
	var completePartner models.Partner
	database.DB.Preload("PartnerAddress").
		Preload("PartnerContacts").
		Preload("PartnerSupportYears").
		Preload("PartnerSupportYears.Districts").
		Preload("SupportDocuments").
		First(&completePartner, partner.ID)

	// Create email confirmation token
	token := helpers.GenerateSecureToken(32)
	pt := models.PasswordToken{
		Token:     token,
		Email:     submissionData.UserAccounts[0].Username,
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}
	if err := database.DB.Create(&pt).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create reset token"})
	}

	defaultDomain := "http://localhost:7088"
	domain := getEnv("DOMAIN", &defaultDomain)
	confirmLink := fmt.Sprintf("%s/confirmation.html?token=%s", domain, url.QueryEscape(token))
	body := fmt.Sprintf("Thank you for registering. Please confirm your email by clicking the link below:\n\n%s", confirmLink)

	go helpers.SendEmail(submissionData.UserAccounts[0].Username, "Password Reset", body)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Partner created successfully",
		"partner": completePartner,
	})
}

// Helper to save *multipart.FileHeader to disk
func saveUploadedFile(c *fiber.Ctx, file *multipart.FileHeader) (string, error) {
	saveDir := "./uploads/mou"
	if err := os.MkdirAll(saveDir, os.ModePerm); err != nil {
		return "", err
	}

	ext := filepath.Ext(file.Filename)
	if ext == "" {
		ext = ".pdf"
	}
	fileName := fmt.Sprintf("mou_%d_%s%s", time.Now().Unix(), uuid.New().String()[:8], ext)
	fullPath := filepath.Join(saveDir, fileName)

	if err := c.SaveFile(file, fullPath); err != nil {
		return "", err
	}

	return "/uploads/mou/" + fileName, nil
}

// validateBasicInfo validates the basic partner information
func validateBasicInfo(basicInfo struct {
	PartnerName   string `json:"partnerName"`
	Acronym       string `json:"acronym"`
	PartnerType   string `json:"partnerType"`
	Category      string `json:"category"`
	OfficialPhone string `json:"officialPhone"`
	OfficialEmail string `json:"officialEmail"`
}) error {
	if strings.TrimSpace(basicInfo.PartnerName) == "" {
		return errors.New("partner name is required")
	}
	if strings.TrimSpace(basicInfo.PartnerType) == "" {
		return errors.New("partner type is required")
	}
	if strings.TrimSpace(basicInfo.Category) == "" {
		return errors.New("category is required")
	}
	if strings.TrimSpace(basicInfo.OfficialPhone) == "" {
		return errors.New("official phone is required")
	}
	if strings.TrimSpace(basicInfo.OfficialEmail) == "" {
		return errors.New("official email is required")
	}
	return nil
}

// handleBase64String processes base64 encoded file data
func handleBase64String(data string) ([]byte, error) {
	if data == "" {
		return nil, errors.New("empty file data")
	}

	if strings.HasPrefix(data, "data:") {
		// Extract base64 data (remove data:application/pdf;base64, prefix)
		parts := strings.Split(data, ",")
		if len(parts) != 2 {
			return nil, errors.New("invalid base64 file format")
		}
		data = parts[1]
	}

	decoded, err := base64.StdEncoding.DecodeString(data)
	if err != nil {
		return nil, fmt.Errorf("failed to decode base64 file: %v", err)
	}

	if len(decoded) == 0 {
		return nil, errors.New("decoded file is empty")
	}

	return decoded, nil
}

// saveAddresses saves partner addresses
func saveAddresses(tx *gorm.DB, addresses []string, partnerID uint) error {
	var addressRecords []models.PartnerAddress

	for _, address := range addresses {
		if trimmedAddress := strings.TrimSpace(address); trimmedAddress != "" {
			addressRecords = append(addressRecords, models.PartnerAddress{
				Address:   trimmedAddress,
				PartnerID: partnerID,
			})
		}
	}

	if len(addressRecords) > 0 {
		if err := tx.Create(&addressRecords).Error; err != nil {
			return fmt.Errorf("failed to create addresses: %v", err)
		}
	}

	return nil
}

// saveContacts saves partner contacts
func saveContacts(tx *gorm.DB, contacts []struct {
	Name     string `json:"name"`
	Position string `json:"position"`
	Phone    string `json:"phone"`
	Email    string `json:"email"`
}, partnerID uint) error {
	for _, c := range contacts {
		record := models.PartnerContacts{
			Names:         c.Name,
			Title:         c.Position,
			PhoneNumber:   c.Phone,
			OfficialEmail: c.Email,
			PartnerID:     partnerID,
		}
		if err := tx.Create(&record).Error; err != nil {
			return err
		}
	}
	return nil
}

// saveMoUDetails saves MoU or other support documents to the database
func saveMoUDetails(tx *gorm.DB, mouData struct {
	HasMoU     bool        `json:"hasMou"`
	SignedBy   string      `json:"signedBy"`
	WhoTitle   string      `json:"whoTitle"`
	SignedDate string      `json:"signedDate"`
	ExpiryDate string      `json:"expiryDate"`
	File       interface{} `json:"file"`
}, partnerID uint, fileLink string, docType string) error {
	if !mouData.HasMoU {
		return nil // nothing to save
	}

	doc := models.SupportDocuments{
		PartnerID:    partnerID,
		DocumentType: strings.TrimSpace(docType),
		SignedBy:     strings.TrimSpace(mouData.SignedBy),
		WhoTitle:     strings.TrimSpace(mouData.WhoTitle),
		FileLink:     fileLink,
	}

	// Parse dates
	if mouData.SignedDate != "" {
		signedDate, err := time.Parse("2006-01-02", mouData.SignedDate)
		if err != nil {
			return fmt.Errorf("invalid signed date format: %v", err)
		}
		doc.SignedDate = signedDate
	}

	if mouData.ExpiryDate != "" {
		expiryDate, err := time.Parse("2006-01-02", mouData.ExpiryDate)
		if err != nil {
			return fmt.Errorf("invalid expiry date format: %v", err)
		}
		doc.ExpiryDate = expiryDate
	}

	// Save document
	if err := tx.Create(&doc).Error; err != nil {
		return fmt.Errorf("failed to save support document: %v", err)
	}

	return nil
}

// saveSupportYears saves partner support years data with districts attached to subcounties
func saveSupportYears(tx *gorm.DB, years []struct {
	Year          int      `json:"year"`
	Quarter       string   `json:"quarter"`
	Level         string   `json:"level"`
	ThematicAreas []string `json:"thematicAreas"`
	Districts     []struct {
		District    string   `json:"district"`
		Subcounties []string `json:"subcounties"`
	} `json:"districts"`
}, partnerID uint) error {

	for _, y := range years {
		thematicJSON, _ := json.Marshal(y.ThematicAreas)

		// Build child districts (skip when level is National)
		var districts []models.PartnerSupportYearDistrict
		if strings.ToLower(strings.TrimSpace(y.Level)) != "national" {
			for _, d := range y.Districts {
				// ignore empty district names
				if strings.TrimSpace(d.District) == "" {
					continue
				}
				subJSON, _ := json.Marshal(d.Subcounties)
				districts = append(districts, models.PartnerSupportYearDistrict{
					District:    d.District,
					Subcounties: subJSON,
				})
			}
		}

		supportYear := models.PartnerSupportYears{
			Year:          uint(y.Year),
			Quarter:       y.Quarter,
			Level:         y.Level,
			ThematicAreas: thematicJSON,
			PartnerID:     partnerID,
			Districts:     districts, // attach children before create
		}

		if err := tx.Session(&gorm.Session{FullSaveAssociations: true}).Create(&supportYear).Error; err != nil {
			return fmt.Errorf("failed to create support year and districts: %w", err)
		}
	}

	return nil
}

// handleUserAccounts creates user accounts for contacts
func handleUserAccounts(c *fiber.Ctx, tx *gorm.DB, userAccounts []struct {
	ContactIndex string `json:"contactIndex"`
	Username     string `json:"username"`
	Password     string `json:"password"`
}, contacts []struct {
	Name     string `json:"name"`
	Position string `json:"position"`
	Phone    string `json:"phone"`
	Email    string `json:"email"`
}, partnerID uint) error {

	for _, userAccount := range userAccounts {
		if strings.TrimSpace(userAccount.Username) == "" || strings.TrimSpace(userAccount.Password) == "" {
			continue
		}

		// Parse contact index
		contactIdx, err := strconv.Atoi(userAccount.ContactIndex)
		if err != nil || contactIdx < 0 || contactIdx >= len(contacts) {
			continue // Skip invalid contact index
		}

		var contact models.PartnerContacts
		if err := tx.Where("partner_id = ? AND official_email = ?",
			partnerID, contacts[contactIdx].Email).First(&contact).Error; err != nil {
			continue // Skip if contact not found
		}

		_, err = RegisterUserUsernameAndPassword(c, userAccount.Username, userAccount.Password, contact.OfficialEmail)
		if err != nil {
			return fmt.Errorf("failed to register user: %v", err)
		}

		var createdUser models.Users
		if err := tx.Where("username = ?", userAccount.Username).First(&createdUser).Error; err != nil {
			return fmt.Errorf("failed to find created user: %v", err)
		}

		// Update contact with user ID
		if err := tx.Model(&contact).Update("user_id", createdUser.ID).Error; err != nil {
			return fmt.Errorf("failed to link user to contact: %v", err)
		}
	}

	return nil
}

// CreateContact creates a new contact for the partner of the logged-in user
func CreateContact(c *fiber.Ctx) error {
	userUUID := c.Cookies("user_uuid")
	if userUUID == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized: missing user_uuid"})
	}

	// Find the user and preload Partner
	var user models.Users
	if err := database.DB.Where("uuid = ?", userUUID).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(404).JSON(fiber.Map{"error": "User not found"})
		}
		return c.Status(500).JSON(fiber.Map{"error": "Database error", "details": err.Error()})
	}

	var partnerContact models.PartnerContacts
	if err := database.DB.Preload("Partner").Where("user_id = ?", user.ID).First(&partnerContact).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(404).JSON(fiber.Map{"error": "User not found"})
		}
		return c.Status(500).JSON(fiber.Map{"error": "Database error", "details": err.Error()})
	}

	// Parse new contact details
	var newContact models.PartnerContacts
	if err := c.BodyParser(&newContact); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request", "details": err.Error()})
	}

	// Assign contact to this user's partner
	newContact.PartnerID = partnerContact.PartnerID

	// Save the new contact
	if err := database.DB.Create(&newContact).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create contact", "details": err.Error()})
	}

	return c.Status(201).JSON(fiber.Map{
		"message": "Contact created successfully",
		"contact": newContact,
	})
}

// UpdateContact updates a contact for the partner of the logged-in user
func UpdateContact(c *fiber.Ctx) error {
	userUUID := c.Cookies("user_uuid")
	if userUUID == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized: missing user_uuid"})
	}

	// Find the user and preload Partner
	var user models.Users
	if err := database.DB.Where("uuid = ?", userUUID).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(404).JSON(fiber.Map{"error": "User not found"})
		}
		return c.Status(500).JSON(fiber.Map{"error": "Database error", "details": err.Error()})
	}

	var partnerContact models.PartnerContacts
	if err := database.DB.Preload("Partner").Where("user_id = ?", user.ID).First(&partnerContact).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(404).JSON(fiber.Map{"error": "User not found"})
		}
		return c.Status(500).JSON(fiber.Map{"error": "Database error", "details": err.Error()})
	}

	// Parse updated contact details
	var updateData models.PartnerContacts
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request", "details": err.Error()})
	}

	if updateData.ID == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "Contact ID is required"})
	}

	// Ensure contact belongs to this user's partner
	var existing models.PartnerContacts
	if err := database.DB.Where("id = ? AND partner_id = ?", updateData.ID, partnerContact.PartnerID).First(&existing).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(404).JSON(fiber.Map{"error": "Contact not found for this partner"})
		}
		return c.Status(500).JSON(fiber.Map{"error": "Database error", "details": err.Error()})
	}

	// Update only provided fields
	if err := database.DB.Model(&existing).Updates(updateData).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update contact", "details": err.Error()})
	}

	return c.JSON(fiber.Map{
		"message": "Contact updated successfully",
		"contact": existing,
	})
}

// GET /partners
func GetPartners(c *fiber.Ctx) error {
	var partners []models.Partner

	if err := database.DB.
		Preload("PartnerAddress").
		Preload("PartnerContacts").
		Preload("PartnerSupportYears").
		Preload("PartnerSupportYears.Districts").
		Preload("SupportDocuments").
		Find(&partners).Error; err != nil {

		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Partners not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to retrieve partners",
			"details": err.Error(),
		})
	}

	return c.JSON(partners)
}

// GET /partners/:uuid
func GetPartnerByID(c *fiber.Ctx) error {
	partnerUUID := c.Params("uuid")
	if partnerUUID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Partner UUID is required",
		})
	}

	var partner models.Partner
	if err := database.DB.Preload("PartnerAddress").
		Preload("PartnerContacts").
		Preload("PartnerSupportYears").
		Preload("SupportDocuments").
		Preload("PartnerSupportYears.Districts").
		Preload("PartnerMoU").
		Where("uuid = ?", partnerUUID).
		First(&partner).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Partner not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to retrieve partner",
			"details": err.Error(),
		})
	}
	return c.JSON(fiber.Map{
		"partner": partner,
	})
}

// PUT /partners/:uuid
func UpdatePartner(c *fiber.Ctx) error {
	partnerUUID := c.Params("uuid")
	if partnerUUID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Partner UUID is required",
		})
	}

	var updates map[string]interface{}
	if err := c.BodyParser(&updates); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Invalid request body",
			"details": err.Error(),
		})
	}

	// Check if partner exists first
	var existingPartner models.Partner
	if err := database.DB.Where("uuid = ?", partnerUUID).First(&existingPartner).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Partner not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to check partner existence",
			"details": err.Error(),
		})
	}

	if err := database.DB.Model(&models.Partner{}).
		Where("uuid = ?", partnerUUID).
		Updates(updates).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to update partner",
			"details": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Partner updated successfully",
	})
}

// DELETE /partners/:uuid
func DeletePartner(c *fiber.Ctx) error {
	partnerUUID := c.Params("uuid")
	if partnerUUID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Partner UUID is required",
		})
	}

	// Check if partner exists first
	var existingPartner models.Partner
	if err := database.DB.Where("uuid = ?", partnerUUID).First(&existingPartner).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Partner not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to check partner existence",
			"details": err.Error(),
		})
	}

	// Use soft delete (GORM's default behavior with gorm.Model)
	if err := database.DB.Where("uuid = ?", partnerUUID).Delete(&models.Partner{}).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to delete partner",
			"details": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Partner deleted successfully",
	})
}

func GetSupportDocuments(c *fiber.Ctx) error {
	userUUID := c.Cookies("user_uuid")
	if userUUID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized: missing user_uuid",
		})
	}

	// Find the user
	var user models.Users
	if err := database.DB.Where("uuid = ?", userUUID).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Database error",
			"details": err.Error(),
		})
	}

	// Find the partner linked to this user via PartnerContacts
	var partnerContact models.PartnerContacts
	if err := database.DB.Preload("Partner").Where("user_id = ?", user.ID).First(&partnerContact).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Partner not found for user"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Database error",
			"details": err.Error(),
		})
	}

	partnerID := partnerContact.PartnerID

	// Get all support documents for this partner
	var documents []models.SupportDocuments
	if err := database.DB.Where("partner_id = ?", partnerID).Find(&documents).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to fetch support documents",
			"details": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"partner_id": partnerID,
		"documents":  documents,
	})
}

// ServeUploadedFile serves files from the uploads directory
func ServeUploadedFile(c *fiber.Ctx) error {
	// Get the file path from the URL parameters
	// This handles routes like /uploads/mou/:filename or /uploads/:category/:filename
	category := c.Params("category") // e.g., "mou"
	filename := c.Params("filename") // e.g., "mou_1755348223_f8ff0756.docx"

	// Construct the full file path
	var filePath string
	if category != "" {
		filePath = filepath.Join("./uploads", category, filename)
	} else {
		// For direct file access without category
		filePath = filepath.Join("./uploads", filename)
	}

	// Security check: ensure the file path is within the uploads directory
	absPath, err := filepath.Abs(filePath)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid file path",
		})
	}

	uploadsDir, err := filepath.Abs("./uploads")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Server configuration error",
		})
	}

	// Check if the file path is within the uploads directory (prevent directory traversal)
	if !strings.HasPrefix(absPath, uploadsDir) {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Access denied",
		})
	}

	// Check if file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "File not found",
		})
	}

	// Read file info
	fileInfo, err := os.Stat(filePath)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to read file information",
		})
	}

	// Determine content type based on file extension
	ext := filepath.Ext(filename)
	contentType := mime.TypeByExtension(ext)
	if contentType == "" {
		// Default content types for common file types
		switch strings.ToLower(ext) {
		case ".pdf":
			contentType = "application/pdf"
		case ".doc":
			contentType = "application/msword"
		case ".docx":
			contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
		case ".txt":
			contentType = "text/plain"
		case ".jpg", ".jpeg":
			contentType = "image/jpeg"
		case ".png":
			contentType = "image/png"
		default:
			contentType = "application/octet-stream"
		}
	}

	// Set headers
	c.Set("Content-Type", contentType)
	c.Set("Content-Disposition", fmt.Sprintf("inline; filename=\"%s\"", filename))
	c.Set("Content-Length", fmt.Sprintf("%d", fileInfo.Size()))

	// Serve the file
	return c.SendFile(filePath)
}
