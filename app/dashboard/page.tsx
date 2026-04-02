"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { auth, db } from "@/lib/firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const notLogedIn = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Fetch user data from Firestore
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }

        setLoading(false);
      } else {
        router.push("/sign-in");
      }
    });

    return () => notLogedIn();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Laddar...</div>;
  }

  return (
    <div className="min-h-screen pt-20">
      <section className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-6">
            {userData?.profileImage && (
              <Image
                src={userData.profileImage}
                alt={userData?.name || "Profile"}
                width={100}
                height={100}
                className="rounded-full object-cover w-24 h-24 border-2 border-white/20"
              />
            )}
            <div>
              <h1 className="text-4xl font-bold mb-2">Välkommen till Dashboard</h1>
              <p className="text-xl text-gray-300">Hej, {userData?.name || user?.email}</p>
              <p className="text-sm text-gray-400 mt-1">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors cursor-pointer">
            Logga ut
          </button>
        </div>
        <div className="bg-neutral-900 border border-white/15 rounded-xl p-8">
          <p className="text-gray-300">Här ska användarens uppgift vara--.</p>
        </div>
      </section>
    </div>
  );
}
