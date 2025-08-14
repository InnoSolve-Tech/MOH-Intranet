package service

import (
	"errors"
	"fmt"
	"mime/multipart"
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
func CreatePartner(c *fiber.Ctx) error {
	// Parse multipart form
	form, err := c.MultipartForm()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Invalid form data",
			"details": err.Error(),
		})
	}

	// Extract and validate basic info
	basicInfo, err := extractBasicInfo(form.Value)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Invalid basic information",
			"details": err.Error(),
		})
	}

	// Handle MoU file upload
	mouFilePath, err := handleMoUUpload(c, form)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to upload MoU file",
			"details": err.Error(),
		})
	}

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
		Acronym:         basicInfo.Acronym,
		PartnerType:     basicInfo.PartnerType,
		PartnerCategory: basicInfo.Category,
		OfficialPhone:   basicInfo.OfficialPhone,
		OfficialEmail:   basicInfo.OfficialEmail,
		HasMoU:          basicInfo.HasMoU,
		MoULink:         mouFilePath,
	}

	if err := tx.Create(&partner).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to create partner",
			"details": err.Error(),
		})
	}

	// Process and save addresses
	if err := savePartnerAddresses(tx, form.Value, partner.ID); err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to save addresses",
			"details": err.Error(),
		})
	}

	// Process and save contacts
	if err := savePartnerContacts(tx, form.Value, partner.ID); err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to save contacts",
			"details": err.Error(),
		})
	}

	// Process and save support years
	if err := savePartnerSupportYears(tx, form.Value, partner.ID); err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to save support years",
			"details": err.Error(),
		})
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
		First(&completePartner, partner.ID)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Partner created successfully",
		"partner": completePartner,
	})
}

// extractBasicInfo extracts basic partner information from form
func extractBasicInfo(form map[string][]string) (*struct {
	Acronym       string
	PartnerType   string
	Category      string
	OfficialPhone string
	OfficialEmail string
	HasMoU        bool
}, error) {
	// Validate required fields exist
	requiredFields := []string{"acronym", "partnerType", "category", "officialPhone", "officialEmail"}
	for _, field := range requiredFields {
		if values, exists := form[field]; !exists || len(values) == 0 || strings.TrimSpace(values[0]) == "" {
			return nil, fmt.Errorf("missing required field: %s", field)
		}
	}

	hasMoU := false
	if hasMoUValue, exists := form["hasMoU"]; exists && len(hasMoUValue) > 0 {
		hasMoU = hasMoUValue[0] == "on" || hasMoUValue[0] == "true"
	}

	return &struct {
		Acronym       string
		PartnerType   string
		Category      string
		OfficialPhone string
		OfficialEmail string
		HasMoU        bool
	}{
		Acronym:       strings.TrimSpace(form["acronym"][0]),
		PartnerType:   strings.TrimSpace(form["partnerType"][0]),
		Category:      strings.TrimSpace(form["category"][0]),
		OfficialPhone: strings.TrimSpace(form["officialPhone"][0]),
		OfficialEmail: strings.TrimSpace(form["officialEmail"][0]),
		HasMoU:        hasMoU,
	}, nil
}

func handleMoUUpload(c *fiber.Ctx, form *multipart.Form) (string, error) {
	mouFiles, hasFile := form.File["mouFile"]
	if !hasFile || len(mouFiles) == 0 {
		// No file uploaded, which is fine if HasMoU is false
		return "", nil
	}

	mouFile := mouFiles[0]
	if mouFile.Size == 0 {
		// Empty file
		return "", nil
	}

	// Validate file type (optional - add your allowed types)
	allowedTypes := []string{".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"}
	ext := strings.ToLower(filepath.Ext(mouFile.Filename))
	isValidType := false
	for _, allowedType := range allowedTypes {
		if ext == allowedType {
			isValidType = true
			break
		}
	}
	if !isValidType {
		return "", fmt.Errorf("invalid file type: %s. Allowed types: %v", ext, allowedTypes)
	}

	// Create uploads directory
	saveDir := "./uploads/mou"
	if err := os.MkdirAll(saveDir, os.ModePerm); err != nil {
		return "", fmt.Errorf("failed to create upload directory: %v", err)
	}

	// Generate unique filename
	fileName := fmt.Sprintf("mou_%d_%s%s",
		time.Now().Unix(),
		uuid.New().String()[:8], // Shorter UUID for filename
		ext,
	)

	fullPath := filepath.Join(saveDir, fileName)

	// Save file
	if err := c.SaveFile(mouFile, fullPath); err != nil {
		return "", fmt.Errorf("failed to save file: %v", err)
	}

	// Return relative path for database storage
	return "/uploads/mou/" + fileName, nil
}

// savePartnerAddresses saves partner addresses
func savePartnerAddresses(tx *gorm.DB, form map[string][]string, partnerID uint) error {
	var addresses []models.PartnerAddress

	// Look for address fields in form
	for key, values := range form {
		if strings.Contains(key, "addresses") && len(values) > 0 {
			for _, address := range values {
				if trimmedAddress := strings.TrimSpace(address); trimmedAddress != "" {
					addresses = append(addresses, models.PartnerAddress{
						Address:   trimmedAddress,
						PartnerID: partnerID,
					})
				}
			}
		}
	}

	// Batch create addresses if any exist
	if len(addresses) > 0 {
		if err := tx.Create(&addresses).Error; err != nil {
			return fmt.Errorf("failed to create addresses: %v", err)
		}
	}

	return nil
}

// savePartnerContacts saves partner contacts
func savePartnerContacts(tx *gorm.DB, form map[string][]string, partnerID uint) error {
	contactGroups := make(map[string]map[string]string)

	// Group contact fields by index
	for key, values := range form {
		if strings.Contains(key, "contacts[") && len(values) > 0 {
			// Parse contact field pattern: contacts[0][name], contacts[0][position], etc.
			if parts := strings.Split(key, "]["); len(parts) >= 2 {
				indexPart := strings.Replace(parts[0], "contacts[", "", 1)
				fieldName := strings.Replace(parts[1], "]", "", 1)

				if contactGroups[indexPart] == nil {
					contactGroups[indexPart] = make(map[string]string)
				}
				contactGroups[indexPart][fieldName] = strings.TrimSpace(values[0])
			}
		}
	}

	var contacts []models.PartnerContacts

	// Create contact records
	for _, contactData := range contactGroups {
		// Validate required fields
		if contactData["name"] == "" || contactData["position"] == "" ||
			contactData["phone"] == "" || contactData["email"] == "" {
			continue // Skip incomplete contacts
		}

		contacts = append(contacts, models.PartnerContacts{
			Names:          contactData["name"],
			Title:          contactData["position"],
			PhoneNumber:    contactData["phone"],
			AltPhoneNumber: contactData["alternatePhone"],
			OfficialEmail:  contactData["email"],
			Address:        contactData["address"],
			PartnerID:      partnerID,
		})
	}

	// Batch create contacts if any exist
	if len(contacts) > 0 {
		if err := tx.Create(&contacts).Error; err != nil {
			return fmt.Errorf("failed to create contacts: %v", err)
		}
	}

	return nil
}

// savePartnerSupportYears saves partner support years data
func savePartnerSupportYears(tx *gorm.DB, form map[string][]string, partnerID uint) error {
	supportGroups := make(map[string]map[string]interface{})

	// Group support year fields by index
	for key, values := range form {
		if strings.Contains(key, "supportYears[") && len(values) > 0 {
			// Parse field pattern: supportYears[0][year], supportYears[0][level], etc.
			if parts := strings.Split(key, "]["); len(parts) >= 2 {
				indexPart := strings.Replace(parts[0], "supportYears[", "", 1)
				fieldName := strings.Replace(parts[1], "]", "", 1)

				if supportGroups[indexPart] == nil {
					supportGroups[indexPart] = make(map[string]interface{})
				}

				// Handle different field types
				switch fieldName {
				case "districts":
					// Handle multiple district selection
					var cleanDistricts []string
					for _, district := range values {
						if trimmed := strings.TrimSpace(district); trimmed != "" {
							cleanDistricts = append(cleanDistricts, trimmed)
						}
					}
					supportGroups[indexPart][fieldName] = cleanDistricts
				case "year":
					if year, err := strconv.Atoi(strings.TrimSpace(values[0])); err == nil {
						supportGroups[indexPart][fieldName] = year
					}
				default:
					supportGroups[indexPart][fieldName] = strings.TrimSpace(values[0])
				}
			}
		}
	}

	var supportYears []models.PartnerSupportYears

	// Create support year records
	for _, supportData := range supportGroups {
		year, yearOk := supportData["year"].(int)
		level, levelOk := supportData["level"].(string)
		thematic, thematicOk := supportData["thematic"].(string)

		if !yearOk || !levelOk || !thematicOk || level == "" || thematic == "" {
			continue // Skip incomplete support year data
		}

		// Handle districts (could be multiple)
		var districts []string
		if districtData, exists := supportData["districts"]; exists {
			if districtSlice, ok := districtData.([]string); ok {
				districts = districtSlice
			}
		}

		// Create separate records for each district if multiple districts
		if len(districts) > 0 {
			for _, district := range districts {
				supportYears = append(supportYears, models.PartnerSupportYears{
					Year:                uint(year),
					LevelOfSupport:      level,
					ThematicAreas:       thematic,
					District:            district,
					DistrictSupportType: getDistrictSupportType(supportData),
					PartnerID:           partnerID, // ADD THIS LINE - Set the foreign key
				})
			}
		} else {
			// Create single record without district
			supportYears = append(supportYears, models.PartnerSupportYears{
				Year:                uint(year),
				LevelOfSupport:      level,
				ThematicAreas:       thematic,
				District:            "",
				DistrictSupportType: getDistrictSupportType(supportData),
				PartnerID:           partnerID, // ADD THIS LINE - Set the foreign key
			})
		}
	}

	// Batch create support years if any exist
	if len(supportYears) > 0 {
		if err := tx.Create(&supportYears).Error; err != nil {
			return fmt.Errorf("failed to create support years: %v", err)
		}
	}

	return nil
}

// getDistrictSupportType extracts district support type from coverage data
func getDistrictSupportType(supportData map[string]interface{}) string {
	if coverage, exists := supportData["coverage"]; exists {
		if coverageStr, ok := coverage.(string); ok && coverageStr != "" {
			return coverageStr
		}
		if coverageMap, ok := coverage.(map[string]string); ok {
			for _, value := range coverageMap {
				if value != "" {
					return value
				}
			}
		}
	}
	return ""
}

// GET /partners
func GetPartners(c *fiber.Ctx) error {
	var partners []models.Partner

	if err := database.DB.
		Preload("PartnerAddress").
		Preload("PartnerContacts").
		Preload("PartnerSupportYears").
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
