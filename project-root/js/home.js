const BASE_URL = "https://v2.api.noroff.dev/rainy-days";
const ENDPOINT = "rainy-days"; 
const CART_KEY = "cart";

const productList = document.querySelector(".product-list");
const filterSelect = document.querySelector("#filter");
const loadingMessage = document.querySelector(".loading");
const errorMessage = document.querySelector(".error");
const successMessage = document.querySelector(".success-message");

let allProducts = [];

function showLoading() {
  if (loadingMessage) loadingMessage.hidden = false;
}

function hideLoading() {
  if (loadingMessage) loadingMessage.hidden = true;
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

function getCart() {
  const storedCart = localStorage.getItem(CART_KEY);
  return storedCart ? JSON.parse(storedCart) : [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(productId) {
  const selectedProduct = allProducts.find((product) => product.id === productId);

  if (!selectedProduct) return;

  const cart = getCart();
  const existingProduct = cart.find((item) => item.id === selectedProduct.id);

  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.push({
      id: selectedProduct.id,
      title: selectedProduct.title,
      price: getDisplayPrice(selectedProduct),
      image: getImageUrl(selectedProduct),
      imageAlt: getImageAlt(selectedProduct),
      quantity: 1,
    });
  }

  saveCart(cart);
  showSuccess(`${selectedProduct.title} added to basket`);
}

function getFilterValues(products) {
  const values = new Set();

  products.forEach((product) => {
    if (product.gender) values.add(product.gender);
    if (product.genre) values.add(product.genre);
    if (product.category) values.add(product.category);
  });

  return [...values].sort((a, b) => a.localeCompare(b));
}

function populateFilterOptions(products) {
  if (!filterSelect) return;

  const values = getFilterValues(products);
  filterSelect.innerHTML = `<option value="all">All</option>`;

  values.forEach((value) => {
    filterSelect.innerHTML += `<option value="${value}">${value}</option>`;
  });
}

function renderProducts(products) {
  if (!productList) return;

  productList.innerHTML = "";

  if (!products.length) {
    productList.innerHTML = "<p>No products found.</p>";
    return;
  }

  products.forEach((product) => {
    const imageUrl = getImageUrl(product);
    const imageAlt = getImageAlt(product);
    const isOnSale =
      typeof product.discountedPrice === "number" &&
      product.discountedPrice < product.price;

    productList.innerHTML += `
      <article class="product-card">
        <a href="product/index.html?id=${product.id}" class="product-card-link">
          ${
            imageUrl
              ? `<img src="${imageUrl}" alt="${imageAlt}" class="product-image">`
              : `<div class="product-image-placeholder">No image available</div>`
          }
          <h3>${product.title}</h3>
        </a>

        ${
          isOnSale
            ? `<p class="product-price"><span class="old-price">${product.price} kr</span> <span class="sale-price">${product.discountedPrice} kr</span></p>`
            : `<p class="product-price">${product.price} kr</p>`
        }

        <button type="button" class="add-to-cart-button" data-id="${product.id}">
          Add to basket
        </button>
      </article>
    `;
  });

  document.querySelectorAll(".add-to-cart-button").forEach((button) => {
    button.addEventListener("click", () => {
      addToCart(button.dataset.id);
    });
  });
}

function filterProducts(selectedValue) {
  if (selectedValue === "all") {
    renderProducts(allProducts);
    return;
  }

  const filteredProducts = allProducts.filter((product) => {
    return (
      product.gender === selectedValue ||
      product.genre === selectedValue ||
      product.category === selectedValue
    );
  });

  renderProducts(filteredProducts);
}

async function fetchProducts() {
  const url = `${BASE_URL}/${ENDPOINT}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const json = await response.json();
  return json.data;
}

async function initHomePage() {
  try {
    showLoading();
    hideError();

    allProducts = await fetchProducts();
    console.log("Products loaded:", allProducts);

    populateFilterOptions(allProducts);
    renderProducts(allProducts);
  } catch (error) {
    console.error("Home page error:", error);
    showError("Something went wrong while loading products.");
  } finally {
    hideLoading();
  }
}

if (filterSelect) {
  filterSelect.addEventListener("change", (event) => {
    filterProducts(event.target.value);
  });
}

initHomePage();