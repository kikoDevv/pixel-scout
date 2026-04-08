"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { auth, db } from "@/lib/firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { FiCheck, FiX } from "react-icons/fi";
import FooterSection from "@/components/ui/footer";

interface DownloadRequest {
  id: string;
  photoId: string;
  photoName: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  status: "pending" | "accepted" | "declined";
  createdAt: any;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<DownloadRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

          // Fetch download requests for this user's photos
          await fetchDownloadRequests(currentUser.uid);
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

  const fetchDownloadRequests = async (userId: string) => {
    try {
      setRequestsLoading(true);
      setError(null);

      // Query all download requests where ownerId is current user
      const requestsRef = collection(db, "download_requests");
      const q = query(requestsRef, where("ownerId", "==", userId));
      const querySnapshot = await getDocs(q);

      const fetchedRequests: DownloadRequest[] = [];
      querySnapshot.forEach((doc) => {
        fetchedRequests.push({
          id: doc.id,
          ...doc.data(),
        } as DownloadRequest);
      });

      // Sort by creation date (newest first), with pending first
      fetchedRequests.sort((a, b) => {
        if (a.status === "pending" && b.status !== "pending") return -1;
        if (a.status !== "pending" && b.status === "pending") return 1;
        return (b.createdAt?.toDate?.()?.getTime?.() || 0) - (a.createdAt?.toDate?.()?.getTime?.() || 0);
      });

      setRequests(fetchedRequests);
    } catch (err) {
      console.error("Error fetching download requests:", err);
      setError("Failed to load download requests");
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      setProcessing(requestId);
      setError(null);

      const requestRef = doc(db, "download_requests", requestId);
      await updateDoc(requestRef, {
        status: "accepted",
      });

      setSuccessMessage("Request accepted!");
      setTimeout(() => setSuccessMessage(null), 3000);

      // Update local state
      setRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status: "accepted" } : req)));
    } catch (err) {
      console.error("Error accepting request:", err);
      setError("Failed to accept request");
    } finally {
      setProcessing(null);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      setProcessing(requestId);
      setError(null);

      const requestRef = doc(db, "download_requests", requestId);
      await updateDoc(requestRef, {
        status: "declined",
      });

      setSuccessMessage("Request declined");
      setTimeout(() => setSuccessMessage(null), 3000);

      // Update local state
      setRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status: "declined" } : req)));
    } catch (err) {
      console.error("Error declining request:", err);
      setError("Failed to decline request");
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-block px-5 py-1 text-sm font-medium text-yellow-300 border border-yellow-700 rounded-md bg-yellow-900/30">
            Väntar..
          </span>
        );
      case "accepted":
        return (
          <span className="inline-block px-5 py-1 text-sm font-medium text-green-300 border border-green-700 rounded-md bg-green-900/30">
            Accepterad
          </span>
        );
      case "declined":
        return (
          <span className="inline-block px-5 py-1 text-sm font-medium text-white text-red-300 border border-red-700 rounded-md bg-red-900/30">
            Avslågen!
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block mb-4 animate-spin">
            <div className="w-8 h-8 rounded-full border-3 border-slate-700 border-t-blue-500"></div>
          </div>
          <p className="text-slate-300">Laddar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <section className="max-w-4xl px-4 mx-auto">
        <div className="flex items-start justify-between p-5 mb-8 bg-gradient-to-r from-blue-900 via-slate-900 to-slate-950 rounded-2xl">
          <div className="flex items-center sm:gap-6 gap-2">
            {userData?.profileImage && (
              <Image
                src={userData.profileImage}
                alt={userData?.name || "Profile"}
                width={100}
                height={100}
                className="object-cover w-20 h-20 border-2 rounded-full sm:w-24 sm:h-24 border-blue-500/20"
              />
            )}
            <div>
              <h1 className="mb-2 font-bold text-white sm:text-2xl">Välkommen till Dashboard</h1>
              <p className="text-xl text-slate-300">{userData?.name || user?.email}</p>
              <p className="mt-1 text-sm text-slate-400">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="font-semibold text-white transition-colors bg-red-600 cursor-pointer sm:px-6 sm:py-2 min-w-20 sm:rounded-xl rounded-md py-1 hover:bg-red-700">
            Logga ut
          </button>
        </div>

        {/*------------- Download Requests Section -----------------*/}
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-slate-800">Förfrågningar</h2>

          {error && <div className="p-4 mb-6 text-red-300 border border-red-700 rounded-lg bg-red-900/30">{error}</div>}

          {successMessage && (
            <div className="p-4 mb-6 text-green-300 border border-green-700 rounded-lg bg-green-900/30">
              {successMessage}
            </div>
          )}

          {requestsLoading ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin">
                <div className="w-8 h-8 rounded-full border-3"></div>
              </div>
              <p className="mt-4 text-slate-400">Laddar begäranden...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-12 text-center border bg-gradient-to-r from-blue-900/20 via-slate-900/20 to-slate-950/20 rounded-xl border-slate-700">
              <p className="text-lg text-slate-400">Du har inga nedladdningsbegäranden ännu</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className={`p-6 rounded-xl border transition-all ${
                    request.status === "pending"
                      ? "bg-gradient-to-r from-slate-950 via-slate-900 to-blue-900 border-blue-700/50"
                      : "bg-slate-900/30 border-slate-700"
                  }`}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-5 mb-2 sm:justify-start">
                        <h3 className="text-lg font-semibold text-white">{request.requesterName}s begäran</h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="space-y-1 text-sm text-white">
                        <p>
                          <span className="text-white">Begäran för bilden:</span> {request.photoName}
                        </p>
                        <p>
                          <span className="text-white">E-post:</span> {request.requesterEmail}
                        </p>
                        <p>
                          <span className="text-white">Mottagen:</span>{" "}
                          {request.createdAt
                            ? new Date(request.createdAt.seconds * 1000).toLocaleDateString("sv-SE", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Okänt datum"}
                        </p>
                      </div>
                    </div>

                    {request.status === "pending" && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          disabled={processing === request.id}
                          className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-slate-600">
                          {processing === request.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                              <span>Accepterar...</span>
                            </>
                          ) : (
                            <>
                              <FiCheck size={18} />
                              <span>Godkänn</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(request.id)}
                          disabled={processing === request.id}
                          className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-slate-600">
                          {processing === request.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                              <span>Avslår...</span>
                            </>
                          ) : (
                            <>
                              <FiX size={18} />
                              <span>Avslå</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {request.status !== "pending" && (
                      <div className="text-right">
                        <span className="text-sm text-white">
                          {request.status === "accepted" ? "Godkänd av dig" : "Avslågen av dig"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <FooterSection></FooterSection>
    </div>
  );
}
