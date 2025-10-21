const DOMAIN = "";

document.addEventListener("DOMContentLoaded", async () => {
  console.log("temp.js loaded");

  try {
    const res = await fetch(`${DOMAIN}/authservice/check`, {
      method: "GET",
      credentials: "include"
    });
    console.log("Auth check response:", res);

    if (res.ok) {
      console.log("Redirecting to main.html");
      window.location.href = "/main";
    } else {
      console.log("Not authenticated, redirecting to signin.html");
      window.location.href = "/signin";
    }
  } catch (err) {
    console.error("Error checking auth:", err);
    document.body.innerHTML = `<p style="color:red;">Error connecting to backend: ${err.message}</p>`;
  }
});
