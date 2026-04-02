"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/lib/firebase/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function SignUp() {
  const router = useRouter();
  /*--------- state for registeration ----------*/
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState("");
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [errorM, setErrorM] = useState("");
  const [succecMassage, setSuccecMassage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  /*--------- register logic ----------*/
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log(email, password, passwordMatch);

    /*--------- input must not be empty ----------*/
    if (!password || !email || !passwordMatch || !name) {
      console.log("Password is empty");
      setErrorM("Alla fält måste fyllas");
      setLoading(false);
      return;
    }

    /*--------- password must be longer than 6 ----------*/
    if (password.length < 6) {
      setErrorM("lösenord måste vara minst 6st");
      setPassword("");
      setPasswordMatch("");
      setLoading(false);
      return;
    }
    if (password === passwordMatch) {
      console.log("password match!");
      setErrorM("");
      setSuccecMassage("");
      try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const userId = res.user.uid;

        let profileImageUrl = "";

        // ---Upload profile image if provided------
        if (profileImage) {
          const storageRef = ref(storage, `profile_images/${userId}`);
          await uploadBytes(storageRef, profileImage);
          profileImageUrl = await getDownloadURL(storageRef);
        }

        // ---Save user data to Firestore--------
        await setDoc(doc(db, "users", userId), {
          uid: userId,
          email: email,
          name: name,
          profileImage: profileImageUrl,
          createdAt: new Date(),
        });

        setEmail("");
        setPassword("");
        setPasswordMatch("");
        setName("");
        setProfileImage(null);
        setErrorM("");
        setSuccecMassage("Du är registrerad nu");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } catch (e: any) {
        console.log(e);
        setSuccecMassage("");
        if (e.code === "auth/email-already-in-use") {
          setErrorM("e-postadressen redan finns");
        } else if (e.code === "auth/weak-password") {
          setErrorM("Lösenordet är för svagt");
        } else if (e.code === "auth/invalid-email") {
          setErrorM("Ogiltig e-postadress");
        } else {
          setErrorM(e.message || "Ett fel uppstod vid registrering");
        }
      } finally {
        setLoading(false);
      }
    } else {
      console.log("passwords don't match");
      setErrorM("Lösenord måste vara lika");
      setPassword("");
      setPasswordMatch("");
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] flex items-center justify-center">
      <section className="border-2 rounded-xl p-8">
        <h1 className="text-center mb-10 text-2xl font-bold">Skapa konto</h1>
        {/*--------- register form ----------*/}
        <form onSubmit={handleRegister} className="grid gap-2 w-80">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-gray-200 p-2 rounded-md"
            placeholder="Ditt namn"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-200 p-2 rounded-md"
            placeholder="Ditt email"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-200 p-2 rounded-md"
            placeholder="Välja lösenord"
          />

          <input
            type="password"
            value={passwordMatch}
            onChange={(e) => setPasswordMatch(e.target.value)}
            className="bg-gray-200 p-2 rounded-md"
            placeholder="Bekräfta lösenordet"
          />

          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Profilbild (valfritt)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-neutral-600 file:text-white
                hover:file:bg-neutral-700"
            />
            {profileImage && <p className="text-sm text-green-500 mt-1">✓ Bild vald</p>}
          </div>

          <p className="text-md text-red-500">{errorM}</p>
          <p className="text-md text-green-500">{succecMassage}</p>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-1 rounded-md cursor-pointer hover:bg-neutral-500 bg-neutral-600 text-white w-fit justify-self-center mt-10 disabled:opacity-50">
            {loading ? "Registrerar..." : "Registrera"}
          </button>
          <Link href={"/sign-in"} className="font-semibold underline text-blue-600 cursor-pointer text-center">
            Har du redan ett konto
          </Link>
        </form>
      </section>
    </div>
  );
}
