import firebase from "firebase/compat/app";
import "firebase/auth"

const app = firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBACE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBACE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBACE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBACE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBACE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBACE_APP_ID,
})


export const auth = app.auth()
export default app