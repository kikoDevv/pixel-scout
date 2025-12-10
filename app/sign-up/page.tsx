"use client";
import Link from "next/link";
import { useState } from "react";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase/firebaseConfig";

export default function SignUp() {
  /*--------- state for registeration ----------*/
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState("");
  const [errorM, setErrorM] = useState("");
  const [succecMassage, setSuccecMassage] = useState("");
  const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(auth);
  /*--------- register logic ----------*/
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(email, password, passwordMatch);

    /*--------- input must not be empty ----------*/
    if (!password || !email || !passwordMatch) {
      console.log("Password is empty");
      setErrorM("Alla fält måste fyllas");
      return;
    }

    /*--------- password must be longer than 6 ----------*/
    if (password.length < 6) {
      setErrorM("lösenord måste vara minst 6st");
      setPassword("");
      setPasswordMatch("");
      return;
    }
    if (password === passwordMatch) {
      console.log("password match!");
      setErrorM("");
      try {
        const res = await createUserWithEmailAndPassword(email, password);
        console.log(res);
        setEmail("");
        setPassword("");
        setPasswordMatch("");
        setSuccecMassage("Du är registrerad nu");
      } catch (e) {
        console.log(e);
        setErrorM("Ett fel uppstod vid registrering");
      }
    } else {
      console.log("passwords don't match");
      setErrorM("Lösenord måste vara lika");
      setPassword("");
      setPasswordMatch("");
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] flex items-center justify-center">
      <section className="border-2 rounded-xl p-8">
        <h1 className="text-center mb-10 text-2xl font-bold">Skapa konto</h1>
        {/*--------- register form ----------*/}
        <form onSubmit={handleRegister} className="grid gap-2">
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
          <p className="text-md text-red-500">{errorM}</p>
          <p className="text-md text-green-500">{succecMassage}</p>
          <button
            type="submit"
            className="px-4 py-1 rounded-md cursor-pointer hover:bg-neutral-500 bg-neutral-600 text-white w-fit justify-self-center mt-10">
            Registrera
          </button>
          <Link href={"/sign-in"} className="font-semibold underline text-blue-600 cursor-pointer">
            Har du redan ett konto
          </Link>
        </form>
      </section>
    </div>
  );
}
