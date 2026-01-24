// ===== PRODUCTS =====
const products = [
  {
    id: "p1",
    name: "Organic Cotton Tee",
    price: 45.0,
    image: "assets/images/productImg/t-shirt.png",
    options: { size: "M", color: "Arctic White" },
  },
  {
    id: "p2",
    name: "Minimalist Desk Lamp",
    price: 129.0,
    image: "assets/images/productImg/lamp.png",
    options: { size: "32", color: "Matte Black" },
  },
  {
    id: "p3",
    name: "Urban Classic Sneakers",
    price: 85.0,
    image: "assets/images/productImg/beigeShoe.png",
    options: { size: "L", color: "Off-white" },
  },
];

// ===== FIREBASE =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDZmtAma7FFyJVEaHNbRk1ovmqwCO5m1p0",
  authDomain: "goshop-e43f1.firebaseapp.com",
  projectId: "goshop-e43f1",
  storageBucket: "goshop-e43f1.firebasestorage.app",
  messagingSenderId: "788272001640",
  appId: "1:788272001640:web:d0c5adf18daab3ee8e81dd",
  measurementId: "G-K8ME02DXJW",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===== LOCAL STORAGE =====
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// ===== RENDER CART =====
function renderCart() {
  const container = document.getElementById("cartItems");
  const emptyCartMsg = document.getElementById("emptyCart");
  container.innerHTML = "";

  const cart = getCart();

  products.forEach((prod) => {
    let cartItem = cart.find((p) => p.id === prod.id);
    let qty = cartItem ? cartItem.qty : 0;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${prod.image}" alt="${prod.name}" />
      <div class="item-info">
        <h3>${prod.name}</h3>
        <p>${prod.options?.size ? `Size: ${prod.options.size} |` : ""} ${prod.options?.color ? `Color: ${prod.options.color}` : ""}</p>
        <div class="qty">
          <button class="minus" data-id="${prod.id}">-</button>
          <span>${qty}</span>
          <button class="plus" data-id="${prod.id}">+</button>
        </div>
      </div>
      <div class="price">$${(prod.price * qty).toFixed(2)}</div>
      ${qty > 0 ? `<div class="remove" data-id="${prod.id}">🗑 Remove</div>` : ""}
    `;
    container.appendChild(div);
  });

  const nonEmptyCart = cart.filter((item) => item.qty > 0);
  emptyCartMsg.style.display = nonEmptyCart.length === 0 ? "block" : "none";
  updateSummary(nonEmptyCart);
}

// ===== UPDATE SUMMARY =====
function updateSummary(cartArray) {
  const subtotal = cartArray.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById("tax").textContent = `$${tax.toFixed(2)}`;
  document.getElementById("total").textContent = `$${total.toFixed(2)}`;
}

// ===== HANDLE BUTTONS =====
document.addEventListener("click", (e) => {
  if (!e.target.dataset.id) return;
  const id = e.target.dataset.id;
  let cart = getCart();
  let item = cart.find((p) => p.id === id);

  if (e.target.classList.contains("plus")) {
    if (!item) {
      const prod = products.find((p) => p.id === id);
      item = { ...prod, qty: 1 };
      cart.push(item);
    } else {
      item.qty += 1;
    }
  }

  if (e.target.classList.contains("minus") && item) {
    if (item.qty > 1) {
      item.qty -= 1;
    } else {
      cart = cart.filter((p) => p.id !== id);
    }
  }

  if (e.target.classList.contains("remove")) {
    cart = cart.filter((p) => p.id !== id);
  }

  saveCart(cart);
  renderCart();
});

// ===== CHECKOUT + FIREBASE =====
document.getElementById("checkoutBtn").addEventListener("click", async () => {
  const cart = getCart();
  if (cart.length === 0) return alert("Your cart is empty!");

  // تحويل الكارت إلى items array داخل order
  const itemsForFirebase = cart.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.qty,
  }));

  const order = {
    userId: "guest_user",
    status: "pending",
    createdAt: new Date().toISOString(),
    items: itemsForFirebase,
  };

  console.log("ORDER SENT TO FIREBASE:", order);

  try {
    await addDoc(collection(db, "orders"), order);
    localStorage.removeItem("cart");
    renderCart();
    alert("Order placed successfully ✅");
    window.location.href = "order.html";
  } catch (err) {
    console.error("Error saving order:", err);
    alert("Failed to place order");
  }
});

// ===== INIT =====
renderCart();

