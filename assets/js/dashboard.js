import {db, collection, getDocs, query, where , doc , getDoc , setDoc , addDoc , updateDoc , signOut} from "./firebase.js";

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


const totalProductsEl = document.getElementById("totalProducts");
const totalCategoriesEl = document.getElementById("totalCategories");
const pendingOrdersEl = document.getElementById("pendingOrders");

async function getTotalProducts() {
    const snapshot = await getDocs(collection(db,"products"));
    totalProductsEl.innerText = snapshot.size;
}

async function getTotalCategories() {
    const snapshot = await getDocs(collection(db,"categories"));
    totalCategoriesEl.innerText = snapshot.size;
}

async function getPendingOrders() {
    const q = query(collection(db,"orders") , where("status" , "==" , "pending"));
    const snapshot = await getDocs(q);
    pendingOrdersEl.innerText = snapshot.size;
    
}

getTotalProducts();
getTotalCategories();
getPendingOrders();



