import { firebaseApp } from './firebaseApp';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
