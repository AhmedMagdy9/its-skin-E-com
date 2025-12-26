import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD291YDGaP1l1cykGnF81RR6bb4reIoKNs",
  authDomain: "its-skin-db.firebaseapp.com",
  projectId: "its-skin-db",
  storageBucket: "its-skin-db.firebasestorage.app",
  messagingSenderId: "339710916298",
  appId: "1:339710916298:web:656d3bc8711da28161e633",
  measurementId: "G-M7G9H57L67"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
