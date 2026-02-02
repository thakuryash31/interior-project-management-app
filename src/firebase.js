import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC8YhNIv62Go7mxfkUGntBTRhgNurTiD10",
  authDomain: "interior-pm-app.firebaseapp.com",
  projectId: "interior-pm-app",
  storageBucket: "interior-pm-app.firebasestorage.app",
  messagingSenderId: "950131054896",
  appId: "1:950131054896:web:e7b58c9bf83219c91e10f5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);