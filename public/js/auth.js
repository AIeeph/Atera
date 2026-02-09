const authModalTitle = document.getElementById("authModalTitle");
const authModeRegister = document.getElementById("authModeRegister");
const authModeLogin = document.getElementById("authModeLogin");
const authForm = document.getElementById("authForm");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const authSubmit = document.getElementById("authSubmit");
const authMessage = document.getElementById("authMessage");
const accountInfo = document.getElementById("accountInfo");
const accountEmail = document.getElementById("accountEmail");
const accountRole = document.getElementById("accountRole");
const authOpenBtn = document.getElementById("authOpenBtn");
const logoutBtn = document.getElementById("logoutBtn");

let authMode = "register";

function setMode(mode) {
  authMode = mode;
  authModalTitle.textContent = mode === "register" ? "Register" : "Login";
  authSubmit.textContent = mode === "register" ? "Create account" : "Sign in";
  authMessage.textContent = "";
}

function showMessage(text, isError) {
  authMessage.textContent = text;
  authMessage.classList.toggle("text-danger", Boolean(isError));
  authMessage.classList.toggle("text-success", !isError);
}

function renderAccount(user) {
  if (user && user.email) {
    accountEmail.textContent = user.email;
    accountRole.textContent = user.role || "user";
    accountInfo.style.display = "flex";
    logoutBtn.style.display = "inline-block";
    authOpenBtn.style.display = "none";
  } else {
    accountInfo.style.display = "none";
    logoutBtn.style.display = "none";
    authOpenBtn.style.display = "inline-block";
  }
}

authModeRegister.addEventListener("click", () => setMode("register"));
authModeLogin.addEventListener("click", () => setMode("login"));

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  renderAccount(null);
});

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = authEmail.value.trim();
  const password = authPassword.value;

  if (!email || !password) {
    showMessage("Email and password are required.", true);
    return;
  }

  const endpoint = authMode === "register" ? "/api/auth/register" : "/api/auth/login";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      showMessage(data.message || data.error || "Request failed.", true);
      return;
    }

    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    showMessage(authMode === "register" ? "Registered." : "Logged in.", false);
    renderAccount(data.user);
    authPassword.value = "";

    const modalEl = document.getElementById("authModal");
    const modal = window.bootstrap?.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  } catch {
    showMessage("Network error.", true);
  }
});

setMode("register");
renderAccount(JSON.parse(localStorage.getItem("user") || "null"));
