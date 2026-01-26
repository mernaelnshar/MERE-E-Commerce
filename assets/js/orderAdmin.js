import { db, collection, getDocs, updateDoc, doc, getDoc  } from "./firebase.js";
const ordersBody = document.getElementById("ordersBody");
const filterSelect = document.getElementById("statusFilter");

const popup = document.getElementById("popup");
const popupText = document.getElementById("popupText");
const okBtn = document.getElementById("okBtn");
const cancelBtn = document.getElementById("cancelBtn");

let currentOrderId = null;
let currentAction = null;

const cards = {
    confirmed: document.querySelector(".card:nth-child(1) p"),
    pending: document.querySelector(".card:nth-child(2) p"),
    return_requests: document.querySelector(".card:nth-child(3) p"),
    rejected: document.querySelector(".card:nth-child(4) p")
};

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

    let counts = {
        confirmed: 0,
        pending: 0,
        return_requests: 0,
        rejected: 0
    };

    const snapshot = await getDocs(collection(db, "orders"));


    for (const docSnap of snapshot.docs) {

        const order = docSnap.data();
        const id = docSnap.id;

        
        if (counts[order.status] !== undefined) {
            counts[order.status]++;
        }

        
        let actions = "";

        if (order.status === "pending") {
            actions = `
        <button class="confirm" data-id="${id}">Confirm</button>
        <button class="reject" data-id="${id}">Reject</button>
    `;
        }

        if (order.status === "return_requests") {
            actions = `
        <button class="confirm" data-id="${id}">Accept Return</button>
        <button class="reject" data-id="${id}">Reject</button>
    `;
        }
        const userName = await getUserName(order.userid);
        
        const row = document.createElement("tr");
        row.dataset.status = formatStatus(order.status);
        row.dataset.id = id;
        row.innerHTML = `
        <td>#C-${id.slice(-4)}</td>
        <td>${userName}</td>
        <td>${order.createdAt.toDate().toLocaleString()}</td>
        <td>${order.total} $</td>
        <td>${formatStatus(order.status)}</td>
        <td>${actions}</td>
    `;

        ordersBody.appendChild(row);
    }

    cards.confirmed.innerText = counts.confirmed;
    cards.pending.innerText = counts.pending;
    cards.return_requests.innerText = counts.return_requests;
    cards.rejected.innerText = counts.rejected;
}

loadOrders();

ordersBody.addEventListener("click", async (e) => {
    const orderId = e.target.dataset.id;
    if (!orderId) return;

    currentOrderId = orderId;

    
    if (e.target.classList.contains("confirm")) {
        currentAction = "confirm";
        popupText.innerText = "Are you sure you want to confirm this order?";
        popup.style.display = "flex"; 
    }

    
    if (e.target.classList.contains("reject")) {
        currentAction = "reject";
        popupText.innerText = "Are you sure you want to reject this order?";
        popup.style.display = "flex";
    }
});


okBtn.addEventListener("click", async () => {
    if (!currentOrderId) return;

    if (currentAction === "confirm") {
        await updateDoc(doc(db, "orders", currentOrderId), {
            status: "confirmed"
        });
    }

    if (currentAction === "reject") {
        await updateDoc(doc(db, "orders", currentOrderId), {
            status: "rejected"
        });
    }

    popup.style.display = "none"; 
    loadOrders();
    currentOrderId = null;
    currentAction = null;
});


cancelBtn.addEventListener("click", () => {
    popup.style.display = "none";
    currentOrderId = null;
    currentAction = null;
});

function formatStatus(status) {
    switch (status) {
        case "pending": return "Pending";
        case "confirmed": return "Confirmed";
        case "return_requests": return "Return Requests";
        case "rejected": return "Rejected";
        default: return status;
    }
}

filterSelect.addEventListener("change", function () {
    const selected = this.value;
    const rows = ordersBody.querySelectorAll("tr");

    rows.forEach(row => {
    const status = row.dataset.status;

    if (selected === "all" || status === selected) {
        row.style.display = "";
    } else {
        row.style.display = "none";
    }
    });
});
