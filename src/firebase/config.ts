import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCCK260JRh5gaAuDlfBS-HbWnBrqeaDqhM",
  authDomain: "bingo-6db1b.firebaseapp.com",
  databaseURL: "https://bingo-6db1b-default-rtdb.firebaseio.com",
  projectId: "bingo-6db1b",
  storageBucket: "bingo-6db1b.firebasestorage.app",
  messagingSenderId: "896287671562",
  appId: "1:896287671562:web:b37e43f7a9d723e90ae6f3",
  measurementId: "G-PJRMX941SM"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);