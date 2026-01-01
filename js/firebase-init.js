/**
 * Firebase Initialization - Shared across all pages
 */

// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore, collection, query, where, getDocs, getDoc, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getStorage, ref, listAll, deleteObject } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCaD-W58OcmtiaaDpTxzH9HSJrv070-APo",
    authDomain: "upasthiti3544.firebaseapp.com",
    projectId: "upasthiti3544",
    storageBucket: "upasthiti3544.firebasestorage.app",
    messagingSenderId: "315766208745",
    appId: "1:315766208745:android:3f7582fcb6e5e360549878"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Make Firebase instances globally available
window.firebaseAuth = auth;
window.firebaseDb = db;
window.firebaseStorage = storage;
window.firebaseFunctions = {
    signInWithEmailAndPassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    deleteUser,
    signOut,
    collection,
    query,
    where,
    getDocs,
    getDoc,
    deleteDoc,
    doc,
    ref,
    listAll,
    deleteObject
};

