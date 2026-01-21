const totalEl = document.getElementById("total");
const countEl = document.getElementById("count");

let total = 0;
let count = 0;

document.querySelectorAll(".card").forEach(card => {
  const addBtn = card.querySelector(".add-btn");
  const removeBtn = card.querySelector(".remove-btn");
  const price = Number(card.querySelector(".price").dataset.price);

  addBtn.addEventListener("click", () => {
    if (addBtn.classList.contains("added")) return;

    total += price;
    count++;

    updateUI();

    addBtn.textContent = "ADDED";
    addBtn.classList.add("added");
  });

  removeBtn.addEventListener("click", () => {
    if (!addBtn.classList.contains("added")) return;

    total -= price;
    count--;

    updateUI();

    addBtn.textContent = "ADD TO BAG";
    addBtn.classList.remove("added");
  });
});

function updateUI() {
  totalEl.textContent = `$${total.toFixed(2)}`;
  countEl.textContent = count;
}
