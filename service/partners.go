// service/partner.go
package service

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"moh-intranet.com/database"
	"moh-intranet.com/models"
)

// CreatePartner creates a new partner record with all related data
// CreatePartner creates a new partner record with all related data
func CreatePartner(c *fiber.Ctx) error {
	var submissionData models.PartnerSubmissionData

	// Check content type to determine parsing method
	contentType := c.Get("Content-Type")

	if strings.Contains(contentType, "multipart/form-data") {
		// Handle FormData submission

		// Parse the JSON data from form field
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

		// Handle file from FormData
		if submissionData.MoU.HasMoU {
			file, err := c.FormFile("mouFile")
			if err == nil && file != nil {
				// Process the multipart file
				fileHandle, err := file.Open()
				if err != nil {
					return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
						"error":   "Failed to open uploaded file",
						"details": err.Error(),
					})
				}
				defer fileHandle.Close()

				// Read file content
				fileContent, err := io.ReadAll(fileHandle)
				if err != nil {
					return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
						"error":   "Failed to read uploaded file",
						"details": err.Error(),
					})
				}

				// Create file object for processing
				fileObj := map[string]interface{}{
					"name":    file.Filename,
					"content": base64.StdEncoding.EncodeToString(fileContent),
				}

				submissionData.MoU.File = fileObj
			}
		}

	} else {
		// Handle JSON submission (your existing code)
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

	// Handle MoU file if provided
	mouFilePath := ""
	if submissionData.MoU.HasMoU {

		if submissionData.MoU.File != nil {
			filePath, err := handleMoUFile(submissionData.MoU.File)
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error":   "Failed to process MoU file",
					"details": err.Error(),
				})
			}
			mouFilePath = filePath
		}
	}

	// Rest of your existing code remains the same...
	// [Continue with transaction handling, saving to database, etc.]

	// Start database transaction
	tx := database.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Create main partner record
	partner := models.Partner{
		UUID:            uuid.New().String(),
		PartnerName:     submissionData.BasicInfo.PartnerName,
		Acronym:         submissionData.BasicInfo.Acronym,
		PartnerType:     submissionData.BasicInfo.PartnerType,
		PartnerCategory: submissionData.BasicInfo.Category,
		OfficialPhone:   submissionData.BasicInfo.OfficialPhone,
		OfficialEmail:   submissionData.BasicInfo.OfficialEmail,
		HasMoU:          submissionData.MoU.HasMoU,
		MoULink:         mouFilePath,
	}

	if err := tx.Create(&partner).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to create partner",
			"details": err.Error(),
		})
	}

	// Save addresses
	if err := saveAddresses(tx, submissionData.Addresses, partner.ID); err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to save addresses",
			"details": err.Error(),
		})
	}

	// Save contacts
	if err := saveContacts(tx, submissionData.Contacts, partner.ID); err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to save contacts",
			"details": err.Error(),
		})
	}

	// Save MoU details if exists
	if submissionData.MoU.HasMoU {
		if err := saveMoUDetails(tx, submissionData.MoU, partner.ID, mouFilePath); err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   "Failed to save MoU details",
				"details": err.Error(),
			})
		}
	}

	// Save support years
	if err := saveSupportYears(tx, submissionData.SupportYears, partner.ID); err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to save support years",
			"details": err.Error(),
		})
	}

	// Handle user accounts if provided
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

	// Load the complete partner data with relationships for response
	var completePartner models.Partner
	database.DB.Preload("PartnerAddress").
		Preload("PartnerContacts").
		Preload("PartnerSupportYears").
		Preload("PartnerMoU").
		First(&completePartner, partner.ID)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Partner created successfully",
		"partner": completePartner,
	})
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

// handleMoUFile processes the MoU file from FormData
func handleMoUFile(fileInterface interface{}) (string, error) {
	if fileInterface == nil {
		return "", nil
	}

	// Create uploads directory first
	saveDir := "./uploads/mou"
	if err := os.MkdirAll(saveDir, os.ModePerm); err != nil {
		return "", fmt.Errorf("failed to create upload directory: %v", err)
	}

	var fileName string
	var fileData []byte
	var err error

	// Handle different file input types
	switch v := fileInterface.(type) {
	case string:
		// Handle base64 string
		if v == "" {
			return "", nil
		}
		fileName = fmt.Sprintf("mou_%d_%s.pdf", time.Now().Unix(), uuid.New().String()[:8])
		fileData, err = handleBase64String(v)
		if err != nil {
			return "", err
		}

	case map[string]interface{}:

		// Try to get file name
		if name, ok := v["name"].(string); ok && name != "" {
			ext := filepath.Ext(name)
			if ext == "" {
				ext = ".pdf"
			}
			fileName = fmt.Sprintf("mou_%d_%s%s", time.Now().Unix(), uuid.New().String()[:8], ext)
		} else {
			fileName = fmt.Sprintf("mou_%d_%s.pdf", time.Now().Unix(), uuid.New().String()[:8])
		}

		// Try to get file data from various possible fields
		if data, ok := v["data"].(string); ok && data != "" {
			fileData, err = handleBase64String(data)
		} else if content, ok := v["content"].(string); ok && content != "" {
			fileData, err = handleBase64String(content)
		} else if buffer, ok := v["buffer"].([]byte); ok && len(buffer) > 0 {
			fileData = buffer
		} else {
			return "", fmt.Errorf("no valid file data found in file object")
		}

		if err != nil {
			return "", err
		}

	default:
		return "", fmt.Errorf("unsupported file type: %T", fileInterface)
	}

	if len(fileData) == 0 {
		return "", fmt.Errorf("no file data to save")
	}

	// Save file to disk
	fullPath := filepath.Join(saveDir, fileName)
	if err := os.WriteFile(fullPath, fileData, 0644); err != nil {
		return "", fmt.Errorf("failed to save file: %v", err)
	}

	// Return relative path for database storage
	return "/uploads/mou/" + fileName, nil
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
	var contactRecords []models.PartnerContacts

	for _, contact := range contacts {
		// Validate required contact fields
		if strings.TrimSpace(contact.Name) == "" ||
			strings.TrimSpace(contact.Position) == "" ||
			strings.TrimSpace(contact.Phone) == "" ||
			strings.TrimSpace(contact.Email) == "" {
			continue // Skip incomplete contacts
		}

		contactRecords = append(contactRecords, models.PartnerContacts{
			Names:         strings.TrimSpace(contact.Name),
			Title:         strings.TrimSpace(contact.Position),
			PhoneNumber:   strings.TrimSpace(contact.Phone),
			OfficialEmail: strings.TrimSpace(contact.Email),
			PartnerID:     partnerID,
		})
	}

	if len(contactRecords) > 0 {
		if err := tx.Create(&contactRecords).Error; err != nil {
			return fmt.Errorf("failed to create contacts: %v", err)
		}
	}

	return nil
}

// saveMoUDetails saves MoU details to the database
func saveMoUDetails(tx *gorm.DB, mouData struct {
	HasMoU     bool        `json:"hasMou"`
	SignedBy   string      `json:"signedBy"`
	WhoTitle   string      `json:"whoTitle"`
	SignedDate string      `json:"signedDate"`
	ExpiryDate string      `json:"expiryDate"`
	File       interface{} `json:"file"`
}, partnerID uint, filePath string) error {

	mou := models.PartnerMoU{
		SignedBy:  strings.TrimSpace(mouData.SignedBy),
		WhoTitle:  strings.TrimSpace(mouData.WhoTitle),
		FilePath:  filePath,
		PartnerID: partnerID,
	}

	// Parse dates
	if mouData.SignedDate != "" {
		if signedDate, err := time.Parse("2006-01-02", mouData.SignedDate); err == nil {
			mou.SignedDate = &signedDate
		}
	}

	if mouData.ExpiryDate != "" {
		if expiryDate, err := time.Parse("2006-01-02", mouData.ExpiryDate); err == nil {
			mou.ExpiryDate = &expiryDate
		}
	}

	if err := tx.Create(&mou).Error; err != nil {
		return fmt.Errorf("failed to create MoU details: %v", err)
	}

	return nil
}

// saveSupportYears saves partner support years data
func saveSupportYears(tx *gorm.DB, supportYears []struct {
	Year          int               `json:"year"`
	Level         string            `json:"level"`
	ThematicAreas string            `json:"thematicAreas"` // Updated to match frontend
	Districts     []string          `json:"districts"`
	Coverage      map[string]string `json:"coverage"`
}, partnerID uint) error {
	var supportYearRecords []models.PartnerSupportYears

	for _, support := range supportYears {
		// Validate required fields
		if support.Year == 0 ||
			strings.TrimSpace(support.Level) == "" ||
			strings.TrimSpace(support.ThematicAreas) == "" {
			continue // Skip incomplete support year data
		}

		// Create records for each district if districts are provided
		if len(support.Districts) > 0 {
			for _, district := range support.Districts {
				district = strings.TrimSpace(district)
				if district == "" {
					continue
				}

				// Get coverage type for this district
				coverageType := ""
				if support.Coverage != nil {
					if coverage, exists := support.Coverage[district]; exists {
						coverageType = coverage
					}
				}

				supportYearRecords = append(supportYearRecords, models.PartnerSupportYears{
					Year:                uint(support.Year),
					LevelOfSupport:      strings.TrimSpace(support.Level),
					ThematicAreas:       strings.TrimSpace(support.ThematicAreas), // Updated field name
					District:            district,
					DistrictSupportType: coverageType,
					PartnerID:           partnerID,
				})
			}
		} else {
			// Create single record without district
			supportYearRecords = append(supportYearRecords, models.PartnerSupportYears{
				Year:                uint(support.Year),
				LevelOfSupport:      strings.TrimSpace(support.Level),
				ThematicAreas:       strings.TrimSpace(support.ThematicAreas), // Updated field name
				District:            "",
				DistrictSupportType: "",
				PartnerID:           partnerID,
			})
		}
	}

	if len(supportYearRecords) > 0 {
		if err := tx.Create(&supportYearRecords).Error; err != nil {
			return fmt.Errorf("failed to create support years: %v", err)
		}
	}

	return nil
}

// handleUserAccounts creates user accounts for contacts
func handleUserAccounts(c *fiber.Ctx, tx *gorm.DB, userAccounts []struct {
	ContactIndex string `json:"contactIndex"`
	Username     string `json:"username"`
	Password     string `json:"password"`
	AssignedUser string `json:"assignedUser"`
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

// Update contact information
func UpdateContact(c *fiber.Ctx) error {
	contactID := c.Params("id")

	var updateData models.PartnerContacts
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	var existing models.PartnerContacts
	if err := database.DB.First(&existing, contactID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{"error": "Contact not found"})
		}
		return c.Status(500).JSON(fiber.Map{"error": "Database error"})
	}

	// Update only the provided fields
	if err := database.DB.Model(&existing).Updates(updateData).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update contact"})
	}

	return c.JSON(fiber.Map{"message": "Contact updated successfully"})
}

// GET /partners
func GetPartners(c *fiber.Ctx) error {
	var partners []models.Partner

	if err := database.DB.
		Preload("PartnerAddress").
		Preload("PartnerContacts").
		Preload("PartnerSupportYears").
		Preload("PartnerMoU").
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
