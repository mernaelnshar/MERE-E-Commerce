import {
  db,
  collection,
  getDocs,
  doc,
  updateDoc
} from "./firebase.js";

const ordersContainer = document.getElementById("ordersContainer");

async function fetchOrders() {
  ordersContainer.innerHTML = "<p>Loading orders...</p>";

  try {
    const ordersSnap = await getDocs(collection(db, "orders"));
    ordersContainer.innerHTML = "";

    if (ordersSnap.empty) {
      ordersContainer.innerHTML = "<p>No orders found.</p>";
      return;
    }

    for (const orderDoc of ordersSnap.docs) {
      const orderId = orderDoc.id;
      const orderData = orderDoc.data();
      const orderStatus = orderData.status || "pending";

      const orderDiv = document.createElement("div");
      orderDiv.className = "order-card";

      const itemsSnap = await getDocs(
        collection(db, "orders", orderId, "items")
      );

      if (itemsSnap.empty) continue;

      let itemsHTML = "";

      itemsSnap.forEach((itemDoc) => {
        const item = itemDoc.data();
        const itemId = itemDoc.id;

        // الزرار يشتغل بس في حالة confirmed
        const isEnabled = orderStatus === "confirmed";

        itemsHTML += `
          <li class="item-row">
            <img src="${item.image}" class="item-image">
            <div class="item-info">
              <strong>${item.title}</strong>
              <span>Price: $${item.price}</span>
              <span>Status: ${orderStatus}</span>

              <button
                class="return-btn"
                id="return-${orderId}-${itemId}"
                ${isEnabled ? "" : "disabled"}
              >
                  ${orderStatus === "confirmed" ? "Return Order" : "Return Requests"}

              </button>
            </div>
          </li>
        `;
      });

      orderDiv.innerHTML = `<ul>${itemsHTML}</ul>`;
      ordersContainer.appendChild(orderDiv);

      // Event Listener (يتضاف بس لو confirmed)
      if (orderStatus === "confirmed") {
        itemsSnap.forEach((itemDoc) => {
          const itemId = itemDoc.id;
          const btn = document.getElementById(`return-${orderId}-${itemId}`);

          if (btn) {
            btn.addEventListener("click", async () => {
              try {
                // تحديث حالة الأوردر
                await updateDoc(doc(db, "orders", orderId), {
                  status: "return_requests"
                });

                // تقفيل كل أزرار الأوردر
                document
                  .querySelectorAll(`[id^="return-${orderId}-"]`)
                  .forEach((b) => {
                    b.textContent = "Return Requests";
                    b.disabled = true;
                  });

              } catch (err) {
                console.error("Failed to update order:", err);
                alert("Failed to send return request");
              }
            });
          }
        });
      }
    }
  } catch (err) {
    console.error(err);
    ordersContainer.innerHTML = "<p>Error loading orders</p>";
  }
}


fetchOrders();
