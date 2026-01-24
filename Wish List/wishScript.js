// ===== FIREBASE =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDZmtAma7FFyJVEaHNbRk1ovmqwCO5m1p0",
  authDomain: "goshop-e43f1.firebaseapp.com",
  projectId: "goshop-e43f1",
  storageBucket: "goshop-e43f1.firebasestorage.app",
  messagingSenderId: "788272001640",
  appId: "1:788272001640:web:d0c5adf18daab3ee8e81dd",
  measurementId: "G-K8ME02DXJW",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===== SELECT CONTAINER =====
const wishlistContainer = document.getElementById("wishlistContainer");

// ===== FETCH WISHLIST FOR USER =====
async function fetchWishlist(userId) {
  wishlistContainer.innerHTML = "<p>Loading wishlist...</p>";

  try {
    const wishlistColRef = collection(
      db,
      "wishlists",
      userId,
      "ProductWishlist"
    );

    const wishlistSnapshot = await getDocs(wishlistColRef);

    wishlistContainer.innerHTML = "";

    if (wishlistSnapshot.empty) {
      wishlistContainer.innerHTML = "<p>Your wishlist is empty.</p>";
      return;
    }

    wishlistSnapshot.forEach((docSnap) => {
      const prodData = docSnap.data();

      const div = document.createElement("div");
      div.className = "wishlist-item";
      div.innerHTML = `
        <h3>${prodData.title}</h3>
        <p>Price: $${prodData.price}</p>
      `;

      wishlistContainer.appendChild(div);
    });

  } catch (err) {
    console.error("Error fetching wishlist:", err);
    wishlistContainer.innerHTML = "<p>Failed to load wishlist.</p>";
  }
}

// ===== AUTH LISTENER =====
onAuthStateChanged(auth, (user) => {
  if (user) {
    // المستخدم عامل Login
    const userId = user.uid;
    console.log("Logged in userId:", userId);
    fetchWishlist(userId);
  } else {
    // مش عامل Login
    wishlistContainer.innerHTML =
      "<p>Please login to see your wishlist.</p>";
  }
});

// ===== INIT =====
fetchWishlist("1"); // ضع هنا الـ userId


















// // ===== FIREBASE =====
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// import {
//   getFirestore,
//   collection,
//   getDocs,
// } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// // Firebase config
// const firebaseConfig = {
//   apiKey: "AIzaSyDZmtAma7FFyJVEaHNbRk1ovmqwCO5m1p0",
//   authDomain: "goshop-e43f1.firebaseapp.com",
//   projectId: "goshop-e43f1",
//   storageBucket: "goshop-e43f1.firebasestorage.app",
//   messagingSenderId: "788272001640",
//   appId: "1:788272001640:web:d0c5adf18daab3ee8e81dd",
//   measurementId: "G-K8ME02DXJW",
// };

// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

// // ===== SELECT CONTAINER =====
// const wishlistContainer = document.getElementById("wishlistContainer");

// // ===== FETCH ALL PRODUCTS IN WISHLIST FOR USER =====
// async function fetchWishlist(userId) {
//   wishlistContainer.innerHTML = "<p>Loading wishlist...</p>";

//   try {
//     // احنا هنا بنجيب كل المستندات من subcollection ProductWishlist
//     const wishlistColRef = collection(db, "wishlists", userId, "ProductWishlist");
//     const wishlistSnapshot = await getDocs(wishlistColRef);

//     wishlistContainer.innerHTML = "";

//     if (wishlistSnapshot.empty) {
//       wishlistContainer.innerHTML = "<p>Your wishlist is empty.</p>";
//       return;
//     }

//     // لكل منتج في الـ subcollection نعرضه
//     wishlistSnapshot.forEach((docSnap) => {
//       const prodData = docSnap.data();

//       const div = document.createElement("div");
//       div.className = "wishlist-item";
//       div.innerHTML = `
//         <h3>${prodData.title}</h3>
//         <p>Price: $${prodData.price}</p>
//         <br>
//       `;

//       wishlistContainer.appendChild(div);
//     });

//   } catch (err) {
//     console.error("Error fetching wishlist:", err);
//     wishlistContainer.innerHTML = "<p>Failed to load wishlist.</p>";
//   }
// }

// // ===== INIT =====
// fetchWishlist("1"); // ضع هنا الـ userId

