package service

import (
	"encoding/json"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/datatypes"
	"moh-intranet.com/database"
	"moh-intranet.com/models"
)

type CreateInternalGroupRequest struct {
	Name          string          `json:"name"`
	Description   string          `json:"description"`
	ThematicAreas json.RawMessage `json:"thematic_areas"` // raw JSON to store as-is
	Districts     json.RawMessage `json:"districts"`
}

// Create a single Internal Group
func CreateInternalGroup(c *fiber.Ctx) error {
	var req CreateInternalGroupRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Generate UUID
	newUUID := uuid.New().String()

	group := models.InternalGroups{
		UUID:          newUUID,
		Name:          req.Name,
		Description:   req.Description,
		ThematicAreas: datatypes.JSON(req.ThematicAreas),
		Districts:     datatypes.JSON(req.Districts),
	}

	if err := database.DB.Create(&group).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create Internal Group"})
	}

	return c.JSON(fiber.Map{
		"message": "Internal Group Created Successfully",
		"data":    group,
	})
}

// Get all Internal Groups
func GetInternalGroups(c *fiber.Ctx) error {
	var groups []models.InternalGroups

	if err := database.DB.Find(&groups).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch Internal Groups"})
	}

	return c.JSON(groups)
}

// Get internal group by UUID
func GetInternalGroup(c *fiber.Ctx) error {
	uuid := c.Params("uuid")
	var group models.InternalGroups

	if err := database.DB.Where("uuid = ?", uuid).First(&group).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Internal Group not found"})
	}

	return c.JSON(group)
}

// Update Internal Group by UUID
func UpdateInternalGroup(c *fiber.Ctx) error {
	uuid := c.Params("uuid")
	var group models.InternalGroups

	if err := database.DB.Where("uuid = ?", uuid).First(&group).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Internal Group not found"})
	}

	var req CreateInternalGroupRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	group.Name = req.Name
	group.Description = req.Description
	group.ThematicAreas = datatypes.JSON(req.ThematicAreas)
	group.Districts = datatypes.JSON(req.Districts)

	if err := database.DB.Save(&group).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update Internal Group"})
	}

	return c.JSON(fiber.Map{
		"message": "Internal Group Updated Successfully",
		"data":    group,
	})
}

// Delete Internal Group by UUID
func DeleteInternalGroup(c *fiber.Ctx) error {
	uuid := c.Params("uuid")

	if uuid == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "UUID is required"})
	}

	if err := database.DB.Where("uuid = ?", uuid).Delete(&models.InternalGroups{}).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete Internal Group"})
	}

	return c.JSON(fiber.Map{"message": "Internal Group deleted successfully"})
}
