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

    for (const docSnap of snapshot.docs){
        const order = docSnap.data();
        const orderId = docSnap.id;
        orderIds.add(orderId);

        const itemsSnap = await getDocs(collection(db,"orders",orderId,"items"));
        if(itemsSnap.empty){
            continue;
        }
        
        itemsSnap.forEach((itemDoc) => {
            const item = itemDoc.data();
            const row = document.createElement("tr");

            row.dataset.orderId = orderId;

            row.innerHTML = `
                <td>#C-${orderId.slice(-4)}</td>
                <td>${item.title}</td>
                <td>${item.price}</td>
                <td>${item.quantity}</td>
            `;

            ordersBody.appendChild(row);
        });
    }

    
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
