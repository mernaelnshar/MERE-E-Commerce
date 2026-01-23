// DOM Elements
const categoriesBody = document.getElementById("categoriesBody");
const categoryModal = document.getElementById("categoryModal");
const addCategoryBtn = document.getElementById("addCategoryBtn");
const cancelCategory = document.getElementById("cancelCategory");
const saveCategory = document.getElementById("saveCategory");

const deleteModal = document.getElementById("deleteModal");
const confirmDeleteBtn = document.getElementById("confirmDelete");
const cancelDeleteBtn = document.getElementById("cancelDelete");

let editRow = null;
let rowToDelete = null;

// فتح مودال إضافة Category
addCategoryBtn.onclick = () => {
    editRow = null;
    clearModalFields();
    categoryModal.style.display = "flex";
};

// إغلاق مودال الإضافة
cancelCategory.onclick = () => {
    categoryModal.style.display = "none";
};

// حفظ (إضافة أو تعديل)
saveCategory.onclick = () => {
    const name = document.getElementById("categoryName").value.trim();
    const products = document.getElementById("categoryProducts").value;

    if (!name) {
        alert("Please enter category name");
        return;
    }

    if (editRow) {
        // تعديل
        editRow.children[1].innerText = name;
        editRow.children[2].innerText = products || "0";
    } else {
        // إضافة
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>#C-${Math.floor(Math.random() * 10000)}</td>
            <td>${name}</td>
            <td>${products || "0"}</td>
            <td class="actions">
                <button class="edit-btn">
                    <img src="assets/images/icons/edit.png">
                </button>
                <button class="delete-btn">
                    <img src="assets/images/icons/bin.png">
                </button>
            </td>
        `;
        categoriesBody.appendChild(row);
    }

    categoryModal.style.display = "none";
    clearModalFields();
};

// تفريغ الفورم
function clearModalFields() {
    document.getElementById("categoryName").value = "";
    document.getElementById("categoryProducts").value = "";
}

// Edit & Delete (Event Delegation)
categoriesBody.addEventListener("click", (e) => {
    const row = e.target.closest("tr");
    if (!row) return;

    // Edit
    if (e.target.closest(".edit-btn")) {
        editRow = row;
        document.getElementById("categoryName").value = row.children[1].innerText;
        document.getElementById("categoryProducts").value = row.children[2].innerText;

        categoryModal.style.display = "flex";
    }

    // Delete
    if (e.target.closest(".delete-btn")) {
        rowToDelete = row;
        deleteModal.style.display = "flex";
    }
});

// تأكيد الحذف
confirmDeleteBtn.onclick = () => {
    if (rowToDelete) {
        rowToDelete.remove();
        rowToDelete = null;
    }
    deleteModal.style.display = "none";
};

// إلغاء الحذف
cancelDeleteBtn.onclick = () => {
    rowToDelete = null;
    deleteModal.style.display = "none";
};
