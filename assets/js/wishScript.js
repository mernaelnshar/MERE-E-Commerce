import { auth, db, onAuthStateChanged, collection, getDocs } from "./firebase.js";

// ===== SELECT CONTAINER =====
const wishlistContainer = document.getElementById("wishlistContainer");

// ===== FETCH WISHLIST =====
async function fetchWishlist(userId) {
  wishlistContainer.innerHTML = "<p>Loading wishlist...</p>";

  try {
    const wishlistRef = collection(db, "wishlists", userId, "ProductWishlist");

    const snapshot = await getDocs(wishlistRef);

    if (snapshot.empty) {
      wishlistContainer.innerHTML = "<p>Your wishlist is empty.</p>";
      return;
    }

    const productsGrid = document.createElement("div");
    productsGrid.className = "products";

    snapshot.forEach((docSnap) => {
      const product = docSnap.data();

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <img src="${product.image || "assets/images/no-image.png"}">
        <h3>${product.title}</h3>
        <span class="price">$${product.price}</span>

        <div class="actions">
          <button class="remove-btn">Remove</button>
        </div>
      `;

      // ===== REMOVE BUTTON =====
      card.querySelector(".remove-btn").addEventListener("click", async () => {
        await deleteDoc(
          doc(db, "wishlists", userId, "ProductWishlist", docSnap.id),
        );

        card.remove();

        // لو فاضية بعد الحذف
        if (!productsGrid.children.length) {
          wishlistContainer.innerHTML = "<p>Your wishlist is empty.</p>";
        }
      });

      productsGrid.appendChild(card);
    });

    wishlistContainer.innerHTML = "";
    wishlistContainer.appendChild(productsGrid);
  } catch (error) {
    console.error(error);
    wishlistContainer.innerHTML = "<p>Failed to load wishlist.</p>";
  }
}

// ===== AUTH LISTENER =====
onAuthStateChanged(auth, (user) => {
  if (user) {
    fetchWishlist(user.uid);
  } else {
    wishlistContainer.innerHTML = "<p>Please login to view your wishlist.</p>";
  }
});

// ===== INIT =====

// fetchWishlist("1"); // ضع هنا الـ userId
