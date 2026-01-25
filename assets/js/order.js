import {
  db,
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
} from "./firebase.js";



const ordersContainer = document.getElementById("ordersContainer");

// ===== FETCH & RENDER ORDERS =====
async function fetchOrders() {
  ordersContainer.innerHTML = "<p>Loading orders...</p>";

  try {
    const ordersSnap = await getDocs(collection(db, "orders"));
    ordersContainer.innerHTML = "";

    if (ordersSnap.empty) {
      ordersContainer.innerHTML = "<p>No orders found.</p>";
      return;
    }

    ordersSnap.forEach((orderDoc) => {
      const orderId = orderDoc.id;
      const orderData = orderDoc.data();
      const items = orderData.items || [];

      const orderDiv = document.createElement("div");
      orderDiv.className = "order-card";

      let itemsHTML = "";

      items.forEach((item, index) => {
        itemsHTML += `
          <li>
            <strong>${item.name}</strong> × ${item.quantity} — 
            <span id="status-${orderId}-${index}">${orderData.status}</span>
            <button class="return-btn" id="return-${orderId}-${index}" ${orderData.status === "pending" ? "enabled" : "disabled"}>
              Return Order
            </button>
            <br>
            <br>
          </li>
        `;
      });

      orderDiv.innerHTML = `
        <h3>Order ID: ${orderId}</h3>
        <ul>${itemsHTML}</ul>
      `;

      ordersContainer.appendChild(orderDiv);

      // listeners لكل زرار Return
      items.forEach((_, index) => {
        const btn = document.getElementById(`return-${orderId}-${index}`);
        if (btn) {
          btn.addEventListener("click", () => returnProduct(orderId, index));
        }
      });
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    ordersContainer.innerHTML = "<p>Failed to load orders.</p>";
  }
}

// ===== RETURN PRODUCT =====
async function returnProduct(orderId, itemIndex) {
  try {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      alert("Order not found");
      return;
    }

    const orderData = orderSnap.data();
    const items = orderData.items;

    // تحديث حالة المنتج المطلوب
    items[itemIndex].status = "pending to approval";

    await updateDoc(orderRef, { items });

    // تحديث UI
    document.getElementById(`status-${orderId}-${itemIndex}`).textContent = "pending to approval";
    document.getElementById(`return-${orderId}-${itemIndex}`).disabled = true;
  } catch (err) {
    console.error("Return failed:", err);
    alert("Failed to return product");
  }
}

// ===== INIT =====
fetchOrders();