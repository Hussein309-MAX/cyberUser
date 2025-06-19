// Use same config from your Firebase project
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBbsKHvS4sAAy9gN9--k4qB3U-0sRcQxN0",
  authDomain: "cybersecurity-awareness-58ea0.firebaseapp.com",
  projectId: "cybersecurity-awareness-58ea0",
  storageBucket: "cybersecurity-awareness-58ea0.firebasestorage.app",
  messagingSenderId: "586812537394",
  appId: "1:586812537394:web:3a553a9fb430e529e59a2b",
  measurementId: "G-VTQ7LBY8W5"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
