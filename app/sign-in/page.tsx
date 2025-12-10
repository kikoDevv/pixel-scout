"use client";
import Link from "next/link";
import { useState } from "react";
import { auth } from "@/lib/firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function SignUp() {
  /*--------- use state for login ----------*/
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorM, setErrorM] = useState("");
  const [succecM, setSuccecM] = useState("");
  /*--------- logIn logic ----------*/
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorM("");
    setSuccecM("");

    if (!email || !password) {
      setErrorM("Alla fält måste fyllas i!");
      return;
    }
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      console.log(res);
      setEmail("");
      setPassword("");
      setErrorM("");
      setSuccecM("Du är inloggad!");
    } catch (e: any) {
      console.log(e);
      setSuccecM("");
      if (e.code === "auth/user-not-found") {
        setErrorM("Användaren hittades inte");
      } else if (e.code === "auth/wrong-password" || e.code === "auth/invalid-credential") {
        setErrorM("Felaktigt lösenord eller e-post");
      } else if (e.code === "auth/invalid-email") {
        setErrorM("Ogiltig e-postadress");
      } else {
        setErrorM(e.message || "Ett fel uppstod vid inloggning");
      }
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] flex items-center justify-center">
      <section className="border-2 rounded-xl p-8">
        <h1 className="text-center mb-10 text-2xl font-bold">Logga in</h1>
        <form onSubmit={handleLogin} className="grid gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ditt email"
            className="bg-gray-200 p-2 rounded-md"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-200 p-2 rounded-md"
            placeholder="Välja lösenord"
          />
          <p className="text-md text-red-500">{errorM}</p>
          <p className="text-md text-green-500">{succecM}</p>

          <button
            type="submit"
            className="px-4 py-1 rounded-md cursor-pointer hover:bg-neutral-500 bg-neutral-600 text-white w-fit justify-self-center mt-10">
            Logga in
          </button>
          <Link href={"/sign-up"} className="font-semibold underline text-blue-600 cursor-pointer">
            Registrera ditt kono
          </Link>
        </form>
      </section>
    </div>
  );
}
