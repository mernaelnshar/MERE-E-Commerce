// Import Firebase Core
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

// Import Auth
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// Import Firestore
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  limit,
  where,
  orderBy   
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";




// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDZmtAma7FFyJVEaHNbRk1ovmqwCO5m1p0",
  authDomain: "goshop-e43f1.firebaseapp.com",
  projectId: "goshop-e43f1",
  storageBucket: "goshop-e43f1.firebasestorage.app",
  messagingSenderId: "788272001640",
  appId: "1:788272001640:web:d0c5adf18daab3ee8e81dd",
  measurementId: "G-K8ME02DXJW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Init Services
const auth = getAuth(app);
const db = getFirestore(app);

// Export Everything Needed
export {
  auth,
  db,

  // Auth
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,

  // Firestore
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  limit,
  where,
  orderBy   
};




//***************************************** / API with Firebase **************************************** */

// async function importProductsFromAPI() {
//     try {
//         const statusRef = doc(db, "settings", "importStatus");
//         const statusSnap = await getDoc(statusRef);

//         // لو الداتا اتخزنت قبل كده
//         if (statusSnap.exists() && statusSnap.data().productsImported) {
//             console.log("Products already imported ❌");
//             return;
//         }
//         const response = await fetch("https://fakestoreapi.com/products"); //api
//         const products = await response.json();

//         const limitedProducts = products.slice(0, 20);
        

//         for (let p of limitedProducts) {
//             const categoryId = p.category;

//             const categoryRef = doc(db,"categories",categoryId);
//             const categorySnap = await getDoc(categoryRef);

//             if(!categorySnap.exists()){
//                 await setDoc(categoryRef,{
//                     name: p.category
//                 });
//             }


//             await addDoc(collection(db, "products"), {
//                 title: p.title,
//                 description: p.description,
//                 price: p.price,
//                 category: categoryId,
//                 imageURL: p.image,
//                 stock: 20
//             });

//         }

        
//         // نعلّم إن الاستيراد تم
//         await setDoc(statusRef, {
//             productsImported: true,
//             importedAt: new Date()
//         });

//         console.log("Products imported successfully ✅");

//     }
//     catch (error) {
//         alert(error.message);
//     }

// }

// importProductsFromAPI();
