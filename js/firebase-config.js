// Use same config from your Firebase project
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCv_9O2ZhC9jW2C9L-2vNhOjoMbTQdGi5Y",
    authDomain: "student-fee-admission-system.firebaseapp.com",
    databaseURL: "https://student-fee-admission-system-default-rtdb.firebaseio.com",
    projectId: "student-fee-admission-system",
    storageBucket: "student-fee-admission-system.firebasestorage.app",
    messagingSenderId: "1009657295375",
    appId: "1:1009657295375:web:2ba9d5498165803e52e97a",
    measurementId: "G-2WV05SNF56"
  };

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
