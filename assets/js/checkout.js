

import { 
  db,
  auth,
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  onAuthStateChanged,signOut,addDoc
} from "./firebase/firebase.js"; 
function requireAuth() {
    const user = auth.currentUser;
    if (!user) {
        alert("Please login first!");
        window.location.href = "login.html";
        return null;
    }
    return user;
}
document.querySelector(".logout-btn").addEventListener("click", async () => {
    try {
        await signOut(auth); 
        alert("You have been logged out.");
        window.location.href = "login.html"; 
    } catch (error) {
        console.error("Logout error:", error);
        alert("Error logging out. Please try again.");
    }
});
const cartContainer = document.getElementById("cartItems");
const emptyCartMsg = document.getElementById("emptyCart");

let currentUser = null;

/* =========================
   GET CART (نفس المشروع)
========================= */
function getCart() {
  return JSON.parse(localStorage.getItem("Cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("Cart", JSON.stringify(cart));
}

/* =========================
   RENDER CART
========================= */
async function renderCart() {
    var user = requireAuth();
    if (!user) return;
  cartContainer.innerHTML = "";
  const cart = getCart();

  if (!currentUser) return;
  const userCart = cart.filter(item => item.userid === currentUser.uid);


  if (userCart.length === 0) {
    emptyCartMsg.style.display = "block";
    return;
  }

  emptyCartMsg.style.display = "none";

  let subtotal = 0;

  for (const item of userCart) {
    

    const productSnap = await getDoc(doc(db, "products", item.Product));
    if (!productSnap.exists()) continue;
    
    const product = productSnap.data(); 
    const itemTotal = product.price * item.Quantity;
    subtotal += itemTotal;

    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <img src="${product.imageURL}" />
      <div class="item-info">
        <h3>${product.title}</h3>
        <div class="qty">
          <button class="minus" data-id="${item.Product}">-</button>
          <span>${item.Quantity}</span>
          <button class="plus" data-id="${item.Product}">+</button>
        </div>
      </div>
      <div class="price">$${itemTotal.toFixed(2)}</div>
      <div class="remove" data-id="${item.Product}">🗑</div>
    `;

    cartContainer.appendChild(div);
  }

  updateSummary(subtotal);
}

/* =========================
   SUMMARY
========================= */
function updateSummary(subtotal) {
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById("tax").textContent = `$${tax.toFixed(2)}`;
  document.getElementById("total").textContent = `$${total.toFixed(2)}`;
}

/* =========================
   CART ACTIONS
========================= */
document.addEventListener("click", (e) => {
    var user = requireAuth();
    if (!user) return;
  const id = e.target.dataset.id;
  if (!id || !user) return;

  let cart = getCart();
  const index = cart.findIndex(
    item => item.Product === id && item.userid === currentUser.uid
  );

  if (e.target.classList.contains("plus")) {
    cart[index].Quantity++;
  }

  if (e.target.classList.contains("minus")) {
    if (cart[index].Quantity > 1) {
      cart[index].Quantity--;
    } else {
      cart.splice(index, 1);
    }
  }

  if (e.target.classList.contains("remove")) {
    cart.splice(index, 1);
  }

  saveCart(cart);
  renderCart();
});

/* =========================
   CHECKOUT
========================= */
document.getElementById("checkoutBtn").addEventListener("click", async () => {
    var user = requireAuth();
    if (!user) return;
  const userCart = getCart().filter(
    item => item.userid === user.uid
  );

  if (userCart.length === 0) {
    alert("Cart is empty");
    return;
  }

  let total = 0;


  const orderRef = await addDoc(collection(db, "orders"), {
    userid: user.uid,
    status: "pending",
    total: 0,
    createdAt: new Date()
  });


  for (const cartItem of userCart) {
    const productSnap = await getDoc(
      doc(db, "products", cartItem.Product)
    );

    if (!productSnap.exists()) continue;

    const product = productSnap.data();
    const itemTotal = product.price * cartItem.Quantity;
    total += itemTotal;
    var newStoc= product.stock-cartItem.Quantity ||0
    await updateDoc(doc(db, "products", productSnap.id), {
    stock: newStoc
    });
    await addDoc(
      collection(db, "orders", orderRef.id, "items"),
      {
        productid: cartItem.Product,
        title: product.title,
        price: product.price,
        quantity: cartItem.Quantity
      }
    );
  }

  await updateDoc(doc(db, "orders", orderRef.id), {
    total: total
  });

  const rest = getCart().filter(
    item => item.userid !== user.uid
  );
  saveCart(rest);

  alert("Order placed successfully ✅");
  renderCart();
});


/* =========================
   AUTH INIT
========================= */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Please login first");
    return;
  }

  currentUser = user;
  renderCart();
});
