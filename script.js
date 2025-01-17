function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('active');
  if (menu.classList.contains('active')) {
    menu.style.display = 'flex';
  } else {
    menu.style.display = 'none';
  }
}
const cartDataAPI = "https://cdn.shopify.com/s/files/1/0883/2188/4479/files/apiCartData.json?v=1728384889"; // Replace with your actual API endpoint
const cartBody = document.getElementById("cart-body");
const loader = document.getElementById("loader");
const subtotalElement = document.getElementById("stotal-amt");
const totalElement = document.getElementById("total");

let cartData = []; // To store fetched cart data
let itemToRemoveIndex = null; // To store the index of the item to be removed

// Function to format price
const formatPrice = (price) => `₹${(price / 100).toLocaleString("en-IN")}`;

// Function to fetch cart data
async function fetchCartData() {
  loader.style.display = "block";
  try {
    const response = await fetch(cartDataAPI);
    const data = await response.json();
    cartData = data.items;
    renderCart();
  } catch (error) {
    console.error("Error fetching cart data:", error);
  } finally {
    loader.style.display = "none";
  }
}

// Function to render cart items
function renderCart() {
  cartBody.innerHTML = "";
  let total = 0;
  cartData.forEach((item, index) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    const row = `
      <tr>
        <td><img src="${item.image}" alt="${item.title}"></td>
        <td>${item.title}</td>
        <td>${formatPrice(item.price)}</td>
        <td>
          <input type="number" value="${item.quantity}" min="${item.quantity_rule.min}" max="${item.quantity_rule.max || ''}" step="${item.quantity_rule.increment}" data-index="${index}" class="quantity-input">
        </td>
        <td>${formatPrice(subtotal)}</td>
        <td>
          <img src="/assets/delete.svg" alt="Delete" class="delete-icon" data-index="${index}">
        </td>
      </tr>
    `;
    cartBody.insertAdjacentHTML("beforeend", row);
  });

  // Update total prices
  subtotalElement.textContent = formatPrice(total);
  totalElement.textContent = formatPrice(total);
}

// Function to handle quantity change
function updateQuantity(index, newQuantity) {
  cartData[index].quantity = newQuantity;
  cartData[index].line_price = cartData[index].price * newQuantity; // Update line price
  renderCart();
}

// Function to remove item from cart
function removeItem(index) {
  cartData.splice(index, 1);
  renderCart();
}

// Function to show modal
function showModal(index) {
  itemToRemoveIndex = index;
  const modal = document.getElementById('removeModal');
  modal.style.display = 'block';
}

// Function to close modal
function closeModal() {
  const modal = document.getElementById('removeModal');
  modal.style.display = 'none';
  itemToRemoveIndex = null;
}

// Function to confirm item removal
function confirmRemoveItem() {
  if (itemToRemoveIndex !== null) {
    removeItem(itemToRemoveIndex);
    closeModal();
  }
}

// Event Listeners
cartBody.addEventListener("input", (e) => {
  if (e.target.classList.contains("quantity-input")) {
    const index = e.target.getAttribute("data-index");
    const newQuantity = parseInt(e.target.value, 10);
    if (newQuantity > 0) updateQuantity(index, newQuantity);
  }
});

cartBody.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-icon")) {
    const index = e.target.getAttribute("data-index");
    showModal(index);
  }
});

// Handle checkout button
document.getElementById("chkout-btn").addEventListener("click", () => {
  alert("Proceeding to checkout...");
});

// Handle modal buttons
document.getElementById("confirm-remove").addEventListener("click", confirmRemoveItem);
document.getElementById("cancel-remove").addEventListener("click", closeModal);
document.querySelector(".close").addEventListener("click", closeModal);

// Initialize cart
fetchCartData();
