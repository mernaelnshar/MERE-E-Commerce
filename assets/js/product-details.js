import {
  db,
  auth,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  onAuthStateChanged,
  signOut,
  query,
  where,
  orderBy
} from "./firebase.js";

document.querySelector(".logout-btn").addEventListener("click", async () => {
    try {
        await signOut(auth);  
        window.location.href = "login.html"; 
    } catch (error) {
        console.error("Logout error:", error);
        alert("Error logging out. Please try again.");
    }
});
function requireAuth() {
    const user = auth.currentUser;
    if (!user) {
        window.location.href = "login.html";
        return null;
    }
    return user;
}
var productRef = collection(db, "products");

var reviewsRef = collection(db, "reviews");
var reviewsMap = {};
var mainContent=document.querySelector('.main')
var rating = 0;
var addToWishBtn   = document.querySelector(".addtowishlist");
var params = new URLSearchParams(window.location.search);
var productId = params.get("id");

if (!productId) {
  alert("Product not found");
}

async function getProductDetails() {
        var user = requireAuth();
        if (!user) return;
        var productRef = doc(db, "products", productId);
        var snap = await getDoc(productRef);
        if(!snap){
          mainContent.innerHTML = `<p style="padding:20px;font-size:18px;">No product with this id</p>`;
        }

        
        var product = snap.data();
        // breadcrumb
        var catNameEl   = document.querySelector("#catName");
        catNameEl.textContent = `${product.category}`;
        var proNameEl   = document.querySelector("#proName");
        proNameEl.textContent = `${product.title}`;
        
        // main product section
        var productImgEl   = document.querySelector(".main-image img");
        productImgEl.src = `${product.imageURL}`;
        var productTitleEl = document.querySelector(".details h3");
        productTitleEl.textContent = `${product.title}`;
        var productPriceEl = document.querySelector(".price span");
        productPriceEl.textContent = `$${product.price}`;
        var stockStatusEl  = document.querySelector(".stock-desc span");
        var unitsEl        = document.querySelector("#units");
        if (product.stock){
            stockStatusEl.style.color='green'
            unitsEl.textContent=`${product.stock}`
            var addToCartBtn   = document.querySelector(".addtocart");
              addToCartBtn.addEventListener("click", function () {
                addToCart(snap.id);
                });



          }
          else{
            stockStatusEl.style.color='red'
            stockStatusEl.textContent='Out Of Stock'
            unitsEl.textContent='0'
            unitsEl.style.color='red'
            var btnaddtocart=document.querySelector('.btnaddtocart')
            var addToCartBtn   = document.querySelector(".addtocart");
            btnaddtocart.style.display='none'
            addToCartBtn.style.display='none'
            }

        // buttons

        addToWishBtn.addEventListener('click',function(){
            addToWishList(product,snap.id)
        })
        // description
        var descTextEl     = document.querySelector(".description p");
        descTextEl.textContent = `${product.description}`;

        // rating / reviews 
        var ratingDiv=createStarRating(reviewsMap.avg,reviewsMap.count)
        var rate = document.querySelector(".details .rate")
          rate.appendChild(ratingDiv)

        // customer feedback
        var commentTextarea = document.querySelector("#comment");
        var submitReviewBtn = document.querySelector(".submit-a a");
        submitReviewBtn.addEventListener('click',function(){
          var comment=commentTextarea.value
          createreview(comment,snap.id,rating)
        })



          await renderReviews(snap.id);
  

    


}






async function getReviews() {
  var snapshot = await getDocs(reviewsRef);
  var temp = {};

  snapshot.forEach((doc) => {
    var data = doc.data();
    var reveId = data.productId;
    if(reveId==productId){
      if (!temp[reveId]) temp[reveId] = { total: 0, count: 0 };
    temp[reveId].total += data.rating;
    temp[reveId].count++;
    }
    
  });

    if (temp[productId]) {
    reviewsMap = {
      avg: Number((temp[productId].total / temp[productId].count).toFixed(1)),
      count: temp[productId].count
    };
    } 
    else {
      reviewsMap = { avg: 0, count: 0 };
    }


}

async function getProductReviews(productId) {
  const q = query(
    collection(db, "reviews"),
    where("productId", "==", productId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}


async function renderReviews(productId) {
  const reviewsContainer = document.querySelector(".allreviewcustomers");
  reviewsContainer.innerHTML = ""; 

  const reviews = await getProductReviews(productId);

  if (reviews.length === 0) {
    reviewsContainer.innerHTML = `<p>No reviews yet</p>`;
    return;
  }

  reviews.forEach(review => {
    const date = review.createdAt?.toDate().toLocaleDateString();
    const reviewDiv = document.createElement("div");
    reviewDiv.className = "review";

    reviewDiv.innerHTML = `
      <div class="userdetailsandrevi">
        <div class="userdata">
          <span>${review.username}</span>
          <h5>${date}</h5>
        </div>
        <div class="stars">
          ${renderStars(review.rating)}
        </div>
      </div>
      <p>${review.comment}</p>
    `;

    reviewsContainer.appendChild(reviewDiv);
  });
}


function renderStars(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    stars += `<i class="fa-solid fa-star ${i <= rating ? "active" : ""}"></i>`;
  }
  return stars;
}


function createStarRating(avg = 0, count = 0) {
  var starDiv = document.createElement("div");
  starDiv.className = "star-rating";

  var fullStars = Math.floor(avg);
  var hasHalf = avg - fullStars >= 0.5;
  for (var i = 1; i <= 5; i++) {
    var star = document.createElement("i");

    if (i <= fullStars) {
      star.className = "fa-solid fa-star";
    } else if (i === fullStars + 1 && hasHalf) {
      star.className = "fa-solid fa-star-half-stroke";
    } else {
      star.className = "fa-regular fa-star";
    }

    starDiv.appendChild(star);
  }

  var text = document.createElement("span");
  text.textContent = ` (${count} customer Review)`;
  starDiv.appendChild(text);

  return starDiv;
}

async function addToCart(productId) {
    var user = requireAuth();
    if (!user) return;

    var cart = JSON.parse(localStorage.getItem("Cart")) || [];
    var index = cart.findIndex(item => item.Product === productId && item.userid === user.uid);

    if (index === -1) {
        cart.push({ userid: user.uid, Product: productId, Quantity: 1 });
        alert('The product was added to cart');
    } else {
        cart[index].Quantity++;
        alert('The product quantity increased by 1 in cart');
    }

    localStorage.setItem("Cart", JSON.stringify(cart));
}
async function createreview(comment, proId, rate) {
  if (!comment || !proId || !rate) {
    alert("All fields are required to submit a review.");
    return;
  }
    var user = requireAuth();
    if (!user) return;
  
  

    var reviewRef = doc(collection(db, "reviews"));
    await setDoc(reviewRef, {
      comment: comment,
      productId: proId,
      rating: Number(rate),
      userid: user.uid,
      username: user.displayName,
      createdAt: new Date() 
    });

    alert("Review submitted successfully!");

    await getReviews();
    var rateDiv = document.querySelector(".details .rate .star-rating");
    if (rateDiv) rateDiv.remove();
    var ratingDiv = createStarRating(reviewsMap.avg, reviewsMap.count);
    document.querySelector(".details .rate").appendChild(ratingDiv);

    document.querySelector("#comment").value = "";
    rating = 0;


}


async function addToWishList(proWish,proWishId) {


      var user = requireAuth();
      if (!user) return;


    var wishRef = doc(db,"wishlists",user.uid,"ProductWishlist",proWishId);

    var wishSnap = await getDoc(wishRef);

    if (wishSnap.exists()) {
      alert("This product is already in your wishlist");
      addToWishBtn.style.backgroundColor='red'
      return;
    }

    await setDoc(wishRef, {
      title: proWish.title,
      price: proWish.price,
      image: proWish.imageURL,
      createdAt: new Date()
    });

    alert("Added to wishlist successfully");
    addToWishBtn.style.backgroundColor='red'

}


const stars = document.querySelectorAll('.stars i');


stars.forEach(star => {
    star.addEventListener('click', () => {
        rating = star.getAttribute('data-value');
        updateStars(rating);
    });

    star.addEventListener('mouseover', () => {
        updateStars(star.getAttribute('data-value'));
    });

    star.addEventListener('mouseout', () => {
        updateStars(rating);
    });
});

function updateStars(value) {
    stars.forEach(star => {
        if (star.getAttribute('data-value') <= value) {
            star.classList.add('filled');
            star.classList.replace('fa-regular','fa-solid');
        } else {
            star.classList.remove('filled');
            star.classList.replace('fa-solid','fa-regular');
        }
    });
}


onAuthStateChanged(auth, async (user) => {
    if (!user) {
    window.location.href = "login.html";
    return;
  }

  await getReviews();
  getProductDetails();
  document.body.style.display = "block";



});