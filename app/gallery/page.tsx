"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/lib/firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { Image, Album, Heart, Plus, X, Lock, Globe } from "lucide-react";
import { FaGlobeAfrica } from "react-icons/fa";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { IoIosAlbums } from "react-icons/io";
import { IoLockClosed } from "react-icons/io5";

export default function Gallery() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState("");
  const [activeTab, setActiveTab] = useState("photos");

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

  /*--------- Check if user is authenticated ----------*/
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserId(user.uid);
        setIsLoading(false);
        fetchAlbums(user.uid);
      } else {
        alert("Du behöver logga in först för att see din gallerier!");
        router.push("/sign-in");
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
      } else if (tab === "globalt") {
        const q = query(collection(db, "photos"), where("isPublic", "==", true));
        const snapshot = await getDocs(q);
        const photosData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPhotos(photosData);
      } else if (tab === "favorites") {
        setPhotos([]);
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
      const storageRef = ref(storage, `gallery/${userId}/${Date.now()}-${selectedFile.name}`);
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

  if (!isAuthenticated) {
    return null;
  }

  /*--------- if gallery is not empty ----------*/
  const filterButtons = [
    { id: "photos", label: "Photos", icon: Image },
    { id: "albums", label: "Albums", icon: Album },
    { id: "favorites", label: "Favorites", icon: Heart },
    { id: "globalt", label: "globalt", icon: FaGlobeAfrica },
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
          </div>
          {activeTab !== "globalt" && (
            <button
              onClick={handleClick}
              className="flex place-self-start sm:place-self-end items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold h-fit sm:px-4 sm:py-3 px-2 py-1 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/40 hover:scale-105 active:scale-95">
              <Plus size={20} />
              Ladda upp
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {albumPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                    <div className="relative w-full h-48 bg-gray-100">
                      <img src={photo.imageUrl} alt={photo.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-900">{photo.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{photo.description || "Ingen beskrivning"}</p>
                    </div>
                  </div>
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
                    className="bg-black/20 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow text-left hover:scale-102 transform transition-transform w-fit h-fit cursor-pointer">
                    <div className="bg-gradient-to-br rounded-lg flex items-center justify-center mb-3">
                      <IoIosAlbums className="text-blue-500 text-9xl" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900">{album.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {album.isPublic ? (
                        <FaGlobeAfrica className="text-red-500" />
                      ) : (
                        <IoLockClosed className="text-red-600" />
                      )}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {photos.length === 0 ? (
              <p className="text-gray-500 text-center py-10">
                {activeTab === "globalt" ? "Inga offentliga foton än" : "Inga foton ännu"}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                    <div className="relative w-full h-48 bg-gray-100">
                      <img src={photo.imageUrl} alt={photo.name} className="w-full h-full object-cover" />
                      {photo.isPublic && activeTab === "globalt" && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                          <Globe size={12} /> Offentlig
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-900">{photo.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{photo.description || "Ingen beskrivning"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

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
    </>
  );
}
