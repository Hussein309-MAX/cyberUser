import { db } from './firebase-config.js';
import {
  ref,
  set
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";


document.getElementById("score").innerText = localStorage.getItem("quizScore") || "0";
document.getElementById("date").innerText = new Date().toLocaleDateString();
document.getElementById("username").innerText = localStorage.getItem("userName") || "Guest";

document.getElementById("download-btn").addEventListener("click", async () => {
  const name = localStorage.getItem("userName") || "Guest";
  const score = localStorage.getItem("quizScore") || "0";
  const date = new Date().toISOString();

  // Sanitize name for key use (Firebase keys can't contain ".", "#", "$", "[", or "]")
  const keySafeName = name.replace(/[.#$/\[\]]/g, "_");

  try {
    const certRef = ref(db, `certificates/${keySafeName}`);
    await set(certRef, {
      name,
      score,
      date
    });
    console.log("Certificate record saved");
  } catch (err) {
    console.error("Failed to save certificate data:", err);
  }

  // Then generate and download PDF
  const element = document.getElementById("certificate");
  const opt = {
    margin: 0.5,
    filename: 'cyber_certificate.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
});

