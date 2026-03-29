const BASE_URL = "https://v2.api.noroff.dev";
const ENDPOINT = "rainy-days";
const CART_KEY = "cart";

const productDetails = document.querySelector(".product-details");
const loadingMessage = document.querySelector(".loading");
const errorMessage = document.querySelector(".error");
const successMessage = document.querySelector(".success-message");

function showLoading() {
  if (loadingMessage) {
    loadingMessage.hidden = false;
  }
}

function hideLoading() {
  if (loadingMessage) {
    loadingMessage.hidden = true;
  }
}

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

function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function getCart() {
  const storedCart = localStorage.getItem(CART_KEY);
  return storedCart ? JSON.parse(storedCart) : [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getImageUrl(product) {
  if (product.image && typeof product.image === "object" && product.image.url) {
    return product.image.url;
  }

  if (typeof product.image === "string") {
    return product.image;
  }

  return "";
}

function getImageAlt(product) {
  if (product.image && typeof product.image === "object" && product.image.alt) {
    return product.image.alt;
  }

  return product.title || "Product image";
}

function getDisplayPrice(product) {
  if (
    typeof product.discountedPrice === "number" &&
    product.discountedPrice < product.price
  ) {
    return product.discountedPrice;
  }

  return product.price;
}

function addToCart(product) {
  const cart = getCart();
  const existingProduct = cart.find((item) => item.id === product.id);

  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: getDisplayPrice(product),
      image: getImageUrl(product),
      imageAlt: getImageAlt(product),
      quantity: 1,
    });
  }

  saveCart(cart);
  showSuccess(`${product.title} added to basket`);
}

function renderExtraDetails(product) {
  const details = [];

  if (product.gender) {
    details.push(`<li><strong>Gender:</strong> ${product.gender}</li>`);
  }

  if (product.genre) {
    details.push(`<li><strong>Genre:</strong> ${product.genre}</li>`);
  }

  if (product.category) {
    details.push(`<li><strong>Category:</strong> ${product.category}</li>`);
  }

  if (product.rating) {
    details.push(`<li><strong>Rating:</strong> ${product.rating}</li>`);
  }

  if (product.ageRating) {
    details.push(`<li><strong>Age rating:</strong> ${product.ageRating}</li>`);
  }

  if (product.released) {
    details.push(`<li><strong>Released:</strong> ${product.released}</li>`);
  }

  if (Array.isArray(product.sizes) && product.sizes.length) {
    details.push(`<li><strong>Sizes:</strong> ${product.sizes.join(", ")}</li>`);
  }

  if (product.baseColor) {
    details.push(`<li><strong>Color:</strong> ${product.baseColor}</li>`);
  }

  return details.join("");
}

function renderProduct(product) {
  if (!productDetails) return;

  const imageUrl = getImageUrl(product);
  const imageAlt = getImageAlt(product);
  const isOnSale =
    typeof product.discountedPrice === "number" &&
    product.discountedPrice < product.price;

  document.title = `Online Store | ${product.title}`;

  productDetails.innerHTML = `
    <article class="product-page-card">
      <div class="product-page-image-wrapper">
        ${
          imageUrl
            ? `<img src="${imageUrl}" alt="${imageAlt}" class="product-page-image" />`
            : `<div class="product-image-placeholder">No image available</div>`
        }
      </div>

      <div class="product-page-content">
        <h1 id="product-title">${product.title}</h1>

        ${
          isOnSale
            ? `
              <p class="product-price">
                <span class="old-price">${product.price} kr</span>
                <span class="sale-price">${product.discountedPrice} kr</span>
              </p>
            `
            : `<p class="product-price">${product.price} kr</p>`
        }

        <p class="product-description">${product.description || "No description available."}</p>

        <ul class="product-meta">
          ${renderExtraDetails(product)}
        </ul>

        <button type="button" class="add-to-cart-button" id="add-to-cart-button">
          Add to basket
        </button>
      </div>
    </article>
  `;

  const addToCartButton = document.querySelector("#add-to-cart-button");

  if (addToCartButton) {
    addToCartButton.addEventListener("click", () => {
      addToCart(product);
    });
  }
}

async function fetchProductById(id) {
  const response = await fetch(`${BASE_URL}/${ENDPOINT}/${id}`);

  if (!response.ok) {
    throw new Error("Could not fetch product.");
  }

  const json = await response.json();
  return json.data;
}

async function initProductPage() {
  const productId = getProductIdFromUrl();

  if (!productId) {
    showError("No product ID was found in the URL.");
    return;
  }

  try {
    showLoading();
    hideError();

    const product = await fetchProductById(productId);
    renderProduct(product);
  } catch (error) {
    showError("Something went wrong while loading the product.");
  } finally {
    hideLoading();
  }
}

initProductPage();