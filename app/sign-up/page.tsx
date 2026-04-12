"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/lib/firebase/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { MdEmail, MdLock, MdPerson, MdImage } from "react-icons/md";

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

        setSuccecMassage("Du är registrerad nu");
        setEmail("");
        setPassword("");
        setPasswordMatch("");
        setName("");
        setProfileImage(null);
        setErrorM("");
        router.push("/dashboard");
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
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
      {/* Decorative gradient blobs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <section className="relative w-full max-w-md">
        {/* Glass-morphism card */}
        <div className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-3xl p-8 md:p-10 shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2">
              Skapa konto
            </h1>
            <p className="text-gray-500 text-sm">Börja dela dina foton i dag</p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Name Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500">
                <MdPerson size={20} />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                placeholder="Ditt användarnamn"
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400 disabled:opacity-50 hover:bg-white/70"
              />
            </div>

            {/* Email Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500">
                <MdEmail size={20} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="Din e-postadress"
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
                disabled={loading}
                placeholder="Välj ett lösenord (min 6 tecken)"
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400 disabled:opacity-50 hover:bg-white/70"
              />
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500">
                <MdLock size={20} />
              </div>
              <input
                type="password"
                value={passwordMatch}
                onChange={(e) => setPasswordMatch(e.target.value)}
                disabled={loading}
                placeholder="Bekräfta lösenordet"
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400 disabled:opacity-50 hover:bg-white/70"
              />
            </div>

            {/* Profile Image Upload */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MdImage size={18} className="text-blue-500" />
                Profilbild (valfritt)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading}
                className="block w-full text-sm text-gray-600 bg-white/50 border border-gray-200 rounded-xl px-4 py-3
                  file:mr-3 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-700 disabled:opacity-50
                  transition-all duration-200"
              />
              {profileImage && (
                <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                  ✓ Bild vald: {profileImage.name}
                </p>
              )}
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
            {succecMassage && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-600 text-sm font-medium flex items-center gap-2">
                  <span className="text-lg">✓</span>
                  {succecMassage}
                </p>
              </div>
            )}

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-200 transform hover:scale-101 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Registrerar...
                </span>
              ) : (
                "Skapa konto"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-300"></div>
            <span className="text-gray-400 text-xs font-medium">ELLER</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-300"></div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-3">Har du redan ett konto?</p>
            <Link
              href={"/sign-in"}
              className="inline-block px-6 py-2 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-200 cursor-pointer">
              Logga in
            </Link>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-gray-500 text-xs mt-6">Genom att skapa ett konto accepterar du våra villkor</p>
      </section>
    </div>
  );
}
