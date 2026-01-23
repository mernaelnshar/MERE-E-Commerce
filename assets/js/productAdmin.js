import { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "./firebase.js";


const productsBody = document.getElementById("productsBody");
const productModal = document.getElementById("productModal");
const addProductBtn = document.getElementById("addProductBtn");
const cancelProduct = document.getElementById("cancelProduct");
const saveProduct = document.getElementById("saveProduct");

const deleteModal = document.getElementById("deleteModal");
const confirmDelete = document.getElementById("confirmDelete");
const cancelDelete = document.getElementById("cancelDelete");

const categoryFilter = document.getElementById("categoryFilter");

let rowToDelete = null;
let editRow = null;
let editDocId = null;

async function loadProducts() {
    productsBody.innerHTML = ""; // تنظيف الجدول

    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        querySnapshot.forEach((docSnap) => {
            const product = docSnap.data();

            // تأكد من وجود كل البيانات
            const id = docSnap.id || "unknown";
            const title = product.title || "-";
            const category = product.category || "-";
            const price = product.price || "-";
            const stock = product.stock || "-";
            const image = product.imageURL ;

            const row = document.createElement("tr");

            // dataset مهم للفلتر والتعديل والحذف
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


// saveProduct.onclick = async () => {
//     const name = document.getElementById("name").value.trim();
//     const price = document.getElementById("price").value.trim();
//     const category = document.getElementById("category").value.trim();
//     const stock = document.getElementById("stock").value.trim();
//     const image = document.getElementById("image").value.trim();
//     const description = document.getElementById("description").value.trim();

//     if (!name || !price || !category || !stock || !image) {
//         alert("Please fill all fields");
//         return;
//     }

//     const productData = { name, price, category, stock, image, description };

//     if (editRow && editDocId) {
//         // تحديث
//         await updateDoc(doc(db, "products", editDocId), productData);
//     } else {
//         // إضافة
//         await addDoc(collection(db, "products"), productData);
//     }

//     productModal.style.display = "none";
//     clearModalFields();
//     loadProducts(); // إعادة تحميل الجدول
// };


// productsBody.addEventListener("click", async (e) => {
//     const row = e.target.closest("tr");
//     if (!row) return;

//     if (e.target.closest(".edit-btn")) {
//         editRow = row;
//         editDocId = row.dataset.id;

//         // جلب البيانات من Firebase
//         const docSnap = await getDocs(doc(db, "products", editDocId));
//         const product = docSnap.data();

//         document.getElementById("name").value = product.name;
//         document.getElementById("price").value = product.price;
//         document.getElementById("category").value = product.category;
//         document.getElementById("stock").value = product.stock;
//         document.getElementById("image").value = product.image;
//         document.getElementById("description").value = product.description;

//         productModal.style.display = "flex";
//     }

//     if (e.target.closest(".delete-btn")) {
//         rowToDelete = row;
//         deleteModal.style.display = "flex";
//     }
// });


// confirmDelete.onclick = async () => {
//     if (rowToDelete) {
//         const docId = rowToDelete.dataset.id;
//         await deleteDoc(doc(db, "products", docId));
//         rowToDelete = null;
//         loadProducts();
//     }
//     deleteModal.style.display = "none";
// };


// categoryFilter.addEventListener("change", () => {
//     const selectedCategory = categoryFilter.value;
//     const rows = document.querySelectorAll("#productsBody tr");

//     rows.forEach(row => {
//         const rowCategory = row.dataset.category;
//         row.style.display = selectedCategory === "all" || rowCategory === selectedCategory ? "" : "none";
//     });
// });

