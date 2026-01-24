import { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from "./firebase.js";


const productsBody = document.getElementById("productsBody");
const productModal = document.getElementById("productModal");
const addProductBtn = document.getElementById("addProductBtn");
const cancelProduct = document.getElementById("cancelProduct");
const saveProduct = document.getElementById("saveProduct");

const deleteModal = document.getElementById("deleteModal");
const confirmDelete = document.getElementById("confirmDelete");
const cancelDelete = document.getElementById("cancelDelete");

const categoryFilter = document.getElementById("categoryFilter");
const categorySelect = document.getElementById("category");

let rowToDelete = null;
let editRow = null;
let editDocId = null;

async function loadProducts() {
    productsBody.innerHTML = "";

    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        querySnapshot.forEach((docSnap) => {
            const product = docSnap.data();

            const id = docSnap.id || "unknown";
            const title = product.title || "-";
            const category = product.category.replace(/_/g, " ") || "-";
            const price = product.price || "-";
            const stock = product.stock || "-";
            const image = product.imageURL;

            const row = document.createElement("tr");
            row.dataset.category = category;
            row.dataset.id = id;

            row.innerHTML = `
                <td>#P-${id.slice(-4)}</td>
                <td><img src="${image}" alt="${product.title}"></td>
                <td>${title}</td>
                <td>${category}</td>
                <td>${price}</td>
                <td>${stock}</td>
                <td class="actions">
                    <button class="edit-btn">
                        <img src="assets/images/icons/edit.png" alt="Edit">
                    </button>
                    <button class="delete-btn">
                        <img src="assets/images/icons/bin.png" alt="Delete">
                    </button>
                </td>
            `;
            productsBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading products:", error);
    }
}

loadProducts();
addProductBtn.addEventListener("click", () => {
    editRow = null;
    editDocId = null;
    clearModalFields();
    productModal.style.display = "flex";
});

function clearModalFields() {
    document.getElementById("title").value = "";
    document.getElementById("price").value = "";
    document.getElementById("category").value = "";
    document.getElementById("stock").value = "";
    document.getElementById("image").value = "";
    document.getElementById("description").value = "";
}

cancelProduct.addEventListener("click", () => {
    clearModalFields();
    productModal.style.display = "none";
})

saveProduct.addEventListener("click", async () => {
    const title = document.getElementById("title").value.trim();
    const price = document.getElementById("price").value.trim();
    const category = document.getElementById("category").value.trim().replace(/\s+/g, "_");
    const stock = document.getElementById("stock").value.trim();
    const image = document.getElementById("image").value.trim();
    const description = document.getElementById("description").value.trim();

    if (!title || !price || !category || !stock || !image) {
        alert("please fill all fields");
        return;
    }

    const productData = { title, price, category, stock, image, description };

    if (editRow && editDocId) {
        await updateDoc(doc(db, "products", editDocId), productData);
    }
    else {
        await addDoc(collection(db, "products"), productData);
    }

    productModal.style.display = "none";
    clearModalFields();
    loadProducts();

});

productsBody.addEventListener("click", async (e) => {
    const row = e.target.closest("tr");
    if (!row) {
        return;
    }
    if (e.target.closest(".edit-btn")) {
        editRow = row;
        editDocId = row.dataset.id;

        const docSnap = await getDoc(doc(db, "products", editDocId));
        const product = docSnap.data();

        document.getElementById("title").value = product.title;
        document.getElementById("price").value = product.price;
        document.getElementById("category").value = product.category;
        document.getElementById("stock").value = product.stock;
        document.getElementById("image").value = product.imageURL;
        document.getElementById("description").value = product.description;
        productModal.style.display = "flex";
    }

    if (e.target.closest(".delete-btn")) {
        rowToDelete = row;
        deleteModal.style.display = "flex";
    }

});


cancelDelete.addEventListener("click", () => {
    deleteModal.style.display = "none";
});

confirmDelete.addEventListener("click", async ()=>{
    if(!rowToDelete){
        return;
    }
    await deleteDoc(doc(db,"products", rowToDelete.dataset.id));
    loadProducts();
    deleteModal.style.display="none";
    rowToDelete=null;
});

async function loadCategories() {
    categoryFilter.innerHTML = `<option value="all">All Categories</option>`; 
    categorySelect.innerHTML = `<option value="">Select Category</option>`;
    try{
        const querySnapshot = await getDocs(collection(db,"categories"));
        querySnapshot.forEach((docSnap)=>{
            const category = docSnap.data().name;

            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);

            const selectOption = document.createElement("option");
            selectOption.value = category;
            selectOption.textContent = category;
            categorySelect.appendChild(selectOption); 
        });
    }
    catch (error){
        console.log("Error loading categories: ", error);
    }
    
}

loadCategories();

categoryFilter.addEventListener("change",()=>{
    const selectedCategory = categoryFilter.value;
    const rows = document.querySelectorAll("#productsBody tr");
    rows.forEach((row) =>{
        if(selectedCategory === "all" || row.dataset.category === selectedCategory){
            row.style.display="";
        }else{
            row.style.display="none";
        }
    });
});