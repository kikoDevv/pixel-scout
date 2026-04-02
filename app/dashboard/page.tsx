"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        router.push("/sign-in");
      }
    });

    return () => unsubscribe();
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
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-4">Välkommen till Dashboard</h1>
            <p className="text-xl text-gray-300">Hej, {user?.email}</p>
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
