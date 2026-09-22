import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBFIYr5Jd0HNPl_K-jVEsHMN6Akz-ogPNY",
  authDomain: "manejo-tdah-tod.firebaseapp.com",
  projectId: "manejo-tdah-tod",
  storageBucket: "manejo-tdah-tod.firebasestorage.app",
  messagingSenderId: "884417815251",
  appId: "1:884417815251:web:d05d795ce865f4737eea26"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };