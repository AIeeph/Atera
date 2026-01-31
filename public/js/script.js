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

async function renderGamesFromApi() {
  const container = document.getElementById("featuredGames");
  if (!container) return;

  const res = await fetch("/api/games");
  const games = await res.json();

  container.innerHTML = games.map(g => `
    <div class="col-md-4">
      <div class="card game-card bg-dark text-white position-relative">
        <img src="${g.image || ""}" class="card-img-top main-img" alt="${g.title}">
        <div class="card-body">
          <h5 class="card-title">${g.title}</h5>
          <p class="card-text">${g.description || ""}</p>
          <p class="price">${Number(g.price).toFixed(2)}$</p>
          <button class="btn btn-primary add-cart">Add to Cart</button>
        </div>
      </div>
    </div>
  `).join("");

  attachCartHandlers();
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
      addToCart({ _id: title, title, img });
    });
  });

  updateCartCount();
}

document.addEventListener("DOMContentLoaded", renderGamesFromApi);

