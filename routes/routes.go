package routes

import (
	"github.com/gofiber/fiber/v2"
	"moh-intranet.com/service"
)

func SetupRoutes(app *fiber.App) {

	app.Static("/", "./frontend")

	partners := app.Group("/partners")
	{
		partners.Post("", service.CreatePartner) // Create partner with file upload
		partners.Get("", service.GetPartners)
		partners.Get("/:uuid", service.GetPartnerByID)   // Get partner by UUID
		partners.Put("/:uuid", service.UpdatePartner)    // Update partner by UUID
		partners.Delete("/:uuid", service.DeletePartner) // Delete partner by UUID
	}
}
