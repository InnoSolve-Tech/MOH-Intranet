package service

import (
	"encoding/json"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"gorm.io/datatypes"
	"moh-intranet.com/database"
	"moh-intranet.com/helpers"
	"moh-intranet.com/models"
)

type EmailRequest struct {
	Subject    string         `json:"subject"`
	TargetType string         `json:"target_type"`
	Targets    datatypes.JSON `json:"targets"`
	Priority   string         `json:"priority"`
	Content    string         `json:"content"`
}

func CreateEmail(c *fiber.Ctx) error {
	var req EmailRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Save email record
	email := models.Emails{
		Subject:        req.Subject,
		TargetAudience: req.TargetType,
		Targets:        req.Targets,
		Priority:       req.Priority,
		Content:        req.Content,
	}
	if err := database.DB.Create(&email).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create email"})
	}

	var partners []models.Partner

	if req.TargetType == "group" {
		// Unmarshal targets JSON into []string first
		var targetIDs []string
		if err := json.Unmarshal(req.Targets, &targetIDs); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid targets format"})
		}

		var internalGroups []models.InternalGroups

		if err := database.DB.Where("id IN ?", targetIDs).Find(&internalGroups).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to find groups"})
		}

		// Extract thematic areas from groups
		var thematicAreas []string
		for _, group := range internalGroups {
			var groupThematicAreas []string
			if err := json.Unmarshal(group.ThematicAreas, &groupThematicAreas); err == nil {
				thematicAreas = append(thematicAreas, groupThematicAreas...)
			}
		}

		// Extract districts from groups
		var districts []string
		for _, group := range internalGroups {
			var groupDistricts []string
			if err := json.Unmarshal(group.Districts, &groupDistricts); err == nil {
				districts = append(districts, groupDistricts...)
			}
		}

		var err error
		partners, err = models.FindPartnersByThematicAndDistricts(database.DB, thematicAreas, districts)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to find partners"})
		}
	} else {
		// Unmarshal targets JSON into []string
		var targets []string
		if err := json.Unmarshal(req.Targets, &targets); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid targets format"})
		}

		// Find partners by thematic areas or districts
		var err error
		partners, err = models.FindPartnersByThematicAndDistricts(database.DB, targets, targets)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to find partners"})
		}
	}

	// Create unique email set
	emailSet := make(map[string]struct{})
	for _, p := range partners {
		if p.OfficialEmail != "" {
			emailSet[p.OfficialEmail] = struct{}{}
		}
	}

	var recipients []string
	for e := range emailSet {
		recipients = append(recipients, e)
	}

	if len(recipients) == 0 {
		return c.JSON(fiber.Map{
			"message":       "Email created but no partners matched to send",
			"email_record":  email,
			"sent_to_count": 0,
		})
	}

	// Send to each recipient individually via goroutine (to avoid large mails, comply with function usage)
	for _, recipient := range recipients {
		go func(to string) {
			if err := helpers.SendEmail(to, req.Subject, req.Content); err != nil {
				// Log error, but don't block
				fmt.Printf("Failed to send email to %s: %v\n", to, err)
			}
		}(recipient)
	}

	return c.JSON(fiber.Map{
		"message":       fmt.Sprintf("Email created and sending to %d partners", len(recipients)),
		"email_record":  email,
		"sent_to_count": len(recipients),
	})
}

func GetEmails(c *fiber.Ctx) error {
	var emails []models.Emails
	if err := database.DB.Find(&emails).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch emails"})
	}
	return c.JSON(emails)
}

func GetEmail(c *fiber.Ctx) error {
	id := c.Params("id")
	var email models.Emails
	if err := database.DB.First(&email, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Email not found"})
	}
	return c.JSON(email)
}

func UpdateEmail(c *fiber.Ctx) error {
	id := c.Params("id")
	var email models.Emails
	if err := database.DB.First(&email, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Email not found"})
	}

	var req EmailRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	email.Subject = req.Subject
	email.TargetAudience = req.TargetType
	email.Targets = req.Targets
	email.Priority = req.Priority
	email.Content = req.Content

	if err := database.DB.Save(&email).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update email"})
	}

	return c.JSON(fiber.Map{"message": "Email updated successfully", "data": email})
}

func DeleteEmail(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := database.DB.Delete(&models.Emails{}, id).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete email"})
	}
	return c.JSON(fiber.Map{"message": "Email deleted successfully"})
}
