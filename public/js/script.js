function sendMail() {
    let params = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,  
        message: document.getElementById("message").value,
    };

    emailjs.send("service_5e5rcxu", "template_s26f3jz", params).then(alert("Request Submitted Successfully!"));

}

async function loadGamesFromApi() {
  const res = await fetch("/api/games");
  const games = await res.json();
  console.log("GAMES FROM API:", games);
  console.log("PAGE:", location.pathname);

  const candidates = [
    "#games",
    ".games",
    "#game-list",
    ".game-list",
    ".products",
    ".container",
    ".row",
    "main"
  ];

  for (const sel of candidates) {
    const el = document.querySelector(sel);
    console.log(sel, el ? "FOUND" : "not found");
  }
}

document.addEventListener("DOMContentLoaded", loadGamesFromApi);

function getAuth() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  return { token, user };
}

function isAdmin() {
  const { user } = getAuth();
  return Boolean(user && user.role === "admin");
}

async function renderGamesFromApi() {
  const container = document.getElementById("featuredGames");
  if (!container) return;

  const res = await fetch("/api/games");
  const games = await res.json();

  const admin = isAdmin();

  container.innerHTML = games.map(g => `
    <div class="col-md-4">
      <div class="card game-card bg-dark text-white position-relative" data-id="${g._id}" data-price="${g.price}">
        <img src="${g.image || ""}" class="card-img-top main-img" alt="${g.title}">
        <div class="card-body">
          <h5 class="card-title">${g.title}</h5>
          <p class="card-text">${g.description || ""}</p>
          <p class="price">${Number(g.price).toFixed(2)}$</p>
          <button class="btn btn-primary add-cart">Add to Cart</button>
          ${admin ? `<button class="btn btn-outline-danger ms-2 admin-delete">Delete</button>` : ""}
        </div>
      </div>
    </div>
  `).join("");

  attachCartHandlers();
  attachAdminDeleteHandlers();
}

function attachCartHandlers() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = document.getElementById("cartCount");

  function updateCartCount() {
    if (cartCount) cartCount.textContent = cart.length;
  }

  function addToCart(game) {
    if (!cart.find(x => x._id === game._id)) {
      cart.push(game);
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartCount();
    }
  }

  document.querySelectorAll(".add-cart").forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".game-card");
      const title = card.querySelector(".card-title")?.innerText || "";
      const img = card.querySelector(".main-img")?.src || "";
      const id = card?.dataset?.id || "";
      const price = Number(card?.dataset?.price || 0);
      addToCart({ _id: id, title, img, price });
    });
  });

  updateCartCount();
}

document.addEventListener("DOMContentLoaded", renderGamesFromApi);

function attachAdminDeleteHandlers() {
  if (!isAdmin()) return;
  const { token } = getAuth();

  document.querySelectorAll(".admin-delete").forEach(btn => {
    btn.addEventListener("click", async () => {
      const card = btn.closest(".game-card");
      const id = card?.dataset?.id;
      if (!id || !token) return;

      const res = await fetch(`/api/games/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        await renderGamesFromApi();
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const panel = document.getElementById("adminPanel");
  if (!panel) return;

  if (isAdmin()) panel.style.display = "block";

  const form = document.getElementById("adminAddGameForm");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { token } = getAuth();
    if (!token) return;

    const title = document.getElementById("adminGameTitle").value.trim();
    const price = Number(document.getElementById("adminGamePrice").value);
    const description = document.getElementById("adminGameDescription").value.trim();

    if (!title || !description || Number.isNaN(price)) return;

    const res = await fetch("/api/games", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title, price, description })
    });

    if (res.ok) {
      form.reset();
      await renderGamesFromApi();
    }
  });
});

