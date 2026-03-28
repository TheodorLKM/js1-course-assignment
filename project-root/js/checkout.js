const CART_KEY = "cart";

const checkoutItems = document.querySelector(".checkout-items");
const checkoutTotal = document.querySelector(".checkout-total");
const emptyCartMessage = document.querySelector(".empty-cart");
const errorMessage = document.querySelector(".error");
const successMessage = document.querySelector(".success-message");
const checkoutButton = document.querySelector("#checkout-button");

function showError(message) {
  if (errorMessage) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
  }
}

function hideError() {
  if (errorMessage) {
    errorMessage.textContent = "";
    errorMessage.hidden = true;
  }
}

function showSuccess(message) {
  if (!successMessage) return;

  successMessage.textContent = message;
  successMessage.hidden = false;

  setTimeout(() => {
    successMessage.hidden = true;
    successMessage.textContent = "";
  }, 2000);
}

function getCart() {
  const storedCart = localStorage.getItem(CART_KEY);
  return storedCart ? JSON.parse(storedCart) : [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
  renderCart();
  showSuccess("Item removed from basket");
}

function updateQuantity(productId, change) {
  const cart = getCart();
  const product = cart.find((item) => item.id === productId);

  if (!product) return;

  product.quantity += change;

  if (product.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  saveCart(cart);
  renderCart();
}

function renderCart() {
  if (!checkoutItems || !checkoutTotal) return;

  hideError();

  const cart = getCart();
  checkoutItems.innerHTML = "";

  if (!cart.length) {
    if (emptyCartMessage) {
      emptyCartMessage.hidden = false;
    }

    checkoutTotal.textContent = "Total: 0 kr";

    if (checkoutButton) {
      checkoutButton.disabled = true;
    }

    return;
  }

  if (emptyCartMessage) {
    emptyCartMessage.hidden = true;
  }

  if (checkoutButton) {
    checkoutButton.disabled = false;
  }

  let total = 0;

  cart.forEach((item) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    checkoutItems.innerHTML += `
      <article class="checkout-item-card">
        <div class="checkout-item-image-wrapper">
          ${
            item.image
              ? `<img src="${item.image}" alt="${item.imageAlt || item.title}" class="checkout-item-image" />`
              : `<div class="product-image-placeholder">No image available</div>`
          }
        </div>

        <div class="checkout-item-content">
          <h3>${item.title}</h3>
          <p>Price: ${item.price} kr</p>
          <p>Quantity: ${item.quantity}</p>
          <p>Subtotal: ${subtotal} kr</p>

          <div class="checkout-item-actions">
            <button type="button" class="decrease-button" data-id="${item.id}">-</button>
            <button type="button" class="increase-button" data-id="${item.id}">+</button>
            <button type="button" class="remove-button" data-id="${item.id}">Remove</button>
          </div>
        </div>
      </article>
    `;
  });

  checkoutTotal.textContent = `Total: ${total} kr`;

  const removeButtons = document.querySelectorAll(".remove-button");
  const increaseButtons = document.querySelectorAll(".increase-button");
  const decreaseButtons = document.querySelectorAll(".decrease-button");

  removeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      removeFromCart(button.dataset.id);
    });
  });

  increaseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      updateQuantity(button.dataset.id, 1);
    });
  });

  decreaseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      updateQuantity(button.dataset.id, -1);
    });
  });
}

if (checkoutButton) {
  checkoutButton.addEventListener("click", () => {
    const cart = getCart();

    if (!cart.length) {
      showError("Your basket is empty.");
      return;
    }

    localStorage.removeItem(CART_KEY);
    window.location.href = "confirmation/index.html";
  });
}

renderCart();