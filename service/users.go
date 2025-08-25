package service

import (
	"errors"
	"fmt"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"moh-intranet.com/database"
	"moh-intranet.com/helpers"
	"moh-intranet.com/middleware"
	"moh-intranet.com/models"
)

// RegisterUser creates a new user with a default role of partner, or admin if ContactID is provided.
func RegisterUser(c *fiber.Ctx) error {
	var req struct {
		Username  string `json:"username"`
		Password  string `json:"password"`
		Email     string `json:"email"`
		ContactID string `json:"contact_id,omitempty"`
	}

	// Parse request body
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Validate required fields
	if strings.TrimSpace(req.Username) == "" || strings.TrimSpace(req.Password) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Username and password are required"})
	}

	// Determine role: admin if ContactID provided, otherwise partner
	roleName := "partner"
	if req.ContactID != "" {
		roleName = "admin"
	}

	var role models.Roles
	if err := database.DB.Where("role_name = ?", roleName).First(&role).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": fmt.Sprintf("%s role not found", roleName)})
	}

	// If ContactID is provided, validate the contact exists and link to user
	var contact models.PartnerContacts
	if req.ContactID != "" {
		if err := database.DB.Where("id = ?", req.ContactID).First(&contact).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Contact not found"})
		}
		contact.UserID = &contact.ID
		if err := database.DB.Save(&contact).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to link contact to user"})
		}
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to hash password"})
	}

	// Create user record
	user := models.Users{
		UUID:     uuid.New().String(),
		Username: req.Username,
		Password: string(hashedPassword),
		RoleID:   role.ID,
		Scope:    "individual",
	}

	// Save user to database
	if err := database.DB.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to register user"})
	}

	middleware.CreateSession(c, req.Username, user.UUID, role.RoleName)

	return c.JSON(fiber.Map{
		"message": "User registered successfully",
		"uuid":    user.UUID,
	})
}

func RegisterUserUsernameAndPassword(c *fiber.Ctx, Username string, Password string, Email string) (models.Users, error) {

	// Determine role: admin if ContactID provided, otherwise partner
	roleName := "partner"

	var role models.Roles
	if err := database.DB.Where("role_name = ?", roleName).First(&role).Error; err != nil {
		return models.Users{}, err
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(Password), bcrypt.DefaultCost)
	if err != nil {
		return models.Users{}, err
	}

	// Create user record
	user := models.Users{
		UUID:     uuid.New().String(),
		Username: Username,
		Password: string(hashedPassword),
		RoleID:   role.ID,
		Scope:    "individual",
	}

	// Save user to database
	if err := database.DB.Create(&user).Error; err != nil {
		return models.Users{}, err
	}

	return user, nil
}

// Sign in
func SignIn(c *fiber.Ctx) error {
	var req struct {
		UserID   string `json:"userid"`
		Password string `json:"password"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	var user models.Users
	err := database.DB.
		Preload("Role").
		Where("users.username = ?", req.UserID).
		First(&user).Error
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid username or password"})
	}

	if bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)) != nil {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid username or password"})
	}

	middleware.CreateSession(c,
		user.Username,
		user.UUID,
		user.Role.RoleName,
	)

	return c.JSON(fiber.Map{
		"message": "Signed in successfully",
	})
}

// Change scope
func ChangeScope(c *fiber.Ctx) error {
	var req struct {
		UserUUID string `json:"user_uuid"`
		Scope    string `json:"scope"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	allowedScopes := map[string]bool{"global": true, "district": true, "individual": true}
	if !allowedScopes[req.Scope] {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid scope"})
	}

	var user models.Users
	if err := database.DB.Where("uuid = ?", req.UserUUID).First(&user).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	// Update scope in the Role
	if err := database.DB.Model(&models.Users{}).Where("id = ?", user.ID).Update("scope", req.Scope).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update scope"})
	}

	return c.JSON(fiber.Map{"message": "Scope updated successfully"})
}

// Reset password (user logged in)
func ResetPassword(c *fiber.Ctx) error {
	var req struct {
		UserUUID    string `json:"user_uuid"`
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	var user models.Users
	if err := database.DB.Where("uuid = ?", req.UserUUID).First(&user).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	if bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.OldPassword)) != nil {
		return c.Status(401).JSON(fiber.Map{"error": "Old password is incorrect"})
	}

	hashed, _ := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err := database.DB.Model(&user).Update("password", string(hashed)).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update password"})
	}

	return c.JSON(fiber.Map{"message": "Password updated successfully"})
}

// Forgot password - send email with link
func ForgotPassword(c *fiber.Ctx) error {
	var req struct {
		Email string `json:"email"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	req.Email = strings.TrimSpace(req.Email)
	if req.Email == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Email is required"})
	}

	var user models.Users
	if err := database.DB.Where("username = ?", req.Email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.JSON(fiber.Map{"message": "If email exists, reset link will be sent"})
		}
		return c.Status(500).JSON(fiber.Map{"error": "Server error"})
	}

	token := helpers.GenerateSecureToken(32)
	pt := models.PasswordToken{
		Token:     token,
		Email:     user.Username,
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}
	if err := database.DB.Create(&pt).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create reset token"})
	}

	defaultDomain := "http://localhost:7088"
	domain := getEnv("DOMAIN", &defaultDomain)

	resetLink := fmt.Sprintf("%s/reset-password.html?token=%s", domain, url.QueryEscape(token))
	body := fmt.Sprintf("Click here to reset your password: %s", resetLink)

	go helpers.SendEmail(user.Username, "Password Reset", body)

	return c.JSON(fiber.Map{"message": "Reset link sent"})
}

// Set password from token
func SetPassword(c *fiber.Ctx) error {
	var req struct {
		Token    string `json:"token"`
		Password string `json:"password"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	var t models.PasswordToken
	if err := database.DB.Where("token = ?", req.Token).First(&t).Error; err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid or expired token"})
	}

	if time.Now().After(t.ExpiresAt) {
		return c.Status(400).JSON(fiber.Map{"error": "Token expired"})
	}

	hashed, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	database.DB.Model(&models.Users{}).Where("username = ?", t.Email).Update("password", string(hashed))
	database.DB.Delete(&t)

	return c.JSON(fiber.Map{"message": "Password updated successfully"})
}

func GetUsers(c *fiber.Ctx) error {
	var users []models.Users

	// Preload related data so the frontend has all it needs
	if err := database.DB.
		Preload("Role").
		Find(&users).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch users",
		})
	}

	return c.JSON(users)
}

func GetUserByUUID(c *fiber.Ctx) error {
	userUUID := c.Params("uuid")
	if userUUID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "User UUID is required",
		})
	}

	var user models.Users
	var contact models.PartnerContacts

	// Fetch user and preload role
	if err := database.DB.
		Preload("Role").
		Where("uuid = ?", userUUID).
		First(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to fetch user",
			"details": err.Error(),
		})
	}

	// Fetch user contact and preload partner relations
	if user.Role.RoleName != "admin" {
		if err := database.DB.
			Where("user_id = ?", user.ID).
			Preload("Partner").
			Preload("Partner.PartnerSupportYears").
			Preload("Partner.PartnerContacts").
			First(&contact).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   "Failed to fetch contact",
				"details": err.Error(),
			})
		}
	}

	// Return combined response
	return c.JSON(fiber.Map{
		"user":    user,
		"partner": contact.Partner,
	})
}

func getEnv(key string, fallback *string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	if fallback != nil {
		return *fallback
	}
	return ""
}
