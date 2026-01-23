const filterSelect = document.getElementById("statusFilter");
const ordersTable = document.querySelector(".orders-table tbody");

filterSelect.addEventListener("change", function() {
    const selected = this.value; // all / Confirmed / Pending / Return Requests / Rejected
    const rows = ordersTable.querySelectorAll("tr");

    rows.forEach(row => {
        const status = row.getAttribute("data-status");
        if (selected === "all" || status === selected) {
            row.style.display = ""; // show
        } else {
            row.style.display = "none"; // hide
        }
    });
});


const popup = document.getElementById("popup");
const popupText = document.getElementById("popupText");
const rejectReason = document.getElementById("rejectReason");
const okBtn = document.getElementById("okBtn");

let actionType = "";
let currentRow = null; // الصف اللي اتضغط عليه

// نسمع أي كليك جوه الجدول
document.addEventListener("click", function (e) {

    // Confirm
    if (e.target.classList.contains("confirm")) {
        actionType = "confirm";
        currentRow = e.target.closest("tr");

        popupText.innerText = "Approved Successfully";
        rejectReason.style.display = "none";
        popup.style.display = "flex";
    }

    // Reject
    if (e.target.classList.contains("reject")) {
        actionType = "reject";
        currentRow = e.target.closest("tr");

        popupText.innerText = "Please enter rejection reason";
        rejectReason.style.display = "block";
        popup.style.display = "flex";
    }
});

// OK Button
okBtn.onclick = () => {
    if (!currentRow) return;

    const statusCell = currentRow.children[4]; // عمود STATUS
    const actionCell = currentRow.children[5];

    if (actionType === "confirm") {
        statusCell.innerText = "Confirmed";
        currentRow.setAttribute("data-status", "Confirmed");
    }

    if (actionType === "reject") {
        if (rejectReason.value === "") {
            alert("Please write the reason");
            return;
        }

        statusCell.innerText = "Rejected";
        currentRow.setAttribute("data-status", "Rejected");
        rejectReason.value = "";
    }
    
    actionCell.innerHTML = "";
    closePopup();
};

function closePopup() {
    popup.style.display = "none";
    rejectReason.value = "";
    currentRow = null;
}
