import { db, collection, getDocs, doc, setDoc, getDoc } from "./firebase.js";
import { getAuth, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth();
var productsRef = collection(db, "products");
var categoriesRef = collection(db, "categories");
let section = document.querySelector(".products");
let categoriesDiv = document.querySelector(".categoreis");
const reviewsRef = collection(db, "reviews");
let reviewsMap = {};
let allProducts = [];       
let filteredProducts = []; 


function getCurrentUser() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      resolve(user);
    });
  });
}

async function getCategories() {
  let snapshot = await getDocs(categoriesRef);
  snapshot.forEach((docItem) => {
    let cat = docItem.data(); 

    // create <a>
    let catLink = document.createElement("a");
    catLink.className = "category";
    catLink.href = "#";
    catLink.dataset.category = cat.name;

    //  left div
    let leftDiv = document.createElement("div");
    leftDiv.className = "left";

    //  icon
    let iconSpan = document.createElement("span");
    let iconImg = document.createElement("img");
    iconImg.src = cat.icon || "/assets/armchair.png";
    iconImg.alt = cat.name;
    iconSpan.appendChild(iconImg);

    //  name
    let nameSpan = document.createElement("span");
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
  let snapshot = await getDocs(productsRef);
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
    const reviewData = reviewsMap[product.id];
    // console.log(reviewData?.avg,product.id)
    const ratingDiv = createStarRating(
    reviewData?.avg || 0,
    reviewData?.count || 0
    );
    // console.log(reviewData.avg )

    // add to cart
    var addToCartDiv = document.createElement("div");
    addToCartDiv.className = "addToCard";

    var btn = document.createElement("button");

    var icon = document.createElement("i");
    icon.className = "fas fa-cart-shopping";

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
  const snapshot = await getDocs(reviewsRef);
  const temp = {};

  snapshot.forEach((doc) => {
    const data = doc.data();
    const productId = data.productId;
    if (!temp[productId]) {
      temp[productId] = { total: 0, count: 0 };
    }

    temp[productId].total += data.rating;
    temp[productId].count++;
    
  });

  for (let id in temp) {
    reviewsMap[id] = {
      avg:  Number((temp[id].total / temp[id].count).toFixed(1)),
      count: temp[id].count
    };
  }

}


async function addToCart(productId) {
  const user = await getCurrentUser();

  if (!user) {
    alert("Please login first!");
    return;
  }

  let cart = JSON.parse(localStorage.getItem("Cart")) || [];

  let index = cart.findIndex(
    item => item.Product === productId && item.userid === user.uid
  );

  if (index === -1) {
    cart.push({
      userid: user.uid,
      Product: productId,
      Quantity: 1
    });
  } else {
    cart[index].Quantity++;
  }

  localStorage.setItem("Cart", JSON.stringify(cart));
}


async function addToWishList(proWish) {
  const user = await getCurrentUser();

  if (!user) {
    alert("Please login first!");
    return;
  }

  const wishRef = doc(db,"wishlists",user.uid,"ProductWishlist",proWish.id);

  const wishSnap = await getDoc(wishRef);

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
  let minRange = parseFloat(document.getElementById("minRange").value) || 0;
  let maxRange = parseFloat(document.getElementById("maxRange").value) || Infinity;

  let searchValue = document.getElementById("Search").value.toLowerCase().trim();

  let activeCategory = document.querySelector(".category.activeCategory");
  let selectedCategory = activeCategory ? activeCategory.dataset.category : "All";

  filteredProducts = allProducts.filter((product) => {
    let priceOk = product.price >= minRange && product.price <= maxRange;

    let categoryOk =
      selectedCategory === "All" ? true : product.category === selectedCategory;

    let searchOk =
      product.title.toLowerCase().includes(searchValue) ||
      product.description.toLowerCase().includes(searchValue);

    return priceOk && categoryOk && searchOk;
  });
  let passfiltercat=selectedCategory

  renderProducts(filteredProducts,passfiltercat);
}

// filter by price button
function setupPriceFilter() {
  let btnFilter = document.getElementById("filter");

  btnFilter.addEventListener("click", function () {
    // debugger
    applyFilters();
  });
}

function setupReset() {
  let resetBtn = document.querySelector(".reset input[type='reset']");

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

function setupSearchLive() {
  let searchInput = document.getElementById("Search");

  searchInput.addEventListener("keyup", function () {
    applyFilters();
  });
}
function createStarRating(avg = 0, count = 0) {
  const starDiv = document.createElement("div");
  starDiv.className = "star-rating";

  const fullStars = Math.floor(avg);
  const hasHalf = avg - fullStars >= 0.5;
    // debugger
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("i");

    if (i <= fullStars) {
      star.className = "fa-solid fa-star";
    } else if (i === fullStars + 1 && hasHalf) {
      star.className = "fa-solid fa-star-half-stroke";
    } else {
      star.className = "fa-regular fa-star";
    }

    starDiv.appendChild(star);
  }

  const text = document.createElement("span");
  text.textContent = ` (${count})`;
  starDiv.appendChild(text);

  return starDiv;
}


let setupDone = false;

onAuthStateChanged(auth, async (user) => {
  await getReviews();
  await getProducts();
  await getCategories();

  if (!setupDone) {
    setupReset();
    setupSearchLive();
    setupPriceFilter();
    setupDone = true;
  }
});









