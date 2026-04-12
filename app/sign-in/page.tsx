"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { MdEmail, MdLock } from "react-icons/md";

export default function SignUp() {
  const router = useRouter();
  /*--------- use state for login ----------*/
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorM, setErrorM] = useState("");
  const [succecM, setSuccecM] = useState("");
  const [loading, setLoading] = useState(false);

  /*--------- logIn logic ----------*/
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorM("");
    setSuccecM("");

    if (!email || !password) {
      setErrorM("Alla fält måste fyllas i!");
      setLoading(false);
      return;
    }
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const userId = res.user.uid;

      //---Check if user exists in Firestore----
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      //-----If user doesn't exist in Firestore, add them-----
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: userId,
          email: email,
          name: email.split("@")[0], // Use email prefix as default name
          profileImage: "",
          createdAt: new Date(),
        });
      }

      console.log(res);
      setSuccecM("Du är inloggad!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
      setEmail("");
      setPassword("");
      setErrorM("");
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
      {/* Decorative gradient blobs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <section className="relative w-full max-w-md">
        {/* Glass-morphism card */}
        <div className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-3xl p-8 md:p-10 shadow-2xl">
          {/* Header */}
          <div className="grid mb-8 justify-center">
            <h1 className="text-center text-4xl font-black bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2">
              Logga in
            </h1>
            <p className="text-gray-500 text-sm">Välkommen tillbaka till din konto</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500">
                <MdEmail size={20} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Din e-postadress"
                disabled={loading}
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400 disabled:opacity-50 hover:bg-white/70"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500">
                <MdLock size={20} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ditt lösenord"
                disabled={loading}
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400 disabled:opacity-50 hover:bg-white/70"
              />
            </div>

            {/* Error Message */}
            {errorM && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  {errorM}
                </p>
              </div>
            )}

            {/* Success Message */}
            {succecM && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-600 text-sm font-medium flex items-center gap-2">
                  <span className="text-lg">✓</span>
                  {succecM}
                </p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer py-3 bg-gradient-to-r from-slate-800 to-slate-800 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-200 transform hover:scale-101 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Loggar in...
                </span>
              ) : (
                "Logga in"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-300"></div>
            <span className="text-gray-400 text-xs font-medium">ELLER</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-300"></div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-3">Har du inget konto ännu?</p>
            <Link
              href={"/sign-up"}
              className="inline-block px-6 py-2 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-200 cursor-pointer">
              Skapa konto
            </Link>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-gray-500 text-xs mt-6">Genom att logga in accepterar du våra villkor</p>
      </section>
    </div>
  );
}
