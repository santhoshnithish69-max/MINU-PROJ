import { getSupabaseClient } from "./supabase.js";

const form = document.getElementById("authForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const message = document.getElementById("authMessage");
const loginButton = document.getElementById("loginButton");
const signupButton = document.getElementById("signupButton");

function showMessage(text, kind = "") {
    message.textContent = text;
    message.className = `auth-message ${kind}`.trim();
}

async function authenticate(action) {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    loginButton.disabled = true;
    signupButton.disabled = true;
    showMessage(action === "signup" ? "Creating your account..." : "Signing in...");

    try {
        const supabase = getSupabaseClient();
        const result = action === "signup"
            ? await supabase.auth.signUp({
                email,
                password,
                options: { emailRedirectTo: new URL("home.html", window.location.href).href }
            })
            : await supabase.auth.signInWithPassword({ email, password });

        if (result.error) throw result.error;

        if (action === "signup" && !result.data.session) {
            showMessage("Check your email for a confirmation link to finish creating your account.", "success");
            return;
        }

        window.location.href = "home.html";
    } catch (error) {
        showMessage(error.message || "Authentication failed. Please try again.", "error");
    } finally {
        loginButton.disabled = false;
        signupButton.disabled = false;
    }
}

form.addEventListener("submit", event => {
    event.preventDefault();
    authenticate("login");
});

signupButton.addEventListener("click", () => {
    if (form.reportValidity()) authenticate("signup");
});