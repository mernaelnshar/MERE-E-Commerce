const buttons = document.querySelectorAll(".return-btn");

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.classList.contains("pending")) return;

    button.textContent = "Pending Admin Approval";
    button.classList.add("pending");
    button.disabled = true;

    const status = button.closest(".order-card").querySelector(".status");

    status.textContent = "PENDING";
    status.className = "status pending";
  });
});
