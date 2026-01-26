import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyDZmtAma7FFyJVEaHNbRk1ovmqwCO5m1p0",
  authDomain: "goshop-e43f1.firebaseapp.com",
  projectId: "goshop-e43f1",
  storageBucket: "goshop-e43f1.firebasestorage.app",
  messagingSenderId: "788272001640",
  appId: "1:788272001640:web:d0c5adf18daab3ee8e81dd",
  measurementId: "G-K8ME02DXJW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const adminRegex = /^(?=.*\d)[a-zA-Z0-9._%+-]+@eud\.com$/;
const customerRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

// ✅ Password Regex: حروف + أرقام + رموز عادي (8 أو أكثر)
const passwordRegex = /^[A-Za-z\d@$!%*?&._#^+=-]{8,}$/;

const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const title = document.getElementById("title");
const subtitle = document.getElementById("subtitle");
const nameGroup = document.getElementById("nameGroup");
const confirmGroup = document.getElementById("confirmGroup");
const fullName = document.getElementById("fullName");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const submitBtn = document.getElementById("submitBtn");
const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const passError = document.getElementById("passError");
const confirmError = document.getElementById("confirmError");
const msgBox = document.getElementById("msgBox");
const authForm = document.getElementById("authForm");
const togglePass = document.getElementById("togglePass");
const toggleConfirm = document.getElementById("toggleConfirm");

let mode = "login";

function detectRole(mail) {
  if (adminRegex.test(mail)) return "admin";
  if (customerRegex.test(mail)) return "customer";
  return "unknown";
}

function showError(el, show) {
  el.style.display = show ? "block" : "none";
}

function showMsg(text, type) {
  msgBox.style.display = "block";
  msgBox.className = "msg " + type;
  msgBox.textContent = text;
}

function hideMsg() {
  msgBox.style.display = "none";
  msgBox.textContent = "";
  msgBox.className = "msg";
}

function togglePassword(input) {
  input.type = input.type === "password" ? "text" : "password";
}

togglePass.addEventListener("click", () => togglePassword(password));
toggleConfirm.addEventListener("click", () => togglePassword(confirmPassword));

loginTab.onclick = () => {
  mode = "login";
  loginTab.classList.add("active");
  registerTab.classList.remove("active");
  title.textContent = "Welcome Back";
  subtitle.textContent = "Login to your account to continue.";
  nameGroup.style.display = "none";
  confirmGroup.style.display = "none";
  submitBtn.textContent = "Login";
  hideMsg();
};

registerTab.onclick = () => {
  mode = "register";
  registerTab.classList.add("active");
  loginTab.classList.remove("active");
  title.textContent = "Create Account";
  subtitle.textContent = "Register now to start shopping.";
  nameGroup.style.display = "block";
  confirmGroup.style.display = "block";
  submitBtn.textContent = "Create Account";
  hideMsg();
};

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideMsg();

  const mail = email.value.trim();
  const pass = password.value.trim();
  const name = fullName.value.trim();
  const confirm = confirmPassword.value.trim();

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);

  // ✅ تعديل التحقق من الباسورد: طول + Regex (حروف/أرقام/رموز)
  const passValid = passwordRegex.test(pass);

  // ✅ تعديل شرط الاسم: مايقبلش أقل من 4 حروف
  const nameValid = mode === "login" ? true : name.length >= 4;

  const confirmValid = mode === "login" ? true : (confirm === pass && passwordRegex.test(confirm));

  showError(emailError, !emailValid);
  showError(passError, !passValid);
  showError(nameError, !nameValid);
  showError(confirmError, !confirmValid);

  if (!emailValid || !passValid || !nameValid || !confirmValid) return;

  const role = detectRole(mail);
  if (role === "unknown") {
    showMsg("Invalid email format. Use @gmail.com or @eud.com", "fail");
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = mode === "register" ? "Creating..." : "Logging in...";

    if (mode === "register") {
      const userCredential = await createUserWithEmailAndPassword(auth, mail, pass);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      await setDoc(doc(db, 'users', user.uid), {
        fullName: name,
        email: mail,
        role: role,
        createdAt: new Date().toISOString()
      });

      showMsg("Account created successfully. Redirecting...", "success");

      setTimeout(() => {
        if (role === "admin") window.location.href = "dashboard.html";
        else window.location.href = "products.html";
      }, 900);

    } else {
      const userCredential = await signInWithEmailAndPassword(auth, mail, pass);
      const user = userCredential.user;

      const userRole = detectRole(mail);

      showMsg("Login successful. Redirecting...", "success");

      setTimeout(() => {
        if (userRole === "admin") window.location.href = "dashboard.html";
        else window.location.href = "products.html";
      }, 900);
    }
  } catch (error) {
    submitBtn.disabled = false;
    submitBtn.textContent = mode === "register" ? "Create Account" : "Login";

    let errorMsg = "An error occurred. Please try again.";
    
    if (error.code === 'auth/email-already-in-use') {
      errorMsg = "This email is already registered";
    } else if (error.code === 'auth/invalid-email') {
      errorMsg = "Invalid email address";
    } else if (error.code === 'auth/user-not-found') {
      errorMsg = "Wrong email or password";
    } else if (error.code === 'auth/wrong-password') {
      errorMsg = "Wrong email or password";
    } else if (error.code === 'auth/weak-password') {
      errorMsg = "Password is too weak";
    } else if (error.code === 'auth/invalid-credential') {
      errorMsg = "Wrong email or password";
    }

    showMsg(errorMsg, "fail");
  }
});
