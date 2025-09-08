package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/swagger"
	_ "moh-intranet.com/docs"
	"moh-intranet.com/middleware"
	"moh-intranet.com/service"
)

func SetupRoutes(app *fiber.App) {
	// Apply auth middleware to protect /menus/* pages
	app.Use(middleware.AuthMiddleware())

	// Serve static files
	app.Static("/", "./frontend")

	app.Get("/swagger/*", swagger.HandlerDefault)

	api := app.Group("/api/v1")

	// Login Free endpoint
	api.Post("/signin", service.SignIn)
	api.Get("/thematic-areas", service.GetThematicAreas)
	api.Get("/partner-categories", service.GetPartnerCategory)
	api.Post("/partners", service.CreatePartner) // Create partner with file upload
	app.Get("/uploads/:category/:filename", service.ServeUploadedFile)
	api.Put("/reset-password", service.SetPassword)
	api.Post("/forgot-password", service.ForgotPassword)
	api.Post("/validate-token", service.ValidateToken)

	users := api.Group("/users")
	{
		users.Post("/register", service.RegisterUser)
		users.Get("", service.GetUsers)
		users.Get("/:uuid", service.GetUserByUUID)
		users.Put("/change-password", service.ResetPassword)
		users.Put("/change-scope", service.ChangeScope)
		users.Put("/change-status/:uuid", service.ActivateOrDeactivateUser)
		users.Post("/set-password", service.SetPassword)
	}

	partners := api.Group("/partners")
	{
		partners.Post("", service.CreatePartner) // Create partner with file upload
		partners.Get("", service.GetPartners)
		partners.Get("/support-documents", service.GetSupportDocuments)
		partners.Put("/contact/:id", service.UpdateContact)
		partners.Get("/:uuid", service.GetPartnerByID)   // Get partner by UUID
		partners.Put("/:uuid", service.UpdatePartner)    // Update partner by UUID
		partners.Delete("/:uuid", service.DeletePartner) // Delete partner by UUID

	}

	thematicAreas := api.Group("/thematic-areas")
	{
		thematicAreas.Post("", service.CreateThematicArea)
		thematicAreas.Post("/bulk", service.CreateThematicAreasBulk)
		thematicAreas.Delete("/:id", service.DeleteThematicArea)
	}

	partnerCategories := api.Group("/partner-categories")
	{
		partnerCategories.Post("", service.CreatePartnerCategory)
		partnerCategories.Post("/bulk", service.CreatePartnerCategoriesBulk)
		partnerCategories.Delete("/:id", service.DeletePartnerCategory)
	}

	internalGroups := api.Group("/internal-groups")
	{
		internalGroups.Post("", service.CreateInternalGroup)
		internalGroups.Get("", service.GetInternalGroups)
		internalGroups.Get("/:uuid", service.GetInternalGroup)
		internalGroups.Put("/:uuid", service.UpdateInternalGroup)
		internalGroups.Delete("/:uuid", service.DeleteInternalGroup)
	}

	emails := api.Group("/emails")
	{
		emails.Post("", service.CreateEmail)
		emails.Get("", service.GetEmails)
		emails.Get("/:id", service.GetEmail)
		emails.Put("/:id", service.UpdateEmail)
		emails.Delete("/:id", service.DeleteEmail)
	}

	partnerContacts := api.Group("/contacts")
	{
		partnerContacts.Post("", service.CreateContact)
		partnerContacts.Put("", service.UpdateContact)
	}

	api_token := api.Group("/tokens")
	{
		api_token.Post("", service.CreateApiToken)
		api_token.Get("", service.ListApiTokens)
		api_token.Delete("/:id", service.DeleteApiToken)
	}
}
