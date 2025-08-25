package service

import (
	"github.com/gofiber/fiber/v2"
	"moh-intranet.com/database"
	"moh-intranet.com/models"
)

func CreatePartnerCategory(c *fiber.Ctx) error {
	var req struct {
		Type  string `json:"type"`
		Value string `json:"value"`
	}
	// Parse request body
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Create user record
	area := models.PartnerCategory{
		Type:  req.Type,
		Value: req.Value,
	}

	// Save user to database
	if err := database.DB.Create(&area).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create Thematic Area."})
	}

	return c.JSON(fiber.Map{
		"message": "Thematic Area Created Successfully",
	})
}

func CreatePartnerCategoriesBulk(c *fiber.Ctx) error {
	var req struct {
		PartnerCategories []models.PartnerCategory `json:"partner_categories"`
	}

	// Parse request body
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request, expected JSON with 'partner_categories' array",
		})
	}

	if len(req.PartnerCategories) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "No partner_categories provided",
		})
	}

	// Build slice of PartnerCategorys models
	areas := make([]models.PartnerCategory, len(req.PartnerCategories))
	for i, a := range req.PartnerCategories {
		areas[i] = models.PartnerCategory{
			Type:  a.Type,
			Value: a.Value,
		}
	}

	// Bulk insert
	if err := database.DB.Create(&areas).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create thematic areas",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Thematic Areas Created Successfully",
		"data":    areas,
	})
}

// Get all Thematic Areas
func GetPartnerCategory(c *fiber.Ctx) error {
	var areas []models.PartnerCategory

	if err := database.DB.Find(&areas).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch Thematic Areas."})
	}

	return c.JSON(areas)
}

// Delete a Thematic Area by ID
func DeletePartnerCategory(c *fiber.Ctx) error {
	id := c.Params("id")

	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "ID is required"})
	}

	if err := database.DB.Delete(&models.PartnerCategory{}, id).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete Thematic Area."})
	}

	return c.JSON(fiber.Map{
		"message": "Thematic Area deleted successfully",
	})
}
