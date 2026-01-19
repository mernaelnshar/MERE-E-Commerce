const menuLinks = document.querySelectorAll('.sidebar .menu a');

menuLinks.forEach(link => {
    link.addEventListener('click', () => {
        menuLinks.forEach(l => l.classList.remove('active')); // شيل الكلاس من كل الروابط
        link.classList.add('active'); // ضيف الكلاس على الرابط اللي اتضغط
    });
});

let rows = document.querySelectorAll('.orders-table tbody tr');
let viewMoreBtn = document.getElementById('viewMoreBtn');



if (rows.length > 3) {
    for (let i = 3; i < rows.length; i++) {
        rows[i].style.display = 'none';
    }
} else {
    viewMoreBtn.style.display = 'none';
}

viewMoreBtn.addEventListener('click', function () {
    for (let row of rows) {
        row.style.display = 'table-row';
    }
    viewMoreBtn.style.display = 'none';
});


// *****************************************************************


const confirmBtn = document.querySelector(".confirm");
const rejectBtn = document.querySelector(".reject");
const popup = document.getElementById("popup");
const popupText = document.getElementById("popupText");
const rejectReason = document.getElementById("rejectReason");
const okBtn = document.getElementById("okBtn");

let actionType = "";

confirmBtn.onclick = () => {
    actionType = "confirm";
    popupText.innerText = "Approved Successfully";
    rejectReason.style.display = "none";
    popup.style.display = "flex";
};

rejectBtn.onclick = () => {
    actionType = "reject";
    popupText.innerText = "Please enter rejection reason";
    rejectReason.style.display = "block";
    popup.style.display = "flex";
};

okBtn.onclick = () => {
    if (actionType === "reject") {
        if (rejectReason.value === "") {
            alert("Please write the reason");
            return;
        }
        alert("Rejected because: " + rejectReason.value);
        rejectReason.value = "";
    }
    closePopup();
};

function closePopup() {
    rejectReason.value = "";
    popup.style.display = "none";
}

