package service

import (
	"crypto/rand"
	"encoding/hex"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"moh-intranet.com/database"
	"moh-intranet.com/models"
)

// generateRandomToken creates a secure random string
func generateRandomToken() (string, error) {
	bytes := make([]byte, 32) // 256-bit token
	_, err := rand.Read(bytes)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// CreateApiToken handles creating a new API token
func CreateApiToken(c *fiber.Ctx) error {
	type Request struct {
		Name string `json:"name"`
	}

	var body Request
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if body.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Token name is required",
		})
	}

	tokenString, err := generateRandomToken()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
		})
	}

	token := models.ApiTokens{
		UUID:  uuid.New().String(),
		Name:  body.Name,
		Token: tokenString,
	}

	if err := database.DB.Create(&token).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to save token",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(token)
}

// ListApiTokens returns all tokens
func ListApiTokens(c *fiber.Ctx) error {
	var tokens []models.ApiTokens
	if err := database.DB.Find(&tokens).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch tokens",
		})
	}
	return c.JSON(tokens)
}

// DeleteApiToken deletes a token by ID
func DeleteApiToken(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Token ID is required",
		})
	}

	if err := database.DB.Delete(&models.ApiTokens{}, "id = ?", id).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete token",
		})
	}

	return c.SendStatus(fiber.StatusNoContent)
}
