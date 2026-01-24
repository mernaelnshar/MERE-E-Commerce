import { 
  db,
  auth,
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  onAuthStateChanged,signOut
} from "./firebase/firebase.js"; 



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

var productsRef = collection(db, "products");
var categoriesRef = collection(db, "categories");
var section = document.querySelector(".products");
var categoriesDiv = document.querySelector(".categoreis");
var reviewsRef = collection(db, "reviews");
var reviewsMap = {};
var allProducts = [];       
var filteredProducts = []; 

function requireAuth() {
    const user = auth.currentUser;
    if (!user) {
        alert("Please login first!");
        window.location.href = "login.html";
        return null;
    }
    return user;
}



async function getCategories() {
  var snapshot = await getDocs(categoriesRef);
  snapshot.forEach((docItem) => {
    var cat = docItem.data(); 

    // create <a>
    var catLink = document.createElement("a");
    catLink.className = "category";
    catLink.href = "#";
    catLink.dataset.category = cat.name;

    //  left div
    var leftDiv = document.createElement("div");
    leftDiv.className = "left";

    //  icon
    var iconSpan = document.createElement("span");
    var iconImg = document.createElement("img");
    iconImg.src = cat.icon || "./logos/armchair.png";
    iconImg.alt = cat.name;
    iconSpan.appendChild(iconImg);

    //  name
    var nameSpan = document.createElement("span");
    nameSpan.textContent = cat.name;

    leftDiv.appendChild(iconSpan);
    leftDiv.appendChild(nameSpan);



    //  append to link
    catLink.appendChild(leftDiv);

    //  append category inside categoriesDiv
    categoriesDiv.appendChild(catLink);

    //  click event filter
    catLink.addEventListener("click", function (e) {
      e.preventDefault();

      // remove active from all
      document.querySelectorAll(".category").forEach((c) => {
        c.classList.remove("activeCategory");
      });

      // add active to clicked
      catLink.classList.add("activeCategory");

      applyFilters();
    });
  });
}
async function getProducts() {
  var snapshot = await getDocs(productsRef);
  allProducts = [];
  snapshot.forEach((docItem) => {
    allProducts.push({ id: docItem.id, ...docItem.data() });
  });

  filteredProducts = [...allProducts];
  renderProducts(filteredProducts);


}


function renderProducts(products,...pass) {
  section.innerHTML = "";

  if (products.length === 0) {
    section.innerHTML = `<p style="padding:20px;font-size:18px;">No products found</p>`;
    return;
  }
  var path=document.getElementById('passlink')
  path.innerText=`${pass}`
  products.forEach((product) => {
    var productDiv = document.createElement("div");
    productDiv.className = "product";

    var img = document.createElement("img");
    img.src = product.imageURL || "";
    img.alt = product.title;

    var priceTitleDiv = document.createElement("div");
    priceTitleDiv.className = "price-title";

    var title = document.createElement("h3");
    title.textContent = product.title;

    var price = document.createElement("span");
    price.textContent = "$" + product.price;

    priceTitleDiv.appendChild(title);
    priceTitleDiv.appendChild(price);

    var desc = document.createElement("p");
    desc.textContent = product.description;
    // STAR RATING  
    // console.log(reviewData?.avg )
    var reviewData = reviewsMap[product.id];
    // console.log(reviewData?.avg,product.id)
    var ratingDiv = createStarRating(
    reviewData?.avg || 0,
    reviewData?.count || 0
    );
    // console.log(reviewData.avg )

    // add to cart
    var addToCartDiv = document.createElement("div");
    addToCartDiv.className = "addToCard";

    var btn = document.createElement("button");
    btn.style.color='#ffffff'

    var icon = document.createElement("i");
    icon.className = "fas fa-cart-shopping";
    icon.style.color='white'

    btn.appendChild(icon);
    btn.appendChild(document.createTextNode(" Quick Add"));
    addToCartDiv.appendChild(btn);

    btn.addEventListener("click", function () {
        
        addToCart(product.id);
    });

    // wishlist
    var addToWishListDiv = document.createElement("div");
    addToWishListDiv.className = "addToWishList";

    var btnWishList = document.createElement("button");
    var iconwish = document.createElement("i");
    iconwish.className = "fa-regular fa-heart";
    btnWishList.appendChild(iconwish);

    addToWishListDiv.appendChild(btnWishList);
    btnWishList.addEventListener('click',function(){
        addToWishList(product)
        iconwish.classList.remove("fa-regular");
        iconwish.classList.add("fa-solid");
        iconwish.style.color = "rgb(178, 18, 157)";
    })

    productDiv.appendChild(img);
    productDiv.appendChild(priceTitleDiv);
    productDiv.appendChild(desc);
    productDiv.appendChild(ratingDiv);
    productDiv.appendChild(addToCartDiv);
    productDiv.appendChild(addToWishListDiv);
    title.addEventListener('click',function(){
        location.assign(`product-details.html?id=${product.id}`)
    })
    section.appendChild(productDiv);
  });
}
async function getReviews() {
  var snapshot = await getDocs(reviewsRef);
  var temp = {};

  snapshot.forEach((doc) => {
    var data = doc.data();
    var productId = data.productId;
    if (!temp[productId]) {
      temp[productId] = { total: 0, count: 0 };
    }

    temp[productId].total += data.rating;
    temp[productId].count++;
    
  });

  for (var id in temp) {
    reviewsMap[id] = {
      avg:  Number((temp[id].total / temp[id].count).toFixed(1)),
      count: temp[id].count
    };
  }

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



async function addToWishList(proWish) {
    var user = requireAuth();
    if (!user) return;

    var wishRef = doc(db, "wishlists", user.uid, "ProductWishlist", proWish.id);
    var wishSnap = await getDoc(wishRef);

    if (wishSnap.exists()) {
        alert("This product is already in your wishlist");
        return;
    }

    await setDoc(wishRef, {
        title: proWish.title,
        price: proWish.price,
        image: proWish.imageURL,
        createdAt: new Date()
    });

    alert("Added to wishlist successfully");
}




function applyFilters() {
  var minRange = parseFloat(document.getElementById("minRange").value) || 0;
  var maxRange = parseFloat(document.getElementById("maxRange").value) || Infinity;

 

  var activeCategory = document.querySelector(".category.activeCategory");
  var selectedCategory = activeCategory ? activeCategory.dataset.category : "All";

  filteredProducts = allProducts.filter((product) => {
    var priceOk = product.price >= minRange && product.price <= maxRange;

    var categoryOk =
      selectedCategory === "All" ? true : product.category === selectedCategory;


    return priceOk && categoryOk;
  });
  var passfiltercat=selectedCategory

  renderProducts(filteredProducts,passfiltercat);
}

// filter by price button
function setupPriceFilter() {
  var btnFilter = document.getElementById("filter");

  btnFilter.addEventListener("click", function () {
    // debugger
    applyFilters();
  });
}

function setupReset() {
  var resetBtn = document.querySelector(".reset input[type='reset']");

  resetBtn.addEventListener("click", function () {
    // remove active category
    document.querySelectorAll(".category").forEach((c) => {
      c.classList.remove("activeCategory");
    });

    // reset inputs
    document.getElementById("Search").value = "";
    document.getElementById("minRange").value = "";
    document.getElementById("maxRange").value = "";

    // show all products
    filteredProducts = [...allProducts];
    renderProducts(filteredProducts);
  });
}


function createStarRating(avg = 0, count = 0) {
  var starDiv = document.createElement("div");
  starDiv.className = "star-rating";

  var fullStars = Math.floor(avg);
  var hasHalf = avg - fullStars >= 0.5;
    // debugger
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
  text.textContent = ` (${count})`;
  starDiv.appendChild(text);

  return starDiv;
}


var setupDone = false;

onAuthStateChanged(auth, async (user) => {
  await getReviews();
  await getProducts();
  await getCategories();

  if (!setupDone) {
    setupReset();
    setupPriceFilter();
    setupDone = true;
  }
});







