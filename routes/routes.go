package routes

import (
	"github.com/gofiber/fiber/v2"
	"moh-intranet.com/service"
)

func SetupRoutes(app *fiber.App) {

	app.Static("/", "./frontend")

	partners := app.Group("/partners")
	{
		partners.Post("/partners", service.CreatePartner)         // Create partner with file upload
		partners.Get("/partners/:uuid", service.GetPartner)       // Get partner by UUID
		partners.Put("/partners/:uuid", service.UpdatePartner)    // Update partner by UUID
		partners.Delete("/partners/:uuid", service.DeletePartner) // Delete partner by UUID
	}
}
