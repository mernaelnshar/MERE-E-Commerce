// ✅ Import db + Firestore functions من ملفك
import {
  db,
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from "./firebase.js";


// ✅ زرار Login
const goLoginBtn = document.getElementById("goLogin");
if (goLoginBtn) {
  goLoginBtn.addEventListener("click", () => {
    window.location.href = "login.html";
  });
}


// ✅ مكان عرض الريفيوز
const reviewsGrid = document.getElementById("reviewsGrid");


// ✅ رسم النجوم
function renderStars(rate = 5) {
  let starsHtml = "";

  for (let i = 1; i <= 5; i++) {
    if (rate >= i) {
      starsHtml += `<i class="fa-solid fa-star"></i>`;
    } else if (rate >= i - 0.5) {
      starsHtml += `<i class="fa-solid fa-star-half-stroke"></i>`;
    } else {
      starsHtml += `<i class="fa-regular fa-star"></i>`;
    }
  }

  return starsHtml;
}


// ✅ كارت ريفيو
function createReviewCard(r) {
  const name = r.username || "Unknown User";
  const comment = r.comment || "No comment";
  const rate = Number(r.rate || 5);

  const firstLetter = name.trim().charAt(0).toUpperCase();

  return `
    <div class="review-card">
      <div class="review-top">
        <div class="avatar">${firstLetter}</div>
        <div class="info">
          <h3>${name}</h3>
        </div>
      </div>

      <p class="review-text">${comment}</p>

      <div class="stars">
        ${renderStars(rate)}
      </div>
    </div>
  `;
}


// ✅ Load Reviews From Firestore
async function loadReviewsFromFirebase() {
  if (!reviewsGrid) return;

  try {
    reviewsGrid.innerHTML = `<div class="loader">Loading reviews...</div>`;

    // ✅ collection name
    const reviewsRef = collection(db, "reviews");

    // ✅ عرض آخر 3 Reviews فقط
    const q = query(reviewsRef, orderBy("createdAt", "desc"), limit(3));

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      reviewsGrid.innerHTML = `<div class="loader">No reviews added yet.</div>`;
      return;
    }

    reviewsGrid.innerHTML = "";

    snapshot.forEach((doc) => {
      const r = doc.data();
      reviewsGrid.innerHTML += createReviewCard(r);
    });

  } catch (err) {
    console.log(err);
    reviewsGrid.innerHTML = `<div class="loader"> Failed to load reviews</div>`;
  }
}

loadReviewsFromFirebase();
