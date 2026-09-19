/* ==========================================================================
   RefSim — Inicialización de Firebase (módulo ES)
   Cárgalo con: <script type="module" src="firebase-init.js"></script>
   Expone window.refSimFirebase, que common.js consume para la autenticación
   y la sincronización de progreso en la nube.
   ========================================================================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    arrayUnion
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCQhvaVlLdX56ZbOxndecX9QuJ3Y1Ox5vA",
    authDomain: "refsim-c2241.firebaseapp.com",
    projectId: "refsim-c2241",
    storageBucket: "refsim-c2241.firebasestorage.app",
    messagingSenderId: "254585050294",
    appId: "1:254585050294:web:d889e356479178e43ec217",
    measurementId: "G-69FHB3QDV1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.refSimFirebase = {
    auth,
    db,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    arrayUnion
};

console.log("Firebase conectado correctamente en RefSim");
