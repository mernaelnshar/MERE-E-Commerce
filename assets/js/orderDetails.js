import { db, collection, getDocs, updateDoc, doc } from "./firebase.js";

const ordersBody = document.getElementById("ordersBody");
const filterSelect = document.getElementById("statusFilter");


let currentOrderId = null;
let currentAction = null;

async function loadOrders() {
    ordersBody.innerHTML = "";
    filterSelect.innerHTML = `<option value="all">All Orders</option>`;

    const orderIds = new Set(); 

    const snapshot = await getDocs(collection(db, "orders"));

    snapshot.forEach((docSnap) => {
        const order = docSnap.data();
        const orderId = docSnap.id;

        
        orderIds.add(orderId);

        
        if (!order.items || order.items.length === 0) return;

        // نلف على كل item
        order.items.forEach((item) => {
            const row = document.createElement("tr");

            
            row.dataset.orderId = orderId;

            row.innerHTML = `
                <td>#C-${orderId.slice(-4)}</td>
                <td>${item.name}</td>
                <td>${item.price}</td>
                <td>${item.quantity}</td>
            `;

            ordersBody.appendChild(row);
        });
    });

    
    orderIds.forEach((id) => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = `#C-${id.slice(-4)}`;
        filterSelect.appendChild(option);
    });
}


loadOrders();

filterSelect.addEventListener("change", function () {
    const selectedOrderId = this.value;
    const rows = ordersBody.querySelectorAll("tr");

    rows.forEach(row => {
        const rowOrderId = row.dataset.orderId;

        if (selectedOrderId === "all" || rowOrderId === selectedOrderId) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
});
