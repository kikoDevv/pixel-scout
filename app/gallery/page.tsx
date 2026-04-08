"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/lib/firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { Image, Album, Heart, Plus, X, Lock, Globe } from "lucide-react";
import { FaCommentDots, FaGlobeAfrica, FaRegHeart } from "react-icons/fa";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, getBytes } from "firebase/storage";
import { IoIosAlbums } from "react-icons/io";
import FooterSection from "@/components/ui/footer";
import { FaCircleArrowUp } from "react-icons/fa6";
import { IoCloudDownloadSharp } from "react-icons/io5";
import { MdAddPhotoAlternate } from "react-icons/md";
import { FiClock } from "react-icons/fi";
import { LuClock12 } from "react-icons/lu";

export default function Gallery() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState("");
  const [activeTab, setActiveTab] = useState("Explore");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState("");
  const [photoDescription, setPhotoDescription] = useState("");
  const [albums, setAlbums] = useState<any[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState("");
  const [createNewAlbum, setCreateNewAlbum] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Content states
  const [photos, setPhotos] = useState<any[]>([]);
  const [userAlbums, setUserAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openedAlbumId, setOpenedAlbumId] = useState<string | null>(null);
  const [openedAlbumName, setOpenedAlbumName] = useState<string>("");
  const [albumPhotos, setAlbumPhotos] = useState<any[]>([]);
  const [albumPhotoCounts, setAlbumPhotoCounts] = useState<{ [key: string]: number }>({});

  // Photo detail viewer states
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [photoUploaderInfo, setPhotoUploaderInfo] = useState<any>(null);
  const [loadingPhotoDetail, setLoadingPhotoDetail] = useState(false);
  const [showUploaderInfo, setShowUploaderInfo] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [likes, setLikes] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [currentUserInfo, setCurrentUserInfo] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [downloadRequestStatus, setDownloadRequestStatus] = useState<string | null>(null); // "pending" | "accepted" | null

  /*--------- Check if user is authenticated ----------*/
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserId(user.uid);
        setIsLoading(false);
        fetchAlbums(user.uid);
      } else {
        // Allow non-authenticated users to view public photos
        setIsAuthenticated(false);
        setActiveTab("Explore"); // Default to public photos
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  /*--------- Fetch user's albums ----------*/
  const fetchAlbums = async (uid: string) => {
    try {
      const q = query(collection(db, "albums"), where("uid", "==", uid));
      const snapshot = await getDocs(q);
      const albumsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAlbums(albumsData);
    } catch (error) {
      console.error("Error fetching albums:", error);
    }
  };

  /*--------- Fetch content based on active tab ----------*/
  const fetchContent = async (tab: string, uid: string) => {
    setLoading(true);
    try {
      if (tab === "photos") {
        const q = query(collection(db, "photos"), where("uid", "==", uid));
        const snapshot = await getDocs(q);
        const photosData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPhotos(photosData);
      } else if (tab === "albums") {
        const q = query(collection(db, "albums"), where("uid", "==", uid));
        const snapshot = await getDocs(q);
        const albumsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUserAlbums(albumsData);
      } else if (tab === "Explore") {
        const q = query(collection(db, "photos"), where("isPublic", "==", true));
        const snapshot = await getDocs(q);
        const photosData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPhotos(photosData);
      } else if (tab === "favorites") {
        // Fetch public photos and user's own photos
        try {
          // Query public photos
          const publicQ = query(collection(db, "photos"), where("isPublic", "==", true));
          const publicSnapshot = await getDocs(publicQ);
          const publicPhotos = publicSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Query user's own photos
          const ownQ = query(collection(db, "photos"), where("uid", "==", uid));
          const ownSnapshot = await getDocs(ownQ);
          const ownPhotos = ownSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Combine both results and remove duplicates
          const allAccessiblePhotos = [...publicPhotos, ...ownPhotos];
          const uniquePhotos = Array.from(new Map(allAccessiblePhotos.map((photo) => [photo.id, photo])).values());

          // Filter photos where current user has liked
          const likedPhotos = uniquePhotos.filter((photo) => photo.likes && photo.likes.includes(uid));
          setPhotos(likedPhotos);
        } catch (error) {
          console.error("Error fetching favorites:", error);
          setPhotos([]);
        }
      }
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchContent(activeTab, userId);
    } else if (activeTab === "Explore") {
      // For non-authenticated users, only allow viewing public photos
      fetchContent("Explore", "");
    }
  }, [activeTab, userId]);

  /*--------- Fetch photos from a specific album ----------*/
  const fetchAlbumPhotos = async (albumId: string, albumName: string) => {
    setLoading(true);
    try {
      // Query photos by albumId and ensure user has permission (owns photo OR photo is public)
      const q = query(
        collection(db, "photos"),
        where("albumId", "==", albumId),
        where("uid", "==", userId), // Only get photos owned by current user
      );
      const snapshot = await getDocs(q);
      const photosData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAlbumPhotos(photosData);
      setOpenedAlbumId(albumId);
      setOpenedAlbumName(albumName);
    } catch (error) {
      console.error("Error fetching album photos:", error);
    } finally {
      setLoading(false);
    }
  };

  /*--------- Close album detail view ----------*/
  const closeAlbumDetail = () => {
    setOpenedAlbumId(null);
    setOpenedAlbumName("");
    setAlbumPhotos([]);
  };

  /*--------- Calculate photo counts for all albums ----------*/
  const calculateAlbumPhotoCounts = async (uid: string) => {
    try {
      const q = query(collection(db, "photos"), where("uid", "==", uid));
      const snapshot = await getDocs(q);
      const counts: { [key: string]: number } = {};

      snapshot.docs.forEach((doc) => {
        const albumId = doc.data().albumId || "general";
        counts[albumId] = (counts[albumId] || 0) + 1;
      });

      setAlbumPhotoCounts(counts);
    } catch (error) {
      console.error("Error calculating album photo counts:", error);
    }
  };

  /*--------- Recalculate counts when albums tab is active ----------*/
  useEffect(() => {
    if (activeTab === "albums" && userId) {
      calculateAlbumPhotoCounts(userId);
    }
  }, [activeTab, userId]);

  /*--------- Fetch uploader info for selected photo ----------*/
  const fetchPhotoUploaderInfo = async (photo: any) => {
    setLoadingPhotoDetail(true);
    setSelectedPhoto(photo);
    try {
      const userRef = doc(db, "users", photo.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setPhotoUploaderInfo(userSnap.data());
      }

      // Fetch likes and comments for all users (authenticated and non-authenticated)
      await fetchLikesAndComments(photo.id);

      // Fetch current user info only if authenticated
      if (isAuthenticated) {
        const currentUserRef = doc(db, "users", userId);
        const currentUserSnap = await getDoc(currentUserRef);
        if (currentUserSnap.exists()) {
          setCurrentUserInfo(currentUserSnap.data());
        }

        // Check if user has a download request for this photo
        await checkDownloadRequestStatus(photo.id);
      }
    } catch (error) {
      console.error("Error fetching uploader info:", error);
    } finally {
      setLoadingPhotoDetail(false);
    }
  };

  /*--------- Fetch likes and comments for selected photo ----------*/
  const fetchLikesAndComments = async (photoId: string) => {
    try {
      const photoRef = doc(db, "photos", photoId);
      const photoSnap = await getDoc(photoRef);
      if (photoSnap.exists()) {
        const photoData = photoSnap.data();
        setLikes(photoData.likes || []);
        setComments(photoData.comments || []);
        setIsLiked(photoData.likes?.includes(userId) || false);
      }
    } catch (error) {
      console.error("Error fetching likes and comments:", error);
    }
  };

  /*--------- Add or remove like ----------*/
  const toggleLike = async () => {
    if (!isAuthenticated || !selectedPhoto) return;

    try {
      const photoRef = doc(db, "photos", selectedPhoto.id);
      if (isLiked) {
        await updateDoc(photoRef, {
          likes: arrayRemove(userId),
        });
        setLikes(likes.filter((id) => id !== userId));
      } else {
        await updateDoc(photoRef, {
          likes: arrayUnion(userId),
        });
        setLikes([...likes, userId]);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  /*--------- Add comment ----------*/
  const addComment = async () => {
    if (!isAuthenticated || !newComment.trim() || !selectedPhoto || !currentUserInfo) return;

    try {
      const photoRef = doc(db, "photos", selectedPhoto.id);
      const comment = {
        userId,
        username: currentUserInfo.name || currentUserInfo.email,
        text: newComment,
        createdAt: new Date(),
        profileImage: currentUserInfo.profileImage,
      };

      await updateDoc(photoRef, {
        comments: arrayUnion(comment),
      });

      setComments([...comments, comment]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  /*--------- Check download request status ----------*/
  const checkDownloadRequestStatus = async (photoId: string) => {
    if (!isAuthenticated || !userId) return;

    try {
      const q = query(
        collection(db, "download_requests"),
        where("photoId", "==", photoId),
        where("requesterId", "==", userId),
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setDownloadRequestStatus(null);
      } else {
        const request = snapshot.docs[0].data();
        setDownloadRequestStatus(request.status); // "pending" or "accepted"
      }
    } catch (error) {
      console.error("Error checking download request:", error);
    }
  };

  /*--------- Send download request ----------*/
  const sendDownloadRequest = async () => {
    if (!isAuthenticated || !selectedPhoto || !currentUserInfo) return;

    try {
      // Check if request already exists
      const q = query(
        collection(db, "download_requests"),
        where("photoId", "==", selectedPhoto.id),
        where("requesterId", "==", userId),
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        alert("Du har redan skickat en begäran för denna bild");
        return;
      }

      // Create new request
      await addDoc(collection(db, "download_requests"), {
        photoId: selectedPhoto.id,
        photoName: selectedPhoto.name,
        ownerId: selectedPhoto.uid,
        requesterId: userId,
        requesterName: currentUserInfo.name || currentUserInfo.email,
        requesterEmail: currentUserInfo.email,
        status: "pending",
        createdAt: new Date(),
      });

      setDownloadRequestStatus("pending");
      alert("Din förfrågan är skickad. Du ser en nedladdningsikon när ägaren godkännt!");
    } catch (error) {
      console.error("Error sending download request:", error);
      alert("Fel vid skickning av begäran");
    }
  };

  /*--------- Handle download ----------*/
  const handleDownload = async () => {
    if (!selectedPhoto) return;

    try {
      // Fetch the photo document to get storagePath
      const photoRef = doc(db, "photos", selectedPhoto.id);
      const photoSnap = await getDoc(photoRef);

      if (!photoSnap.exists()) {
        alert("Foto hittades inte");
        return;
      }

      const photoData = photoSnap.data();
      let blob: Blob;

      // Use Firebase Storage SDK with storagePath
      if (photoData.storagePath) {
        const storageRef = ref(storage, photoData.storagePath);
        const bytes = await getBytes(storageRef);
        blob = new Blob([bytes], { type: "image/jpeg" });
      } else {
        alert("Lagringssökväg hittades inte för denna foto");
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedPhoto.name}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading photo:", error);
      alert("Fel vid nedladdning");
    }
  };

  /*--------- Close photo detail viewer ----------*/
  const closePhotoDetail = () => {
    setSelectedPhoto(null);
    setPhotoUploaderInfo(null);
    setShowUploaderInfo(false);
    setShowComment(false);
    setLikes([]);
    setComments([]);
    setNewComment("");
    setIsLiked(false);
    setDownloadRequestStatus(null);
  };

  /*--------- Auto-switch info display every 4 seconds ----------*/
  useEffect(() => {
    if (selectedPhoto) {
      setShowUploaderInfo(false);
      const timer = setTimeout(() => {
        setShowUploaderInfo(true);
      }, 4000);

      const loopTimer = setInterval(() => {
        setShowUploaderInfo((prev) => !prev);
      }, 8000);

      return () => {
        clearTimeout(timer);
        clearInterval(loopTimer);
      };
    }
  }, [selectedPhoto]);

  /*--------- Disable background scroll when modal is open ----------*/
  useEffect(() => {
    if (selectedPhoto) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedPhoto]);

  /*--------- Handle file selection ----------*/
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(files[0]);
      setShowModal(true);
    }
  };

  /*--------- Handle upload ----------*/
  const handleUpload = async () => {
    if (!selectedFile || !photoName.trim()) {
      alert("Välj en fil och ge den ett namn");
      return;
    }

    setUploading(true);
    try {
      // Upload file to storage
      const storagePath = `gallery/${userId}/${Date.now()}-${selectedFile.name}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(storageRef);

      // Create or use album
      let albumId = selectedAlbum;
      if (createNewAlbum && newAlbumName.trim()) {
        const albumRef = await addDoc(collection(db, "albums"), {
          uid: userId,
          name: newAlbumName,
          isPublic: isPublic,
          createdAt: new Date(),
        });
        albumId = albumRef.id;
      }

      // Add photo to database
      await addDoc(collection(db, "photos"), {
        uid: userId,
        albumId: albumId || "general",
        name: photoName,
        description: photoDescription,
        imageUrl: downloadURL,
        storagePath: storagePath,
        isPublic: isPublic,
        createdAt: new Date(),
      });

      alert("Bild uppladdad!");
      setShowModal(false);
      setSelectedFile(null);
      setPreview(null);
      setPhotoName("");
      setPhotoDescription("");
      setCreateNewAlbum(false);
      setNewAlbumName("");
      setIsPublic(false);
      fetchAlbums(userId);
    } catch (error) {
      console.error("Error uploading:", error);
      alert("Fel vid uppladdning");
    } finally {
      setUploading(false);
    }
  };

  /*--------- Handle comment ----------*/
  const handleComment = () => {
    setShowComment(true);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-80px)] flex items-center justify-center">
        <p className="text-xl font-semibold text-gray-600">Laddar...</p>
      </div>
    );
  }

  /*--------- if gallery is not empty ----------*/
  const filterButtons = [
    { id: "Explore", label: "Explore", icon: FaGlobeAfrica },
    { id: "photos", label: "Photos", icon: Image },
    { id: "albums", label: "Albums", icon: Album },
    { id: "favorites", label: "Favorites", icon: Heart },
  ];

  return (
    <>
      <div className="sm:p-20 p-4">
        {/* ------Header----------- */}
        <div className="flex sm:flex-row flex-col justify-between gap-4 mb-8">
          <div className="grid sm:gap-5 gap-3">
            <h1 className="font-black sm:text-6xl text-3xl bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent letter-spacing-wide">
              Min Studio
            </h1>
            {isAuthenticated && (
              <section className="flex gap-3 flex-wrap">
                {filterButtons.map((btn) => {
                  const Icon = btn.icon;
                  const isActive = activeTab === btn.id;
                  return (
                    <button
                      key={btn.id}
                      onClick={() => setActiveTab(btn.id)}
                      className={`flex items-center gap-1 sm:gap-2 px-3 py-2 rounded-xl font-medium transition-all duration-200 cursor-pointer ${
                        isActive ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}>
                      <Icon size={18} />
                      {btn.label}
                    </button>
                  );
                })}
              </section>
            )}
          </div>
          {isAuthenticated && (
            <button
              onClick={handleClick}
              className="flex place-self-start sm:place-self-end items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold h-fit sm:px-4 sm:py-3 px-2 py-1 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/40 hover:scale-102 active:scale-95">
              <Plus size={20} />
              Ladda upp
            </button>
          )}
          {!isAuthenticated && (
            <button
              onClick={() => router.push("/sign-in")}
              className="flex place-self-start sm:place-self-end items-center gap-2 bg-gradient-to-r from-neutral-700 to-neutral-800 hover:from-blue-600 hover:to-blue-700 text-white font-semibold h-fit sm:px-4 sm:py-3 px-2 py-1 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/40 hover:scale-102 active:scale-95">
              <Plus size={20} />
              Skapa din egen
            </button>
          )}
        </div>

        {/* ----------Content Grid------------ */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <p className="text-gray-600">Laddar...</p>
          </div>
        ) : activeTab === "albums" && openedAlbumId ? (
          // Album Detail View
          <div>
            <button
              onClick={closeAlbumDetail}
              className="mb-6 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2">
              ← Tillbaka till album
            </button>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{openedAlbumName}</h2>
            {albumPhotos.length === 0 ? (
              <p className="text-gray-500 text-center py-10">Inga foton i detta album ännu</p>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
                {albumPhotos.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => fetchPhotoUploaderInfo(photo)}
                    className="break-inside-avoid mb-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden cursor-pointer w-full inline-block text-left hover:opacity-90">
                    <div className="relative w-full bg-gray-100">
                      <img src={photo.imageUrl} alt={photo.name} className="w-full h-auto object-cover" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-900">{photo.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{photo.description || "Ingen beskrivning"}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "albums" ? (
          <div>
            {userAlbums.length === 0 ? (
              <p className="text-gray-500 text-center py-10">Inga album ännu</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 sm:w-fit w-full gap-5">
                {userAlbums.map((album) => (
                  <button
                    key={album.id}
                    onClick={() => fetchAlbumPhotos(album.id, album.name)}
                    className="border border-gray-300 rounded-2xl px-4 hover:scale-103 transition-all duration-200 cursor-pointer">
                    <div className="relative w-fit">
                      <IoIosAlbums className="text-blue-500 text-9xl" />
                      <div className="absolute top-16 left-7 flex items-center justify-center">
                        <div className="flex items-center gap-1 px-2 py-1">
                          <span className="text-sm font-semibold text-white">
                            {albumPhotoCounts[album.id] || 0} Photo
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900 pb-1">{album.name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /*-------------- Image card viewer ---------------*/
          <div>
            {photos.length === 0 ? (
              <p className="text-gray-500 text-center py-10">
                {activeTab === "Explore"
                  ? "Inga offentliga foton än"
                  : activeTab === "favorites"
                    ? "Inga favoritfoton än. Börja gilla bilder for att see dem här!"
                    : "Inga foton ännu"}
              </p>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
                {photos.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => fetchPhotoUploaderInfo(photo)}
                    className="break-inside-avoid mb-6 rounded-xl shadow-md hover:shadow-lg overflow-hidden cursor-pointer hover:opacity-90 hover:scale-99 transition-all duration-300 w-full inline-block">
                    <img src={photo.imageUrl} alt={photo.name} className="w-full h-auto object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* -----------------Photo Detail Modal----------------- */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/96 flex items-center justify-center z-50 p-4" onClick={closePhotoDetail}>
          <div className="relative">
            {/* Close Button */}
            <button
              onClick={closePhotoDetail}
              className="absolute z-20 top-3 right-4 bg-amber-50 p-2 hover:bg-red-600 hover:text-white rounded-full transition-all duration-300 cursor-pointer inset-shadow-md shadow-black">
              <X size={15} />
            </button>

            <div
              className="rounded-4xl max-w-5xl max-h-[98vh] overflow-y-auto hide-scrollbar"
              onClick={(e) => e.stopPropagation()}>
              {/* Modal Content */}
              <div className="relative">
                <div className="absolute z-10 top-6 left-6">
                  {/* Uploader Information */}
                  <div className="flex items-center gap-3">
                    {/* Profile Picture*/}
                    {photoUploaderInfo?.profileImage && (
                      <img
                        src={photoUploaderInfo.profileImage}
                        alt={photoUploaderInfo.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white flex-shrink-0"
                      />
                    )}

                    {/* Text Content, Loops between photo info and uploader info */}
                    <div className="relative">
                      {/* Photo Info */}
                      <div
                        className={`transition-all duration-300 ${
                          showUploaderInfo ? "opacity-0 translate-y-[-5px]" : "opacity-100 translate-y-0"
                        }`}>
                        <h4 className="font-bold text-white text-sm truncate">{selectedPhoto?.name}</h4>
                        {selectedPhoto?.description && (
                          <p className="text-xs text-white/80 line-clamp-1">{selectedPhoto.description}</p>
                        )}
                      </div>

                      {/* Uploader Info */}
                      <div
                        className={`absolute top-0 left-0 transition-all duration-300 ${
                          showUploaderInfo ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[-5px]"
                        }`}>
                        <h4 className="font-bold text-white text-sm truncate">
                          {photoUploaderInfo?.name || photoUploaderInfo?.email}
                        </h4>
                        <p className="text-xs text-white/80 truncate">{photoUploaderInfo?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Photo Image */}
                <div className="relative w-full bg-gray-100 rounded-xl overflow-hidden">
                  <img src={selectedPhoto.imageUrl} alt={selectedPhoto.name} className="max-h-[85vh]" />
                  {/*--------- Like and comment icon ----------*/}
                  <div className="absolute">
                    <div className="relative bottom-10 left-5">
                      <div className="flex gap-5 items-center">
                        <button
                          onClick={() => {
                            if (isAuthenticated) {
                              toggleLike();
                            } else {
                              router.push("/sign-in");
                            }
                          }}
                          className="flex items-center gap-1 group relative">
                          {isLiked ? (
                            <Heart
                              className="text-red-600 size-5 cursor-pointer hover:scale-120 transition-all duration-300"
                              fill="currentColor"
                            />
                          ) : (
                            <FaRegHeart className="text-white size-5 group-hover:scale-120 group-hover:text-red-600 transition-all duration-200 cursor-pointer" />
                          )}
                          {likes.length > 0 && <span className="text-white text-xs font-semibold">{likes.length}</span>}
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                            Gilla
                          </span>
                        </button>
                        <button onClick={handleComment} className="flex items-center gap-1 group relative">
                          <FaCommentDots className="text-white size-5 hover:scale-120 hover:text-green-600 transition-all duration-200 cursor-pointer" />
                          {comments.length > 0 && (
                            <span className="text-white text-xs font-semibold">{comments.length}</span>
                          )}
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                            Kommentera
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            if (downloadRequestStatus === null) {
                              sendDownloadRequest();
                            } else if (downloadRequestStatus === "accepted") {
                              handleDownload();
                            }
                          }}
                          disabled={downloadRequestStatus === "pending"}
                          className="group relative">
                          {downloadRequestStatus === null && (
                            <MdAddPhotoAlternate className="text-white size-5.5 hover:scale-120 hover:text-green-600 transition-all duration-200 cursor-pointer" />
                          )}
                          {downloadRequestStatus === "pending" && (
                            <LuClock12
                              className="text-white size-5 transition-all duration-200"
                              style={{ animation: "spin 2s linear infinite" }}
                            />
                          )}
                          {downloadRequestStatus === "accepted" && (
                            <IoCloudDownloadSharp className="text-white size-5.5 hover:scale-120 hover:text-blue-600 transition-all duration-200 cursor-pointer" />
                          )}
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                            {downloadRequestStatus === null && "Skicka nedladdningsbegäran"}
                            {downloadRequestStatus === "pending" && "Begäran väntar"}
                            {downloadRequestStatus === "accepted" && "Ladda ner"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* ------------ Comment section -------------- */}
              {showComment && (
                <div className="grid items-center pb-5">
                  <hr className="text-white my-2 mx-30" />
                  {/* Comments list */}
                  <div className="mx-1 max-h-[200px] overflow-y-auto mb-3">
                    {comments.length === 0 ? (
                      <p className="text-white text-xs text-center py-2">Inga kommentarer än</p>
                    ) : (
                      comments.map((comment, idx) => (
                        <div key={idx} className="bg-gray-900 rounded-lg p-2 mb-2 text-white text-xs">
                          <div className="flex items-center gap-2">
                            {comment.profileImage && (
                              <img
                                src={comment.profileImage}
                                alt={comment.username}
                                className="w-7 h-7 rounded-full object-cover"
                              />
                            )}
                            <div className="grid">
                              <p className="font-semibold">{comment.username}</p>
                              <p className="text-gray-300">{comment.text}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Comment input */}
                  {isAuthenticated ? (
                    <div className="flex items-center bg-white mx-1 rounded-lg overflow-hidden">
                      <input
                        type="text"
                        placeholder="Lämna kommentar här"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="pl-3 py-1 w-full placeholder:text-gray-400 outline-none text-black"
                      />
                      <button
                        onClick={addComment}
                        disabled={!newComment.trim()}
                        className="mr-2 text-green-600 cursor-pointer hover:scale-120 transition-all duration-200 disabled:opacity-50">
                        <FaCircleArrowUp />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => router.push("/sign-in")}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                      Logga in för att kommentera
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -----------------Upload Modal----------------- */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Ladda upp bild</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Image Preview */}
              {preview && (
                <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Photo Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bildnamn *</label>
                  <input
                    type="text"
                    value={photoName}
                    onChange={(e) => setPhotoName(e.target.value)}
                    placeholder="Ge bilden ett namn"
                    disabled={uploading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Beskrivning</label>
                  <textarea
                    value={photoDescription}
                    onChange={(e) => setPhotoDescription(e.target.value)}
                    placeholder="Lägg till en beskrivning (valfritt)"
                    disabled={uploading}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none"
                  />
                </div>
              </div>

              {/* Album Selection */}
              <div className="space-y-3 border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900">Album</h3>

                {!createNewAlbum ? (
                  <>
                    <select
                      value={selectedAlbum}
                      onChange={(e) => setSelectedAlbum(e.target.value)}
                      disabled={uploading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
                      <option value="">Välj ett befintligt album</option>
                      {albums.map((album) => (
                        <option key={album.id} value={album.id}>
                          {album.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setCreateNewAlbum(true)}
                      disabled={uploading}
                      className="w-full py-2 border-2 border-blue-500 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50">
                      + Skapa nytt album
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      value={newAlbumName}
                      onChange={(e) => setNewAlbumName(e.target.value)}
                      placeholder="Albumnamn"
                      disabled={uploading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <button
                      onClick={() => setCreateNewAlbum(false)}
                      disabled={uploading}
                      className="w-full py-2 border-2 border-gray-300 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                      Avbryt album-skapande
                    </button>
                  </>
                )}
              </div>

              {/* Privacy Toggle */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {isPublic ? <Globe size={20} /> : <Lock size={20} />}
                    <div>
                      <p className="font-medium text-gray-900">{isPublic ? "Offentlig" : "Privat"}</p>
                      <p className="text-sm text-gray-500">
                        {isPublic ? "Alla kan se denna bild" : "Endast du kan se denna bild"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsPublic(!isPublic)}
                    disabled={uploading}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      isPublic ? "bg-blue-600" : "bg-gray-300"
                    } disabled:opacity-50`}>
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        isPublic ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-200 pt-6 flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={uploading}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                  Avbryt
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading || !photoName.trim() || !selectedFile}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {uploading ? "Laddar upp..." : "Ladda upp"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <FooterSection />
    </>
  );
}
