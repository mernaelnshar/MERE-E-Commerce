// import {
//   db,
//   collection,
//   getDocs,
//   doc,
//   updateDoc
// } from "./firebase.js";

// const ordersContainer = document.getElementById("ordersContainer");

// async function fetchOrders() {
//   ordersContainer.innerHTML = "<p>Loading orders...</p>";

//   try {
//     const ordersSnap = await getDocs(collection(db, "orders"));
//     ordersContainer.innerHTML = "";

//     if (ordersSnap.empty) {
//       ordersContainer.innerHTML = "<p>No orders found.</p>";
//       return;
//     }

//     for (const orderDoc of ordersSnap.docs) {
//       const orderId = orderDoc.id;
//       const orderData = orderDoc.data();
//       const orderStatus = orderData.status || "pending";

//       const orderDiv = document.createElement("div");
//       orderDiv.className = "order-card";

//       const itemsSnap = await getDocs(
//         collection(db, "orders", orderId, "items")
//       );

//       if (itemsSnap.empty) continue;

//       let itemsHTML = "";

//       itemsSnap.forEach((itemDoc) => {
//         const item = itemDoc.data();
//         const itemId = itemDoc.id;

//         // الزرار يشتغل بس في حالة confirmed
//         const isEnabled = orderStatus === "confirmed";

//         itemsHTML += `
//           <li class="item-row">
//             <img src="${item.image}" class="item-image">
//             <div class="item-info">
//               <strong>${item.title}</strong>
//               <span>Price: $${item.price}</span>
//               <span>Status: ${orderStatus}</span>

//               <button
//                 class="return-btn"
//                 id="return-${orderId}-${itemId}"
//                 ${isEnabled ? "" : "disabled"}
//               >
//                   ${orderStatus === "confirmed" ? "Return Order" : "Return Requests"}

//               </button>
//             </div>
//           </li>
//         `;
//       });

//       orderDiv.innerHTML = `<ul>${itemsHTML}</ul>`;
//       ordersContainer.appendChild(orderDiv);

//       // Event Listener (يتضاف بس لو confirmed)
//       if (orderStatus === "confirmed") {
//         itemsSnap.forEach((itemDoc) => {
//           const itemId = itemDoc.id;
//           const btn = document.getElementById(`return-${orderId}-${itemId}`);

//           if (btn) {
//             btn.addEventListener("click", async () => {
//               try {
//                 // تحديث حالة الأوردر
//                 await updateDoc(doc(db, "orders", orderId), {
//                   status: "return_requests"
//                 });

//                 // تقفيل كل أزرار الأوردر
//                 document
//                   .querySelectorAll(`[id^="return-${orderId}-"]`)
//                   .forEach((b) => {
//                     b.textContent = "Return Requests";
//                     b.disabled = true;
//                   });

//               } catch (err) {
//                 console.error("Failed to update order:", err);
//                 alert("Failed to send return request");
//               }
//             });
//           }
//         });
//       }
//     }
//   } catch (err) {
//     console.error(err);
//     ordersContainer.innerHTML = "<p>Error loading orders</p>";
//   }
// }


// fetchOrders();



import {
  db,
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where
} from "./firebase.js"; // تأكدي إن المسار ده صح بالنسبة لمكان الملف

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth();
const ordersContainer = document.getElementById("ordersContainer");

// 1. مراقبة حالة المستخدم
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Logged in user:", user.uid);
    fetchOrders(user.uid);
  } else {
    if (ordersContainer) {
      ordersContainer.innerHTML = "<p style='text-align:center;'>Please login to see your orders.</p>";
    }
  }
});

// 2. جلب الطلبات
async function fetchOrders(currentUid) {
  if (!ordersContainer) return;
  ordersContainer.innerHTML = "<p>Loading orders...</p>";

  try {
    // الفلترة بـ userid كما هو موجود في Firebase
    const ordersQuery = query(
      collection(db, "orders"),
      where("userid", "==", currentUid)
    );

    const ordersSnap = await getDocs(ordersQuery);
    ordersContainer.innerHTML = "";

    if (ordersSnap.empty) {
      ordersContainer.innerHTML = "<p>No orders found.</p>";
      return;
    }

    // 3. عرض المنتجات داخل كل أوردر
    for (const orderDoc of ordersSnap.docs) {
      const orderId = orderDoc.id;
      const orderData = orderDoc.data();
      const orderStatus = orderData.status || "pending";

      // جلب الـ sub-collection (items)
      const itemsSnap = await getDocs(collection(db, "orders", orderId, "items"));

      itemsSnap.forEach((itemDoc) => {
        const item = itemDoc.data();
        const itemId = itemDoc.id;

        const itemDiv = document.createElement("div");
        itemDiv.className = "order-card"; // تأكدي إن الكلاس ده موجود في الـ CSS بتاعك

        // عرض المنتج بدون الـ Order ID
        itemDiv.innerHTML = `
          <div class="item-row" style="display: flex; align-items: center; gap: 20px; border-bottom: 1px solid #eee; padding: 15px; background: #fff; margin-bottom: 10px; border-radius: 8px;">
            <img src="${item.image}" alt="${item.title}" style="width:80px; height:80px; object-fit:cover; border-radius: 8px;">
            <div class="item-info" style="flex-grow: 1;">
              <h3 style="margin: 0 0 5px 0; font-size: 1.1rem;">${item.title}</h3>
              <p style="margin: 0; color: #555;">Price: $${item.price}</p>
              <p style="margin: 5px 0; font-weight: bold; color: ${orderStatus === 'pending' ? '#0b7974' : '#27ae60'};">
                Status: ${orderStatus}
              </p>
            </div>
            <button 
  id="return-${orderId}-${itemId}"
  class="return-btn"
  style="padding: 8px 15px; cursor: pointer; border: none; border-radius: 5px; 
        background: ${orderStatus === 'confirmed' ? '#0b7974' : '#bdc3c7'}; 
        color: white;"
  ${orderStatus === 'confirmed' ? '' : 'disabled'}
>
  ${orderStatus === 'confirmed' ? 'Return Requested' : ''}
</button>
        `;

        ordersContainer.appendChild(itemDiv);

        // تشغيل زر الارتجاع
        setupReturnButton(orderId, itemId, orderStatus);
      });
    }
  } catch (err) {
    console.error("Error fetching orders:", err);
    ordersContainer.innerHTML = "<p>Error loading orders. Check console for details.</p>";
  }
}


// 4. وظيفة زر الارتجاع
function setupReturnButton(orderId, itemId, status) {
  const btn = document.getElementById(`return-${orderId}-${itemId}`);
  
  // تفعيل الكليك فقط إذا كانت الحالة confirmed
  if (btn && status === "confirmed") {
    btn.addEventListener("click", async () => {
      if (confirm("Are you sure you want to return this item?")) {
        try {
          // تحديث الحالة في Firebase إلى "return_requested" (أو أي اسم تفضلينه)
          await updateDoc(doc(db, "orders", orderId), {
            status: "return_requests" 
          });
          
          alert("Return request sent successfully!");
          location.reload(); 
        } catch (err) {
          console.error("Error:", err);
          alert("Error sending return request.");
        }
      }
    });
  }
}