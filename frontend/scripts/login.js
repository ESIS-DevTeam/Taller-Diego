import { showNotification } from "./utils/notification.js";
import { obtainToken } from "./utils/store/manager-key.js";

function loginActions() {
  const form = document.querySelector(".form-login");
  const userInput = document.getElementById("user-email");
  const passwordInput = document.getElementById("user-key");

  
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = await obtainToken(userInput.value, passwordInput.value);
    
    if(!data) {
      console.error('Intente de nuevo');
    }else{
      const token = data.session.access_token;
      const user = data.user;
      console.log(`Token: ${token}`);
      console.log(`Usuario: ${user.email}`);
      localStorage.setItem('supabase_token', token);
      localStorage.setItem('user_email', user.email);
      window.location.href = "../views/index.html";
    }

  });
}

document.addEventListener('DOMContentLoaded', loginActions);