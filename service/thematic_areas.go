package service

import (
	"github.com/gofiber/fiber/v2"
	"moh-intranet.com/database"
	"moh-intranet.com/models"
)

func CreateThematicArea(c *fiber.Ctx) error {
	var req struct {
		Area string `json:"area"`
	}
	// Parse request body
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Create user record
	area := models.ThematicAreas{
		Area: req.Area,
	}

	// Save user to database
	if err := database.DB.Create(&area).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create Thematic Area."})
	}

	return c.JSON(fiber.Map{
		"message": "Thematic Area Created Successfully",
	})
}

func CreateThematicAreasBulk(c *fiber.Ctx) error {
	var req struct {
		Areas []string `json:"areas"`
	}

	// Parse request body
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request, expected JSON with 'areas' array",
		})
	}

	if len(req.Areas) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "No areas provided",
		})
	}

	// Build slice of ThematicAreas models
	areas := make([]models.ThematicAreas, len(req.Areas))
	for i, a := range req.Areas {
		areas[i] = models.ThematicAreas{
			Area: a,
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
func GetThematicAreas(c *fiber.Ctx) error {
	var areas []models.ThematicAreas

	if err := database.DB.Find(&areas).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch Thematic Areas."})
	}

	return c.JSON(areas)
}

// Delete a Thematic Area by ID
func DeleteThematicArea(c *fiber.Ctx) error {
	id := c.Params("id")

	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "ID is required"})
	}

	if err := database.DB.Delete(&models.ThematicAreas{}, id).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete Thematic Area."})
	}

	return c.JSON(fiber.Map{
		"message": "Thematic Area deleted successfully",
	})
}
