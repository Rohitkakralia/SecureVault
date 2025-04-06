"use client"
import React, { useState, useEffect } from 'react'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation';
import { fetchUser } from "../actions/fetchDetails";
import { fetchUploads } from "../actions/fetchDetails";
import { fetchImageDetails } from "../actions/fetchDetails";
import { fetchReceivedImage } from "../actions/fetchDetails";

const Page = () => {
    const { data: session, status } = useSession();
    const [receiverId, setReceiverId] = useState('');
    const [receiverEmail, setReceiverEmail] = useState('');
    const [receiverUsername, setReceiverUsername] = useState('');
    const [uploadHistory, setUploadHistory] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [userEmail, setUserEmail] = useState(''); // Add state for user's email
    const [loading, setLoading] = useState(false);
    const [receivedImages, setreceivedImages] = useState([]);
    const [sharedByMeImages, setSharedByMeImages] = useState([]); // New state for shared by me images
    const [activeTab, setActiveTab] = useState('shared'); // 'shared', 'received', or 'sharedByMe'
    const [userData, setUserData] = useState(null); // Store user data
    
    // Search functionality
    const [searchTerm, setSearchTerm] = useState('');
    const [searchAttribute, setSearchAttribute] = useState('patientName');
    const [filteredUploadHistory, setFilteredUploadHistory] = useState([]);
    const [filteredSharedByMeImages, setFilteredSharedByMeImages] = useState([]);
    
    const router = useRouter();
    
    useEffect(() => {
      if (status === "loading") return; // Wait while checking authentication
      
      if (status === "unauthenticated") {
        router.push("/login");
      }
    }, [status, router]);
    
    // Block rendering of protected content until auth check completes
    if (status === "loading") {
      return <div>Loading...</div>; // Or your loading component
    }
    
    if (status === "unauthenticated") {
      return null; // Don't render anything while redirecting
    }
    const getData = async () => {
        let u = await fetchUser(userEmail);
        let images = await fetchUploads(u);
        setUploadHistory(images);
        setFilteredUploadHistory(images); // Initialize filtered history with all images
    };

    // Fetch user's uploads when component mounts or when userEmail changes
    useEffect(() => {
        if (status === "authenticated" && session?.user?.email) {
            fetchUserData(session.user.email);
        }
    }, [status, session]);

    useEffect(() => {
      // Create a timer to delay the filtering
      const timer = setTimeout(() => {
          if (searchTerm.trim() === '') {
              // If search term is empty, show all images
              setFilteredUploadHistory(uploadHistory);
              setFilteredSharedByMeImages(sharedByMeImages);
              return;
          }
  
          // Filter upload history (my images)
          const filteredUploads = uploadHistory.filter(image => {
              const value = image[searchAttribute];
              if (typeof value === 'string') {
                  return value.toLowerCase().includes(searchTerm.toLowerCase());
              } else if (typeof value === 'number') {
                  return value.toString().includes(searchTerm);
              }
              return false;
          });
          setFilteredUploadHistory(filteredUploads);
  
          // Filter shared by me images
          const filteredShared = sharedByMeImages.filter(image => {
              const value = image[searchAttribute];
              if (typeof value === 'string') {
                  return value.toLowerCase().includes(searchTerm.toLowerCase());
              } else if (typeof value === 'number') {
                  return value.toString().includes(searchTerm);
              }
              return false;
          });
          setFilteredSharedByMeImages(filteredShared);
      }, 300); // 300ms delay
  
      // Cleanup the timer when component unmounts or dependencies change
      return () => clearTimeout(timer);
  }, [searchTerm, searchAttribute, uploadHistory, sharedByMeImages]);
  
    const fetchUserData = async (email) => {
        setLoading(true);
        try {
            const userData = await fetchUser(email);
            console.log("User id:", userData);
            setUserData(userData); // Store user data for future use

            if (userData) {
                const images = await fetchUploads(userData);
                const imagesReceived = await fetchReceivedImage(userData);
                console.log("Images received:", imagesReceived);
                setUploadHistory(images);
                setFilteredUploadHistory(images); // Initialize filtered history
                setreceivedImages(imagesReceived);
                
                // Fetch images shared by this user
                fetchSharedByMeImages(userData);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };
    
    // New function to fetch images shared by the current user
    const fetchSharedByMeImages = async (userId) => {
        setLoading(true);
        try {
            const response = await fetch('/api/getSharedByMeImages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ senderId: userId }),
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log("Images shared by me:", data);
                setSharedByMeImages(data);
                setFilteredSharedByMeImages(data); // Initialize filtered shared images
            } else {
                const error = await response.json();
                throw new Error(error.message || "Failed to fetch shared images");
            }
        } catch (error) {
            console.error("Error fetching shared by me images:", error);
        } finally {
            setLoading(false);
        }
    };
    
    
    const getReceiverId = async () => {
        if (!receiverEmail) {
            alert("Please enter receiver's email");
            return;
        }
        
        setLoading(true);
        try {
            const response = await fetch('/api/getRecieversId', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ receiverEmail: receiverEmail }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                console.log("Receiver data:", data);
                setReceiverId(data.receiverId);
                setReceiverUsername(data.receiverUsername);
            } else {
                alert(data.error || "Failed to get receiver information");
            }
        } catch (error) {
            console.error("Error fetching receiver data:", error);
            alert("An error occurred while fetching receiver data");
        } finally {
            setLoading(false);
        }
    };

    // Modified toggle function to store full image details
    const toggleImageSelection = (image) => {
        setSelectedImages(prev => {
          // Check if this image is already selected (by ID)
          const isSelected = prev.some(item => item._id === image._id);
          
          if (isSelected) {
            // Remove the image if already selected
            return prev.filter(item => item._id !== image._id);
          } else {
            // Add the image if not selected
            return [...prev, image];
          }
        });
    };
    
    const shareSelectedImages = async () => {
        if (!receiverId) {
            alert("Please get receiver's ID first");
            return;
        }
        
        if (selectedImages.length === 0) {
            alert("Please select at least one image to share");
            return;
        }
        
        console.log("Selected images:", selectedImages);
        
        // If you're selecting only one image ID
        const selectedImageIds = selectedImages[0]._id; 
        console.log("Selected image IDs:", selectedImageIds);

        // If fetchImageDetails is async, make sure to await it
        let imageDetails = await fetchImageDetails(selectedImages);
        console.log("Image details:", imageDetails);
        
        setLoading(true);
        try {
            
            const response = await fetch('/api/shareImages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    receiverId,
                    receiverEmail,
                    receiverUsername,
                    imageDetails
                }),
            });
            
            const data = await response.json();
            if (response.ok) {
                alert("Images shared successfully");
                // Refresh shared by me images after successful sharing
                if (userData) {
                    fetchSharedByMeImages(userData);
                }
            } else {
                throw new Error(data.message || "Failed to share images");
            }
        } catch (error) {
            console.error("Error sharing images:", error);
            alert("Failed to share images: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Function to decrypt image using hash and iv
    const decryptImage = async (encryptedData, iv) => {
        try {
            // Convert the IV from base64 to Uint8Array
            const ivBuffer = new Uint8Array(Buffer.from(iv, "base64"));
            
            // Use a fixed key (in production, this should be securely stored and retrieved)
            const keyBuffer = new TextEncoder().encode(
                "0123456789abcdef0123456789abcdef"
            );
            
            // Import the key for decryption
            const key = await crypto.subtle.importKey(
                "raw",
                keyBuffer,
                { name: "AES-CBC" },
                false,
                ["decrypt"]
            );
            
            // Decrypt the data
            const decryptedData = await crypto.subtle.decrypt(
                { name: "AES-CBC", iv: ivBuffer },
                key,
                encryptedData
            );
            
            // Return decrypted data as a Blob
            return new Blob([decryptedData], { type: 'image/jpeg' }); // Adjust type as needed
        } catch (error) {
            console.error("Decryption error:", error);
            throw new Error("Failed to decrypt image: " + error.message);
        }
    };
    
    // Modified viewImage function to fetch and decrypt the image
    const viewImage = async (image) => {
        try {
            console.log("Viewing image:", image);
            console.log("Image hash:", image.hash);
            console.log("Image IV:", image.iv);
            
            // Update image status to viewed if not already and if this is a received image
            if (activeTab === 'received' && image.status !== 'viewed' && image.status !== 'downloaded') {
                const statusResponse = await fetch('/api/updateImageStatus', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        imageId: image._id,
                        status: 'viewed'
                    }),
                });
                
                if (statusResponse.ok) {
                    // Update local state
                    setreceivedImages(prev => prev.map(img => 
                        img._id === image._id ? {...img, status: 'viewed'} : img
                    ));
                }
            }
            
            // Show loading indicator
            setLoading(true);
            
            // Fetch the encrypted image data using the hash
            const response = await fetch(`https://gateway.pinata.cloud/ipfs/${image.hash}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch encrypted image: ${response.status} ${response.statusText}`);
            }
            
            // Get the encrypted data as ArrayBuffer
            const encryptedData = await response.arrayBuffer();
            
            console.log("Encrypted data received, size:", encryptedData.byteLength);
            
            // Decrypt the image
            const decryptedBlob = await decryptImage(encryptedData, image.iv);
            
            console.log("Decryption successful, creating URL");
            
            // Create object URL for the decrypted image
            const imageUrl = URL.createObjectURL(decryptedBlob);
            
            // Open in new tab or display in viewer
            window.open(imageUrl, '_blank');
            
            // Clean up the object URL after opening
            setTimeout(() => URL.revokeObjectURL(imageUrl), 3000);
            
        } catch (error) {
            console.error("Error viewing image:", error);
            alert("Failed to view image: " + error.message);
        } finally {
            setLoading(false);
        }
    };
  
    // Function to format date in a readable way
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Search component for reuse
    const SearchComponent = () => (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-md font-medium text-gray-700 mb-2">Search Images</h3>
      <div className="flex flex-col sm:flex-row gap-2">
          <select 
              value={searchAttribute}
              onChange={(e) => setSearchAttribute(e.target.value)}
              className="flex-1 sm:flex-initial text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
              <option value="patientName">Patient Name</option>
              <option value="patientAge">Patient Age</option>
              <option value="patientGender">Patient Gender</option>
              <option value="patientDisease">Disease</option>
              <option value="fileName">File Name</option>
              {activeTab === 'sharedByMe' && <option value="receiverName">Receiver Name</option>}
          </select>
          <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="flex-1 text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button 
              onClick={() => setSearchTerm('')}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
              Clear
          </button>
      </div>
  </div>
    );

    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Medical Images Portal
          </h1>
          {status === "loading" ? (
            <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-gray-700">Loading session...</p>
            </div>
          ) : status === "authenticated" ? (
            <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700">
                Logged in as:{" "}
                <span className="font-semibold">{session.user.email}</span>
              </p>
            </div>
          ) : (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">
                Not logged in. Please sign in to continue.
              </p>
            </div>
          )}

          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`py-2 px-4 font-medium text-sm ${
                activeTab === "shared"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("shared")}
            >
              Share Images
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm ${
                activeTab === "received"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("received")}
            >
              Received Images{" "}
              {receivedImages.length > 0 && `(${receivedImages.length})`}
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm ${
                activeTab === "sharedByMe"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("sharedByMe")}
            >
              Shared by Me{" "}
              {sharedByMeImages.length > 0 && `(${sharedByMeImages.length})`}
            </button>
          </div>

          {activeTab === "shared" ? (
            <>
              {/* Show search component on the Share tab */}
              {uploadHistory.length > 0 && <SearchComponent />}

              {/* Receiver Email Input */}
              <div className="mb-6">
                <label
                  htmlFor="receiverEmail"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Receiver's Email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    id="receiverEmail"
                    value={receiverEmail}
                    onChange={(e) => setReceiverEmail(e.target.value)}
                    className="flex-1 text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email of the receiver"
                  />
                  <button
                    onClick={getReceiverId}
                    disabled={loading || !receiverEmail}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
                  >
                    Get Receiver
                  </button>
                </div>
              </div>

              {receiverUsername && (
                <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700">
                    Receiver found:{" "}
                    <span className="font-semibold">{receiverUsername}</span>
                  </p>
                </div>
              )}

              {/* Image Selection */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Select images to share 
                  {searchTerm && ` (Filtered: ${filteredUploadHistory.length} results)`}
                </h2>

                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : filteredUploadHistory.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUploadHistory.map((image) => (
                      <div
                        key={image._id}
                        className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                          selectedImages.some((i) => i._id === image._id)
                            ? "ring-2 ring-blue-500 border-blue-500"
                            : "border-gray-200"
                        }`}
                        onClick={() => toggleImageSelection(image)}
                      >
                        <div className="p-3 bg-gray-50 border-b">
                          <p className="font-medium text-gray-800 truncate">
                            {image.fileName}
                          </p>
                        </div>

                        <div className="p-4">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-gray-500">Patient:</div>
                            <div className="font-medium text-gray-700">
                              {image.patientName}
                            </div>

                            <div className="text-gray-500">Age:</div>
                            <div className="font-medium text-gray-700">
                              {image.patientAge}
                            </div>

                            <div className="text-gray-500">Gender:</div>
                            <div className="font-medium text-gray-700">
                              {image.patientGender}
                            </div>

                            <div className="text-gray-500">Disease:</div>
                            <div className="font-medium text-gray-700">
                              {image.patientDisease || "None"}
                            </div>
                          </div>
                        </div>

                        <div className="p-2 bg-gray-50 flex justify-end">
                          <input
                            type="checkbox"
                            checked={selectedImages.some(
                              (i) => i._id === image._id
                            )}
                            onChange={() => {}} // Handled by parent div click
                            className="h-5 w-5 text-blue-600"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : uploadHistory.length > 0 && searchTerm ? (
                  <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-500">
                      No images match your search criteria. Try different search terms.
                    </p>
                  </div>
                ) : (
                  <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-500">
                      No images found. Please enter your email and fetch your
                      uploads.
                    </p>
                  </div>
                )}
              </div>

              {/* Share Button */}
              {uploadHistory.length > 0 && (
                <div className="mt-6">
                  <button
                    onClick={shareSelectedImages}
                    disabled={
                      loading || selectedImages.length === 0 || !receiverId
                    }
                    className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 font-medium"
                  >
                    {loading
                      ? "Processing..."
                      : `Share ${selectedImages.length} Selected Images`}
                  </button>
                </div>
              )}
            </>
          ) : activeTab === "received" ? (
            /* RECEIVED IMAGES SECTION */
            <div className="mt-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Images Shared With You
              </h2>

              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : receivedImages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {receivedImages.map((image) => (
                    <div
                      key={image._id}
                      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                        <p className="font-medium text-gray-800 truncate">
                          {image.fileName}
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            image.status === "shared"
                              ? "bg-blue-100 text-blue-700"
                              : image.status === "viewed"
                              ? "bg-green-100 text-green-700"
                              : image.status === "downloaded"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {image.status.charAt(0).toUpperCase() +
                            image.status.slice(1)}
                        </span>
                      </div>

                      <div className="p-4">
                        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                          <div className="text-gray-500">Sender:</div>
                          <div className="font-medium text-gray-700">
                            {image.senderName}
                          </div>

                          <div className="text-gray-500">Patient:</div>
                          <div className="font-medium text-gray-700">
                            {image.patientName}
                          </div>

                          <div className="text-gray-500">Age/Gender:</div>
                          <div className="font-medium text-gray-700">
                            {image.patientAge} / {image.patientGender}
                          </div>

                          <div className="text-gray-500">Disease:</div>
                          <div className="font-medium text-gray-700">
                            {image.patientDisease || "None"}
                          </div>

                          <div className="text-gray-500">Shared:</div>
                          <div className="font-medium text-gray-700">
                            {formatDate(image.sharedAt)}
                          </div>
                        </div>

                        {image.notes && (
                          <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-100">
                            <p className="text-xs text-gray-500 mb-1">Notes:</p>
                            <p className="text-sm text-gray-700">
                              {image.notes}
                            </p>
                          </div>
                        )}

                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => viewImage(image)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
                          >
                            View Image
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500">
                    No shared images found. When someone shares medical images
                    with you, they will appear here.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* SHARED BY ME IMAGES SECTION */
            <div className="mt-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Images You've Shared
              </h2>

              {/* Show search component on the Shared By Me tab */}
              {sharedByMeImages.length > 0 && <SearchComponent />}

              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredSharedByMeImages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSharedByMeImages.map((image) => (
                    <div
                      key={image._id}
                      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                        <p className="font-medium text-gray-800 truncate">
                          {image.fileName}
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            image.status === "shared"
                              ? "bg-blue-100 text-blue-700"
                              : image.status === "viewed"
                              ? "bg-green-100 text-green-700"
                              : image.status === "downloaded"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {image.status.charAt(0).toUpperCase() +
                            image.status.slice(1)}
                        </span>
                      </div>

                      <div className="p-4">
                        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                          <div className="text-gray-500">Shared with:</div>
                          <div className="font-medium text-gray-700">
                            {image.receiverName}
                          </div>

                          <div className="text-gray-500">Patient:</div>
                          <div className="font-medium text-gray-700">
                            {image.patientName}
                          </div>

                          <div className="text-gray-500">Age/Gender:</div>
                          <div className="font-medium text-gray-700">
                            {image.patientAge} / {image.patientGender}
                          </div>

                          <div className="text-gray-500">Disease:</div>
                          <div className="font-medium text-gray-700">
                            {image.patientDisease || "None"}
                          </div>

                          <div className="text-gray-500">Shared on:</div>
                          <div className="font-medium text-gray-700">
                            {formatDate(image.sharedAt)}
                          </div>

                          <div className="text-gray-500">Status:</div>
                          <div className="font-medium text-gray-700">
                            {image.status === "shared"
                              ? "Not viewed yet"
                              : image.status === "viewed"
                              ? "Viewed by recipient"
                              : image.status === "downloaded"
                              ? "Downloaded by recipient"
                              : "Unknown status"}
                          </div>
                        </div>

                        {image.notes && (
                          <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-100">
                            <p className="text-xs text-gray-500 mb-1">
                              Your notes:
                            </p>
                            <p className="text-sm text-gray-700">
                              {image.notes}
                            </p>
                          </div>
                        )}

                        <div className="mt-4 flex justify-between">
                          <button
                            onClick={() => viewImage(image)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
                          >
                            View
                          </button>

                          <button
                          className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm'
                            onClick={async () => {
                              if (
                                confirm(
                                  "Do you want to revoke access to this image?"
                                )
                              ) {
                                try {
                                  const response = await fetch(
                                    "/api/revokeImageAccess",
                                    {
                                      method: "DELETE",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        imageId: image._id, // ✅ Match backend expectation
                                      }),
                                    }
                                  );

                                  if (response.ok) {
                                    alert("Access revoked successfully");
                                    if (userData) {
                                      fetchSharedByMeImages(userData); // Refresh image list
                                    }
                                  } else {
                                    const data = await response.json();
                                    throw new Error(data.message);
                                  }
                                } catch (error) {
                                  alert(
                                    "Failed to revoke access: " + error.message
                                  );
                                }
                              }
                            }}
                          >
                            Revoke Access
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500">
                    You haven't shared any images yet. Use the "Share Images"
                    tab to share images with others.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
};

export default Page;