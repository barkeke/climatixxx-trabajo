/* =========================================================
   ClimatiXXX · lógica de la web
   - Título que se escribe y se borra
   - Carousel infinito
   - Productos y carrito (con descuento NUEVA20)
   ========================================================= */
(() => {
  "use strict";

  /* ---------- Datos ---------- */
  const PRODUCTS = [
    { id: "aura",    name: "Aura",           desc: "Vibrador de silicona suave con 10 modos y carga USB.",         price: 39.90, img: "img/p1.svg" },
    { id: "lunar",   name: "Lunar",          desc: "Anillo flexible y resistente al agua para compartir.",         price: 24.90, img: "img/p2.svg" },
    { id: "perla",   name: "Perla",          desc: "Esfera compacta y silenciosa, perfecta para viajar.",          price: 29.90, img: "img/p3.svg" },
    { id: "seda",    name: "Gel Seda 100 ml", desc: "Lubricante a base de agua, sin perfume y apto para silicona.", price: 14.90, img: "img/p4.svg" },
    { id: "eclipse", name: "Dúo Eclipse",    desc: "Set de dos juguetes en tonos lavanda y rosa con neceser.",     price: 54.90, img: "img/p5.svg" },
    { id: "ola",     name: "Ola",            desc: "Diseño ondulado y flexible que se adapta a ti.",               price: 34.90, img: "img/p6.svg" },
  ];

  const DISCOUNT_RATE = 0.2;
  const STORE_CART = "climatixxx_cart";
  const STORE_DISC = "climatixxx_discount";

  const $ = (sel, root = document) => root.querySelector(sel);
  const money = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

  /* ---------- Almacenamiento seguro ---------- */
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, val) { try { localStorage.setItem(key, val); } catch { /* sin almacenamiento */ } },
    del(key) { try { localStorage.removeItem(key); } catch { /* sin almacenamiento */ } },
  };

  /* =========================================================
     1. Título que se escribe y se borra
        C, CL, CLI ... CLIMATIX ... CLI, CL, C
     ========================================================= */
  function initTypingTitle() {
    const target = $("#typed");
    const WORD = "CLIMATIX";
    const frames = [];

    for (let i = 1; i <= WORD.length; i++) frames.push(WORD.slice(0, i));          // C ... CLIMATIX
    for (let i = WORD.length - 1; i >= 1; i--) frames.push(WORD.slice(0, i));      // CLIMATI ... C

    let index = 0;

    function tick() {
      const text = frames[index];
      target.textContent = text;
      document.title = text;

      const isFull = text === WORD && index === WORD.length - 1;
      const isLast = index === frames.length - 1;
      const writing = index < WORD.length - 1;

      index = (index + 1) % frames.length;

      let delay = writing ? 200 : 130;
      if (isFull) delay = 1400;     // pausa con la palabra completa
      if (isLast) delay = 600;      // pausa antes de volver a empezar
      setTimeout(tick, delay);
    }
    tick();
  }

  /* =========================================================
     2. Carousel infinito (duplica las imágenes para el bucle)
     ========================================================= */
  function initCarousel() {
    const track = $("#carousel-track");
    [...track.children].forEach((img) => {
      const clone = img.cloneNode(true);
      clone.alt = "";
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });
  }

  /* =========================================================
     3. Navegación: cierra el menú móvil y marca la sección activa
     ========================================================= */
  function initNav() {
    const toggle = $("#menu-toggle");
    const links = document.querySelectorAll(".nav__link");

    links.forEach((a) => a.addEventListener("click", () => { toggle.checked = false; }));

    const map = new Map();
    links.forEach((a) => {
      const sec = document.getElementById(a.getAttribute("href").slice(1));
      if (sec) map.set(sec, a);
    });

    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          links.forEach((l) => l.classList.remove("is-active"));
          map.get(e.target)?.classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    map.forEach((_, sec) => io.observe(sec));
  }

  /* =========================================================
     4. Productos y carrito
     ========================================================= */
  const state = {
    cart: {},          // { idProducto: cantidad }
    discount: false,
  };

  function loadState() {
    try {
      const saved = JSON.parse(store.get(STORE_CART) || "{}");
      Object.keys(saved).forEach((id) => {
        const qty = Number(saved[id]);
        if (PRODUCTS.some((p) => p.id === id) && Number.isInteger(qty) && qty > 0) state.cart[id] = Math.min(qty, 99);
      });
    } catch { state.cart = {}; }
    state.discount = store.get(STORE_DISC) === "1";
  }

  function saveState() {
    store.set(STORE_CART, JSON.stringify(state.cart));
    store.set(STORE_DISC, state.discount ? "1" : "0");
  }

  const findProduct = (id) => PRODUCTS.find((p) => p.id === id);

  function totals() {
    const subtotal = Object.entries(state.cart).reduce((sum, [id, qty]) => sum + findProduct(id).price * qty, 0);
    const discount = state.discount ? subtotal * DISCOUNT_RATE : 0;
    return { subtotal, discount, total: subtotal - discount };
  }

  /* ---- Toast ---- */
  let toastTimer;
  function toast(message) {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2400);
  }

  /* ---- Render de productos ---- */
  function renderProducts() {
    const grid = $("#products-grid");
    grid.textContent = "";

    PRODUCTS.forEach((p) => {
      const card = document.createElement("article");
      card.className = "card";

      const img = document.createElement("img");
      img.className = "card__img";
      img.src = p.img;
      img.alt = `Ilustración del producto ${p.name}`;
      img.loading = "lazy";

      const body = document.createElement("div");
      body.className = "card__body";

      const name = document.createElement("h3");
      name.className = "card__name";
      name.textContent = p.name;

      const desc = document.createElement("p");
      desc.className = "card__desc";
      desc.textContent = p.desc;

      const foot = document.createElement("div");
      foot.className = "card__foot";

      const price = document.createElement("span");
      price.className = "card__price";
      price.textContent = money.format(p.price);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn--primary";
      btn.textContent = "Añadir";
      btn.addEventListener("click", () => addToCart(p.id));

      foot.append(price, btn);
      body.append(name, desc, foot);
      card.append(img, body);
      grid.appendChild(card);
    });
  }

  /* ---- Render del carrito ---- */
  function renderCart() {
    const list = $("#cart-list");
    const ids = Object.keys(state.cart);
    list.textContent = "";

    ids.forEach((id) => {
      const p = findProduct(id);
      const qty = state.cart[id];

      const li = document.createElement("li");
      li.className = "cart-item";

      const img = document.createElement("img");
      img.src = p.img;
      img.alt = "";

      const info = document.createElement("div");
      const name = document.createElement("div");
      name.className = "cart-item__name";
      name.textContent = p.name;
      const price = document.createElement("div");
      price.className = "cart-item__price";
      price.textContent = money.format(p.price * qty);

      const qtyBox = document.createElement("div");
      qtyBox.className = "qty";
      const minus = document.createElement("button");
      minus.type = "button";
      minus.textContent = "−";
      minus.setAttribute("aria-label", `Quitar una unidad de ${p.name}`);
      minus.addEventListener("click", () => changeQty(id, -1));
      const num = document.createElement("span");
      num.textContent = String(qty);
      const plus = document.createElement("button");
      plus.type = "button";
      plus.textContent = "+";
      plus.setAttribute("aria-label", `Añadir una unidad de ${p.name}`);
      plus.addEventListener("click", () => changeQty(id, 1));
      qtyBox.append(minus, num, plus);

      info.append(name, price, qtyBox);

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "cart-item__remove";
      remove.innerHTML = "&times;";
      remove.setAttribute("aria-label", `Eliminar ${p.name} del carrito`);
      remove.addEventListener("click", () => removeFromCart(id));

      li.append(img, info, remove);
      list.appendChild(li);
    });

    const empty = ids.length === 0;
    $("#cart-empty").hidden = !empty;
    $("#cart-list").hidden = empty;
    $("#cart-summary").hidden = empty;

    const t = totals();
    $("#sum-subtotal").textContent = money.format(t.subtotal);
    $("#row-discount").hidden = !state.discount;
    $("#sum-discount").textContent = "−" + money.format(t.discount);
    $("#sum-total").textContent = money.format(t.total);

    const count = ids.reduce((n, id) => n + state.cart[id], 0);
    $("#cart-count").textContent = String(count);

    renderOffer();
  }

  /* ---- Acciones del carrito ---- */
  function bumpCartIcon() {
    const btn = $("#cart-open");
    btn.classList.remove("bump");
    void btn.offsetWidth;          // reinicia la animación
    btn.classList.add("bump");
  }

  function addToCart(id) {
    state.cart[id] = Math.min((state.cart[id] || 0) + 1, 99);
    saveState();
    renderCart();
    bumpCartIcon();
    toast(`${findProduct(id).name} añadido al carrito`);
  }

  function changeQty(id, delta) {
    const next = (state.cart[id] || 0) + delta;
    if (next <= 0) delete state.cart[id];
    else state.cart[id] = Math.min(next, 99);
    saveState();
    renderCart();
  }

  function removeFromCart(id) {
    delete state.cart[id];
    saveState();
    renderCart();
  }

  function clearCart() {
    state.cart = {};
    saveState();
    renderCart();
  }

  /* ---- Abrir / cerrar el panel ---- */
  function openCart() {
    $("#cart").classList.add("open");
    $("#cart").setAttribute("aria-hidden", "false");
    $("#overlay").hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeCart() {
    $("#cart").classList.remove("open");
    $("#cart").setAttribute("aria-hidden", "true");
    $("#overlay").hidden = true;
    document.body.style.overflow = "";
  }

  /* ---- Oferta del 20 % ---- */
  function renderOffer() {
    const btn = $("#offer-btn");
    const note = $("#offer-note");
    if (state.discount) {
      btn.classList.add("is-active");
      btn.textContent = "Oferta activada: -20 % aplicado en tu carrito";
      note.innerHTML = "Código <strong>NUEVA20</strong> activo. Se descuenta al finalizar la compra.";
    } else {
      btn.classList.remove("is-active");
      btn.textContent = "-20 % de descuento por inauguración de la empresa";
      note.innerHTML = "Pulsa para activar el código <strong>NUEVA20</strong> en tu carrito.";
    }
  }

  function toggleOffer() {
    state.discount = !state.discount;
    saveState();
    renderCart();
    toast(state.discount ? "Descuento NUEVA20 activado (-20 %)" : "Descuento desactivado");
  }

  /* ---- Checkout (simulado) ---- */
  function initCheckout() {
    const dialog = $("#checkout");
    const form = $("#checkout-form");
    const done = $("#checkout-done");

    $("#checkout-btn").addEventListener("click", () => {
      if (!Object.keys(state.cart).length) return;
      $("#checkout-total").textContent = money.format(totals().total);
      form.hidden = false;
      done.hidden = true;
      form.reset();
      closeCart();
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    });

    $("#checkout-cancel").addEventListener("click", () => dialog.close());
    $("#checkout-close").addEventListener("click", () => dialog.close());

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      clearCart();
      form.hidden = true;
      done.hidden = false;
    });
  }

  /* =========================================================
     Arranque
     ========================================================= */
  document.addEventListener("DOMContentLoaded", () => {
    loadState();
    renderProducts();
    renderCart();

    initTypingTitle();
    initCarousel();
    initNav();
    initCheckout();

    $("#cart-open").addEventListener("click", openCart);
    $("#cart-close").addEventListener("click", closeCart);
    $("#overlay").addEventListener("click", closeCart);
    $("#cart-clear").addEventListener("click", () => { clearCart(); toast("Carrito vaciado"); });
    $("#offer-btn").addEventListener("click", toggleOffer);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeCart();
    });
  });
})();
