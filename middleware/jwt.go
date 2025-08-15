package middleware

import (
	"crypto/rand"
	"os"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
)

// AuthConfig holds configuration for authentication middleware
type AuthConfig struct {
	JWTSecret       string
	CookieName      string
	SessionDuration time.Duration
}

// DefaultAuthConfig returns default configuration
func DefaultAuthConfig() AuthConfig {
	return AuthConfig{
		JWTSecret:       getEnv("JWT_SECRET_KEY", "jwt123"),
		CookieName:      "session_token",
		SessionDuration: 7 * 24 * time.Hour, // 7 days
	}
}

// UserClaims represents JWT claims structure
type UserClaims struct {
	UserID      string `json:"user_id"`
	UserName    string `json:"user_name"`
	Role        string `json:"role"`
	PartnerUUID string `json:"partner_uuid"`
	jwt.RegisteredClaims
}

// AuthMiddleware protects /menus/* pages only
func AuthMiddleware(config ...AuthConfig) fiber.Handler {
	cfg := DefaultAuthConfig()
	if len(config) > 0 {
		cfg = config[0]
	}

	return func(c *fiber.Ctx) error {
		requestPath := c.Path()

		// Skip middleware for API routes and assets
		if strings.HasPrefix(requestPath, "/api/") ||
			strings.HasPrefix(requestPath, "/assets/") ||
			strings.HasPrefix(requestPath, "/css/") ||
			strings.HasPrefix(requestPath, "/js/") ||
			strings.HasPrefix(requestPath, "/images/") ||
			strings.Contains(requestPath, ".css") ||
			strings.Contains(requestPath, ".js") ||
			strings.Contains(requestPath, ".png") ||
			strings.Contains(requestPath, ".jpg") ||
			strings.Contains(requestPath, ".ico") {
			return c.Next()
		}

		// Only protect /menu/* pages (note: singular "menu" not "menus")
		if !strings.HasPrefix(requestPath, "/menu/") {
			return c.Next()
		}

		// Verify session token for /menus/* pages
		token := c.Cookies(cfg.CookieName)
		if token == "" {
			return c.Redirect("/")
		}

		// Validate JWT token
		claims, err := validateToken(token, cfg.JWTSecret)
		if err != nil {
			// Clear invalid cookie
			c.Cookie(&fiber.Cookie{
				Name:     cfg.CookieName,
				Value:    "",
				Expires:  time.Now().Add(-time.Hour),
				HTTPOnly: true,
			})
			return c.Redirect("/")
		}

		// Store user info in context for use in templates
		c.Locals("user", claims)
		c.Locals("authenticated", true)

		return c.Next()
	}
}

// SessionHelper creates session management helper middleware
func SessionHelper(config ...AuthConfig) fiber.Handler {
	cfg := DefaultAuthConfig()
	if len(config) > 0 {
		cfg = config[0]
	}

	return func(c *fiber.Ctx) error {
		// Add session helper functions to context
		c.Locals("hasValidSession", func() bool {
			token := c.Cookies(cfg.CookieName)
			if token == "" {
				return false
			}
			_, err := validateToken(token, cfg.JWTSecret)
			return err == nil
		})

		c.Locals("getUserRole", func() string {
			token := c.Cookies(cfg.CookieName)
			if token == "" {
				return "guest"
			}
			claims, err := validateToken(token, cfg.JWTSecret)
			if err != nil {
				return "guest"
			}
			return claims.Role
		})

		c.Locals("getUserName", func() string {
			token := c.Cookies(cfg.CookieName)
			if token == "" {
				return ""
			}
			claims, err := validateToken(token, cfg.JWTSecret)
			if err != nil {
				return ""
			}
			return claims.UserName
		})

		return c.Next()
	}
}

// CreateSession creates a new session and sets the cookie
func CreateSession(c *fiber.Ctx, name, email, partner_uuid string, role string) (string, error) {
	cfg := DefaultAuthConfig()
	// Generate a secure session token
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	// Create JWT claims
	claims := UserClaims{
		UserID:      email, // or generate a proper user ID
		UserName:    name,
		Role:        role,
		PartnerUUID: partner_uuid,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(cfg.SessionDuration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	// Create JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(cfg.JWTSecret))
	if err != nil {
		return "", err
	}

	// Set multiple cookies for frontend access
	// Session token
	c.Cookie(&fiber.Cookie{
		Name:     cfg.CookieName,
		Value:    tokenString,
		Path:     "/",
		Domain:   "",               // Leave empty for same-origin
		MaxAge:   7 * 24 * 60 * 60, // 7 days in seconds
		Secure:   false,            // Set to true in production with HTTPS
		HTTPOnly: false,            // Allow JavaScript access
		SameSite: "Lax",            // Less restrictive than "Strict"
	})

	// User role
	c.Cookie(&fiber.Cookie{
		Name:     "user_role",
		Value:    role,
		Path:     "/",
		Domain:   "",
		MaxAge:   7 * 24 * 60 * 60,
		Secure:   false,
		HTTPOnly: false,
		SameSite: "Lax",
	})

	// Partner UUID
	c.Cookie(&fiber.Cookie{
		Name:     "partner_uuid",
		Value:    partner_uuid,
		Path:     "/",
		Domain:   "",
		MaxAge:   7 * 24 * 60 * 60,
		Secure:   false,
		HTTPOnly: false,
		SameSite: "Lax",
	})

	// User name
	c.Cookie(&fiber.Cookie{
		Name:     "user_name",
		Value:    name,
		Path:     "/",
		Domain:   "",
		MaxAge:   7 * 24 * 60 * 60,
		Secure:   false,
		HTTPOnly: false,
		SameSite: "Lax",
	})

	// User email
	c.Cookie(&fiber.Cookie{
		Name:     "user_email",
		Value:    email,
		Path:     "/",
		Domain:   "",
		MaxAge:   7 * 24 * 60 * 60,
		Secure:   false,
		HTTPOnly: false,
		SameSite: "Lax",
	})

	return tokenString, nil
}

// ClearSession removes all session cookies
func ClearSession(c *fiber.Ctx) {
	cookies := []string{"session_token", "user_role", "user_name", "user_email", "partner_uuid"}

	for _, cookieName := range cookies {
		c.Cookie(&fiber.Cookie{
			Name:     cookieName,
			Value:    "",
			Path:     "/",
			Domain:   "",
			MaxAge:   -1, // Expire immediately
			Secure:   false,
			HTTPOnly: false,
			SameSite: "Lax",
		})
	}
}

// validateToken validates JWT token and returns claims
func validateToken(tokenString, secret string) (*UserClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &UserClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*UserClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, jwt.ErrSignatureInvalid
}

// RequireAuth middleware for API routes that need authentication
func RequireAuth(config ...AuthConfig) fiber.Handler {
	cfg := DefaultAuthConfig()
	if len(config) > 0 {
		cfg = config[0]
	}

	return func(c *fiber.Ctx) error {
		token := c.Cookies(cfg.CookieName)
		if token == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Authentication required",
			})
		}

		claims, err := validateToken(token, cfg.JWTSecret)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid or expired token",
			})
		}

		// Store user info in context
		c.Locals("user", claims)
		c.Locals("userID", claims.UserID)
		c.Locals("userRole", claims.Role)

		return c.Next()
	}
}

// RequireAdmin middleware for admin-only routes
func RequireAdmin(config ...AuthConfig) fiber.Handler {
	cfg := DefaultAuthConfig()
	if len(config) > 0 {
		cfg = config[0]
	}

	return func(c *fiber.Ctx) error {
		token := c.Cookies(cfg.CookieName)
		if token == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Authentication required",
			})
		}

		claims, err := validateToken(token, cfg.JWTSecret)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid or expired token",
			})
		}

		if claims.Role != "admin" && claims.Role != "super_admin" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Admin privileges required",
			})
		}

		// Store user info in context
		c.Locals("user", claims)
		c.Locals("userID", claims.UserID)
		c.Locals("userRole", claims.Role)

		return c.Next()
	}
}

// SecurityHeaders adds security headers
func SecurityHeaders() fiber.Handler {
	return func(c *fiber.Ctx) error {
		c.Set("X-Content-Type-Options", "nosniff")
		c.Set("X-Frame-Options", "DENY")
		c.Set("X-XSS-Protection", "1; mode=block")
		c.Set("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; img-src 'self' data:; font-src 'self' https://cdnjs.cloudflare.com")

		return c.Next()
	}
}

// RequestLogger logs incoming requests
func RequestLogger() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Process request
		err := c.Next()

		status := c.Response().StatusCode()

		// You can customize this logging based on your needs
		if status >= 400 {
			// Log errors
		}

		return err
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
