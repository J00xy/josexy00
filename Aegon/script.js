// Configuración de Venta
const PHONE_NUMBER = "18494268576"; // Formato E.164 sin signos ni espacios (Ej: 18091234567)
const SERVER_NAME = "Dream Y0002 NA";
const VENDOR_NAME = "AegonTargaryen9";
const PRICE_PER_1M_LINKS = 1.00; // Precio en USD por cada 1,000,000 Energy Links

// Elementos de la Calculadora
const linkAmountInput = document.getElementById('linkAmount');
const totalPriceEl = document.getElementById('totalPrice');
const btnOrderLinks = document.getElementById('btnOrderLinks');

// Función para calcular precio
function calculatePrice() {
  const amount = parseFloat(linkAmountInput.value) || 0;
  const total = (amount / 1000000) * PRICE_PER_1M_LINKS;
  totalPriceEl.textContent = `$${total.toFixed(2)} USD`;
}

linkAmountInput.addEventListener('input', calculatePrice);
calculatePrice(); // Inicializar

// Ordenar Energy Links por WhatsApp
btnOrderLinks.addEventListener('click', () => {
  const amount = linkAmountInput.value;
  const price = totalPriceEl.textContent;
  
  if (!amount || amount <= 0) {
    alert("Por favor ingresa una cantidad válida de Energy Links.");
    return;
  }

  const message = `Hola ${VENDOR_NAME}, quiero comprar ${amount} Energy Links en el servidor ${SERVER_NAME}. Precio estimado: ${price}. ¿Tienes disponibilidad?`;
  const waUrl = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');
});

// Ordenar Deviant individual por WhatsApp
function orderDeviant(deviantName) {
  const message = `Hola ${VENDOR_NAME}, estoy interesado en comprar el Deviant: ${deviantName} en el servidor ${SERVER_NAME}. ¿Sigue disponible?`;
  const waUrl = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');
}

const deviantsCart = [];

function formatUSD(value) {
  return `$${value.toFixed(2)} USD`;
}

function initCart() {
  document.querySelectorAll('.btn-card-add').forEach(button => {
    button.addEventListener('click', () => addToCart(button));
  });

  const sendCartBtn = document.getElementById('btnSendCart');
  if (sendCartBtn) sendCartBtn.addEventListener('click', sendCartWhatsApp);

  renderCart();
}

function addToCart(button, deviantName) {
  if (!button || !(button instanceof HTMLElement)) return;
  const card = button.closest('.card');
  if (!card) return;
  const name = deviantName || button.dataset.name || card.querySelector('h3')?.textContent.trim();
  if (!name) return;

  const priceText = card.querySelector('.price')?.textContent || '$0';
  const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
  const category = card.querySelector('.card-tag')?.textContent.trim() || 'Deviant';
  const existing = deviantsCart.find(item => item.name === name);
  if (existing) {
    existing.quantity += 1;
  } else {
    deviantsCart.push({ name, category, price, quantity: 1 });
  }
  renderCart();
  showCartToast(`${name} agregado${existing ? ' (cantidad actualizada)' : ''}`);
  pulseCartBadge();
}

// Feedback breve al agregar: pequeño toast en el panel de carrito
function showCartToast(message) {
  const toast = document.getElementById('cartToast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 1800);
}

function pulseCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  badge.classList.add('pop');
  setTimeout(() => badge.classList.remove('pop'), 500);
}

function renderCart() {
  const cartItemsEl = document.getElementById('cartItems');
  const cartEmptyEl = document.getElementById('cartEmpty');
  const cartBadge = document.getElementById('cartBadge');
  const cartTotalEl = document.getElementById('cartTotal');
  const sendCartBtn = document.getElementById('btnSendCart');

  if (!cartItemsEl || !cartEmptyEl || !cartBadge || !cartTotalEl || !sendCartBtn) return;

  cartItemsEl.innerHTML = '';
  if (deviantsCart.length === 0) {
    cartEmptyEl.style.display = 'block';
    sendCartBtn.disabled = true;
    cartBadge.textContent = '0 seleccionados';
    cartTotalEl.textContent = formatUSD(0);
    return;
  }

  cartEmptyEl.style.display = 'none';
  cartBadge.textContent = `${deviantsCart.reduce((sum, item) => sum + item.quantity, 0)} seleccionados`;

  let total = 0;
  deviantsCart.forEach((item, index) => {
    total += item.price * item.quantity;
    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
      <div class="cart-item-title">
        <strong>${item.name}</strong>
        <div class="cart-item-meta">${item.category} • ${item.quantity}x ${formatUSD(item.price)}</div>
      </div>
      <div class="cart-item-actions">
        <button type="button" onclick="increaseCartItem(${index})">+1</button>
        <button type="button" class="remove" onclick="removeCartItem(${index})">Eliminar</button>
      </div>
    `;
    cartItemsEl.appendChild(itemEl);
  });

  cartTotalEl.textContent = formatUSD(total);
  sendCartBtn.disabled = false;
}

function increaseCartItem(index) {
  if (deviantsCart[index]) {
    deviantsCart[index].quantity += 1;
    renderCart();
  }
}

function decreaseCartItem(index) {
  if (!deviantsCart[index]) return;
  if (deviantsCart[index].quantity > 1) {
    deviantsCart[index].quantity -= 1;
  } else {
    deviantsCart.splice(index, 1);
  }
  renderCart();
}

function removeCartItem(index) {
  deviantsCart.splice(index, 1);
  renderCart();
}

function sendCartWhatsApp() {
  if (deviantsCart.length === 0) return;
  const cartLines = deviantsCart.map(item => `${item.quantity}x ${item.name} (${item.category}) - ${formatUSD(item.price * item.quantity)}`);
  const total = deviantsCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const message = `Hola ${VENDOR_NAME}, quiero comprar estos Deviants en el servidor ${SERVER_NAME}:\n${cartLines.join('\n')}\nTotal: ${formatUSD(total)}. ¿Los tienes disponibles?`;
  const waUrl = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');
}

function transformDeviantButtons() {
  document.querySelectorAll('.btn-card-wa').forEach(button => {
    const icon = button.querySelector('i.fa-brands.fa-whatsapp');
    if (icon) icon.remove();
    const card = button.closest('.card');
    const name = card?.querySelector('h3')?.textContent.trim() || 'Deviant';
    button.textContent = 'Agregar al carrito';
    button.classList.add('btn-card-add');
    button.onclick = () => addToCart(button, name);
  });
}

initCart();
transformDeviantButtons();

// --- Animación de Partículas (Stardust Effect) ---
const canvas = document.getElementById('particlesCanvas');
const ctx = canvas.getContext('2d');

let particlesArray = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = Math.random() * 0.5 - 0.25;
    this.speedY = Math.random() * -0.5 - 0.2;
    this.color = Math.random() > 0.5 ? '#00f0ff' : '#ff0055';
    this.opacity = Math.random() * 0.7 + 0.3;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.y < 0) {
      this.y = canvas.height;
      this.x = Math.random() * canvas.width;
    }
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initParticles() {
  particlesArray = [];
  const numberOfParticles = Math.floor((canvas.width * canvas.height) / 15000);
  for (let i = 0; i < numberOfParticles; i++) {
    particlesArray.push(new Particle());
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particlesArray.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

// --- Modal ligero para imágenes de Deviants ---
const imageModal = document.getElementById('imageModal');
const imageModalImg = document.getElementById('imageModalImg');
const imageModalCaption = document.getElementById('imageModalCaption');
const imageModalClose = document.getElementById('imageModalClose');
const imageModalBackdrop = document.getElementById('imageModalBackdrop');

function openImageModal(src, title) {
  if (!imageModal) return;
  imageModalImg.src = src;
  imageModalImg.alt = title || '';
  imageModalCaption.textContent = title || '';
  imageModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeImageModal() {
  if (!imageModal) return;
  imageModal.setAttribute('aria-hidden', 'true');
  imageModalImg.src = '';
  imageModalCaption.textContent = '';
  document.body.style.overflow = '';
}

if (imageModalClose) imageModalClose.addEventListener('click', closeImageModal);
if (imageModalBackdrop) imageModalBackdrop.addEventListener('click', closeImageModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeImageModal(); });

// Añadir manejador a las imágenes Deviant
document.querySelectorAll('.deviant-img').forEach(img => {
  img.addEventListener('click', () => openImageModal(img.src, img.dataset.title || img.alt));
  // Fade-in cuando carga
  img.style.opacity = '0';
  img.addEventListener('load', () => { img.style.transition = 'opacity 350ms ease'; img.style.opacity = '1'; });
});

// Smooth scroll para enlaces internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href.length > 1 && href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});