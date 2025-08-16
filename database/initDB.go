package database

import (
	"encoding/json"
	"log"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"moh-intranet.com/models"
)

func ptr(s string) *string {
	return &s
}

func InitDB() {
	// Define functions for roles
	adminFunctions, _ := json.Marshal([]string{"settings", "partners", "users"})
	partnerFunctions, _ := json.Marshal([]string{"partners"})

	// Create roles
	adminRole := models.Roles{
		RoleName: "admin",
		Function: adminFunctions,
		View:     true,
		Create:   true,
		Edit:     true,
		Remove:   true,
	}

	partnerRole := models.Roles{
		RoleName: "partner",
		Function: partnerFunctions,
		View:     true,
		Create:   false,
		Edit:     false,
		Remove:   false,
	}

	if err := DB.FirstOrCreate(&adminRole, models.Roles{RoleName: "admin"}).Error; err != nil {
		log.Fatalf("Failed to create admin role: %v", err)
	}

	if err := DB.FirstOrCreate(&partnerRole, models.Roles{RoleName: "partner"}).Error; err != nil {
		log.Fatalf("Failed to create partner role: %v", err)
	}

	adminUsername := getEnv("ADMIN_USERNAME", ptr("admin"))
	adminPassword := getEnv("ADMIN_PASSWORD", ptr("admin@123"))

	// Create default admin user
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(adminPassword), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash admin password: %v", err)
	}

	adminUser := models.Users{
		UUID:     uuid.New().String(),
		Username: adminUsername,
		Password: string(passwordHash),
		RoleID:   adminRole.ID,
		Scope:    "global",
	}

	if err := DB.FirstOrCreate(&adminUser, models.Users{Username: "admin"}).Error; err != nil {
		log.Fatalf("Failed to create admin user: %v", err)
	}

	log.Println("Database initialized with roles and admin user.")
}
