import { db, collection, getDocs, updateDoc, doc , getDoc , signOut} from "./firebase.js";

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

const ordersBody = document.getElementById("ordersBody");
const filterSelect = document.getElementById("statusFilter");


let currentOrderId = null;
let currentAction = null;

async function getUserName(userid) {
    try{
        const userRef = doc(db,"users", userid);
        const userSnap = await getDoc(userRef);
        if(userSnap.exists()){
        return userSnap.data().fullName;
        }
        else{
        return "Unknown User";
        }
    }
    catch(error){
        console.log(error.message);
    }
    
}


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
        
        // itemsSnap.forEach((itemDoc) =>
            for(const itemDoc of itemsSnap.docs){
            const item = itemDoc.data();
            const row = document.createElement("tr");
            const userName = await getUserName(order.userid);
            row.dataset.orderId = orderId;

            row.innerHTML = `
                <td>#C-${orderId.slice(-4)}</td>
                <td>${userName}</td>
                <td>${item.title}</td>
                <td>${item.price}</td>
                <td>${item.quantity}</td>
            `;

            ordersBody.appendChild(row);
        };
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
