// ====== Quantity Controls ======
const plusButtons = document.getElementsByClassName("plus");
const minusButtons = document.getElementsByClassName("minus");

// لكل زر + اضغط عليه يزيد العدد
for (let i = 0; i < plusButtons.length; i++) {
  plusButtons[i].onclick = function () {
    const qtySpan = this.previousElementSibling; // الرقم بجانب الزر
    let qty = parseInt(qtySpan.innerText);
    qty++;
    qtySpan.innerText = qty;
    updateSummary(); // تحديث الملخص بعد أي تغيير
  };
}

// لكل زر - اضغط عليه ينقص العدد (لا يقل عن 1)
for (let i = 0; i < minusButtons.length; i++) {
  minusButtons[i].onclick = function () {
    const qtySpan = this.nextElementSibling; // الرقم بجانب الزر
    let qty = parseInt(qtySpan.innerText);
    if (qty > 1) {
      qty--;
      qtySpan.innerText = qty;
      updateSummary(); // تحديث الملخص بعد أي تغيير
    }
  };
}

// ====== Remove Item ======
const removeButtons = document.getElementsByClassName("remove");
for (let i = 0; i < removeButtons.length; i++) {
  removeButtons[i].onclick = function () {
    this.parentElement.remove(); // حذف المنتج من الكارت
    updateSummary(); // تحديث الملخص بعد الحذف
  };
}

// ====== Update Order Summary ======
function updateSummary() {
  const cartItems = document.getElementsByClassName("cart-item");
  let subtotal = 0;

  for (let i = 0; i < cartItems.length; i++) {
    const item = cartItems[i];
    const priceText = item.querySelector(".price").innerText; // "$45.00"
    const price = parseFloat(priceText.replace("$", ""));
    const qty = parseInt(item.querySelector(".qty span").innerText);
    subtotal += price * qty; // السعر × الكمية
  }

  const shipping = 0; // مجاني
  const tax = subtotal * 0.08; // 8% ضريبة كمثال
  const total = subtotal + shipping + tax;

  // تحديث العرض في Order Summary
  const summary = document.querySelector(".summary");
  summary.querySelector(".row span:nth-child(2)").innerText =
    `$${subtotal.toFixed(2)}`;
  summary.querySelector(".total span:nth-child(2)").innerText =
    `$${total.toFixed(2)}`;
}
