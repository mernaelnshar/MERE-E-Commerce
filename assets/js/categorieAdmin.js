import { db, collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc } from "./firebase.js";

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
let editDocId = null;


async function loadCategories() {
    categoriesBody.innerHTML = "";
    try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        querySnapshot.forEach((docSnap) => {
            const category = docSnap.data();
            const id = docSnap.id;
            const name = category.name || "-";
            const row = document.createElement("tr");
            row.dataset.id = id;
            row.innerHTML = `
            <td>#C-${id.slice(-4)}</td>
                <td>${name}</td>
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
        });
    }
    catch (error) {
        console.log("Error loading categories: ", error);
    }
}
loadCategories();


addCategoryBtn.addEventListener("click", () => {
    editRow = null;
    editDocId = null;
    clearModalFields();
    categoryModal.style.display = "flex";
});

function clearModalFields() {
    document.getElementById("categoryName").value = "";
}


saveCategory.addEventListener("click", async () => {
    const name = document.getElementById("categoryName").value.trim();

    if (!name) {
        alert("Please enter category name");
        return;
    }
    try {
        if (editRow && editDocId) {
            await updateDoc(doc(db, "categories", editDocId), { name: name });
        } else {
            await addDoc(collection(db, "categories"), { name: name });
        }

        categoryModal.style.display = "none";
        clearModalFields();
        loadCategories();
    } catch (error) {
        console.error("Error saving category:", error);
    }
});

cancelCategory.addEventListener("click", () => {
    categoryModal.style.display = "none";
});



categoriesBody.addEventListener("click", async (e) => {
    const row = e.target.closest("tr");
    if (!row) {
        return;
    }

    if (e.target.closest(".edit-btn")) {
        editRow = row;
        editDocId = row.dataset.id;

        try {
            const docSnap = await getDoc(doc(db, "categories", editDocId));
            const category = docSnap.data();

            document.getElementById("categoryName").value = category.name;
            categoryModal.style.display = "flex";

        } catch (error) {
            console.error("Error fetching category:", error);
        }
    }

    if (e.target.closest(".delete-btn")) {
        rowToDelete = row;
        deleteModal.style.display = "flex";
    }
});

confirmDeleteBtn.onclick = async () => {
    if (rowToDelete) {
        const docId = rowToDelete.dataset.id;
        try {
            await deleteDoc(doc(db, "categories", docId));
            rowToDelete = null;
            loadCategories();
        } catch (error) {
            console.error("Error deleting category:", error);
        }
    }
    deleteModal.style.display = "none";
};
cancelDeleteBtn.addEventListener("click", () => {
    rowToDelete = null;
    deleteModal.style.display = "none";
});
