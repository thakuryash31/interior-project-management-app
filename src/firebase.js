import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC8YhNIv62Go7mxfkUGntBTRhgNurTiD10",
  authDomain: "interior-pm-app.firebaseapp.com",
  projectId: "interior-pm-app",
  storageBucket: "interior-pm-app.firebasestorage.app",
  messagingSenderId: "950131054896",
  appId: "1:950131054896:web:e7b58c9bf83219c91e10f5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;