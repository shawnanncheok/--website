// src/firebase.js
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// TODO: 改成你自己 Firebase 项目的配置
// 在 Firebase Console -> Project settings -> General -> Your apps 里可以看到
const firebaseConfig = {
  apiKey: "AIzaSyCNUimGhruOhwmxFtwgXqNqXn8c4YjwvmQ",
  authDomain: "jiemu-2a255.firebaseapp.com",
  projectId: "jiemu-2a255",
  storageBucket: "jiemu-2a255.firebasestorage.app",
  messagingSenderId: "819435108488",
  appId: "1:819435108488:web:020be1d0241317bce1c73d",
  measurementId: "G-QWHKQC3NKK"
};

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
