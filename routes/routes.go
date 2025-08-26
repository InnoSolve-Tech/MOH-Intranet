package routes

import (
	"github.com/gofiber/fiber/v2"
	"moh-intranet.com/middleware"
	"moh-intranet.com/service"
)

func SetupRoutes(app *fiber.App) {
	// Apply auth middleware to protect /menus/* pages
	app.Use(middleware.AuthMiddleware())

	// Serve static files
	app.Static("/", "./frontend")

	api := app.Group("/api/v1")

	// Login Free endpoint
	api.Post("/signin", service.SignIn)
	api.Get("/thematic-areas", service.GetThematicAreas)
	api.Get("/partner-categories", service.GetPartnerCategory)
	api.Post("/partners", service.CreatePartner) // Create partner with file upload
	app.Get("/uploads/:category/:filename", service.ServeUploadedFile)

	// Protected API routes
	api.Use(middleware.RequireAuth())

	users := api.Group("/users")
	{
		users.Post("/register", service.RegisterUser)
		users.Get("", service.GetUsers)
		users.Get("/:uuid", service.GetUserByUUID)
		users.Put("/change-scope", service.ChangeScope)
		users.Put("/reset-password", service.ResetPassword)
		users.Post("/forgot-password", service.ForgotPassword)
		users.Post("/set-password", service.SetPassword)
	}

	partners := api.Group("/partners")
	{
		partners.Post("", service.CreatePartner) // Create partner with file upload
		partners.Get("", service.GetPartners)
		partners.Put("/contact/:id", service.UpdateContact)
		partners.Get("/:uuid", service.GetPartnerByID)   // Get partner by UUID
		partners.Put("/:uuid", service.UpdatePartner)    // Update partner by UUID
		partners.Delete("/:uuid", service.DeletePartner) // Delete partner by UUID
	}

	thematicAreas := api.Group("/thematic-areas")
	{
		thematicAreas.Post("", service.CreateThematicArea)
		thematicAreas.Post("/bulk", service.CreateThematicAreasBulk)
		thematicAreas.Delete("", service.DeleteThematicArea)
	}

	partnerCategories := api.Group("/partner-categories")
	{
		partnerCategories.Post("", service.CreatePartnerCategory)
		partnerCategories.Post("/bulk", service.CreatePartnerCategoriesBulk)
		partnerCategories.Delete("", service.DeletePartnerCategory)
	}
}
