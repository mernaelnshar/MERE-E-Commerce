import {db, collection, getDocs, query, where , doc , getDoc , setDoc , addDoc , updateDoc} from "./firebase.js";

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



// *************************************************************************
