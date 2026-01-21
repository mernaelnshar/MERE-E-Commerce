// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// إعداد Firebase
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
const db = getFirestore(app);

// Export Firebase
export { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc };
