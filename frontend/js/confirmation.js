document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector(".container");
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (!token) {
    container.innerHTML =
      "<h2>Email Confirmation</h2><p style='color:red;'>Invalid or missing confirmation token.</p>";
    return;
  }

  container.innerHTML =
    "<h2>Email Confirmation</h2><p>Validating your email, please wait...</p>";

  try {
    const response = await fetch(`/api/v1/validate-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const errData = await response.json();
      container.innerHTML = `<h2>Email Confirmation</h2><p style='color:red;'>${errData.error || "Failed to confirm email."}</p>`;
      return;
    }

    container.innerHTML = `
      <h2>Email Confirmed</h2>
      <p>Thank you! Your email address has been successfully verified.</p>
      <p>You can now <a href="/" class="link">log in</a> to your account.</p>
    `;
  } catch (error) {
    container.innerHTML = `<h2>Email Confirmation</h2><p style='color:red;'>Network or server error. Please try again later.</p>`;
  }
});
