package service

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"moh-intranet.com/database"
	"moh-intranet.com/models"
)

// CreatePartner creates a new partner record
func CreatePartner(c *fiber.Ctx) error {
	// Parse multipart form
	form, err := c.MultipartForm()
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid form data")
	}

	// Extract basic info
	acronym := form.Value["acronym"][0]
	partnerType := form.Value["partnerType"][0]
	partnerCategory := form.Value["category"][0]
	officialPhone := form.Value["officialPhone"][0]
	officialEmail := form.Value["officialEmail"][0]
	hasMoU := form.Value["hasMoU"][0] == "on"

	// Handle MoU file
	var mouFilePath string
	if mouFiles, ok := form.File["mouFile"]; ok && len(mouFiles) > 0 {
		mouFile := mouFiles[0]

		// Create uploads dir if not exists
		saveDir := "./uploads/mou"
		if err := os.MkdirAll(saveDir, os.ModePerm); err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Failed to create upload directory")
		}

		// Generate unique filename
		fileName := fmt.Sprintf("mou_%d_%s%s",
			time.Now().Unix(),
			uuid.New().String(),
			filepath.Ext(mouFile.Filename),
		)

		fullPath := filepath.Join(saveDir, fileName)

		// Save file locally
		if err := c.SaveFile(mouFile, fullPath); err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Failed to save file")
		}

		// Store relative path for frontend access
		mouFilePath = "/uploads/mou/" + fileName
	}

	// Create partner object
	partner := models.Partner{
		UUID:            uuid.New().String(),
		Acronym:         acronym,
		PartnerType:     partnerType,
		PartnerCategory: partnerCategory,
		OfficialPhone:   officialPhone,
		OfficialEmail:   officialEmail,
		HasMoU:          hasMoU,
		MoULink:         mouFilePath,
	}

	// Save to DB
	if err := database.DB.Create(&partner).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to save partner")
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Partner created successfully",
		"partner": partner,
	})
}

// GET /partners/:uuid
func GetPartner(c *fiber.Ctx) error {
	partnerUUID := c.Params("uuid")

	var partner models.Partner
	if err := database.DB.Preload("PartnerAddress").
		Preload("PartnerContacts").
		Preload("PartnerSupportYears").
		Where("uuid = ?", partnerUUID).
		First(&partner).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusNotFound, "Partner not found")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to retrieve partner")
	}

	return c.JSON(partner)
}

// PUT /partners/:uuid
func UpdatePartner(c *fiber.Ctx) error {
	partnerUUID := c.Params("uuid")

	var updates map[string]interface{}
	if err := c.BodyParser(&updates); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	if err := database.DB.Model(&models.Partner{}).
		Where("uuid = ?", partnerUUID).
		Updates(updates).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to update partner")
	}

	return c.JSON(fiber.Map{"message": "Partner updated successfully"})
}

// DELETE /partners/:uuid
func DeletePartner(c *fiber.Ctx) error {
	partnerUUID := c.Params("uuid")

	if err := database.DB.Where("uuid = ?", partnerUUID).Delete(&models.Partner{}).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to delete partner")
	}

	return c.JSON(fiber.Map{"message": "Partner deleted successfully"})
}
