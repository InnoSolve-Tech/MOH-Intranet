package main

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	"moh-intranet.com/routes"
)

func main() {
	godotenv.Load()

	app := fiber.New(fiber.Config{
		ReadBufferSize:           16384,
		BodyLimit:                10 * 1024 * 1024,
		ReadTimeout:              30 * time.Second,
		DisableDefaultDate:       true,
		DisableHeaderNormalizing: false,
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			fmt.Printf("Error: %v, Code: %d, Path: %s\n", err, code, c.Path())
			return c.Status(code).JSON(fiber.Map{"error": err.Error()})
		},
	})

	routes.SetupRoutes(app)

	fmt.Println("Server starting on port 7088...")
	app.Listen(":7088")
}
