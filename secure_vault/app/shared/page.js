"use client"
import React, { useState, useEffect } from 'react'
import { useSession } from "next-auth/react"
import { fetchUser } from "../actions/fetchDetails";
import { fetchUploads } from "../actions/fetchDetails";
import { fetchImageDetails } from "../actions/fetchDetails";

const Page = () => {
    const { data: session, status } = useSession();
    const [receiverId, setReceiverId] = useState('');
    const [receiverEmail, setReceiverEmail] = useState('');
    const [receiverUsername, setReceiverUsername] = useState('');
    const [uploadHistory, setUploadHistory] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [userEmail, setUserEmail] = useState(''); // Add state for user's email
    const [loading, setLoading] = useState(false);
    

    // Fetch user's uploads when component mounts or when userEmail changes
    useEffect(() => {
        if (status === "authenticated" && session?.user?.email) {
            fetchUserData(session.user.email);
        }
    }, [status, session]);

    const fetchUserData = async (email) => {
        setLoading(true);
        try {
            const userData = await fetchUser(email);

            if (userData) {
                const images = await fetchUploads(userData);
                setUploadHistory(images);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
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
    return (
        <div className='min-h-screen bg-gray-100 p-4'>
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Share Medical Images</h1>
                {status === "loading" ? (
                    <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-gray-700">Loading session...</p>
                    </div>
                ) : status === "authenticated" ? (
                    <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-700">Logged in as: <span className="font-semibold">{session.user.email}</span></p>
                    </div>
                ) : (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700">Not logged in. Please sign in to continue.</p>
                    </div>
                )}
                {/* User Email Input */}
                <div className="mb-6">
                    <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            id="userEmail"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            className="flex-1 text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your email"
                        />
                        <button
                            onClick={fetchUserData}
                            disabled={loading || !userEmail}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 disabled:bg-gray-300"
                        >
                            Fetch Images
                        </button>
                    </div>
                </div>
                
                {/* Receiver Email Input */}
                <div className="mb-6">
                    <label htmlFor="receiverEmail" className="block text-sm font-medium text-gray-700 mb-1">Receiver's Email</label>
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
                            Get Receiver ID
                        </button>
                    </div>
                </div>
                
                {receiverUsername && (
                    <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-700">Receiver found: <span className="font-semibold">{receiverUsername}</span></p>
                    </div>
                )}
                
                {/* Image Selection */}
                <div className="mt-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Select images to share</h2>
                    
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : uploadHistory.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {uploadHistory.map((image) => (
                                <div
                                    key={image._id}
                                    className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                                        selectedImages.includes(image._id) ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'
                                    }`}
                                    onClick={() => toggleImageSelection(image._id)}
                                >
                                    <div className="p-3 bg-gray-50 border-b">
                                        <p className="font-medium text-gray-800 truncate">{image.fileName}</p>
                                    </div>
                                    
                                    <div className="p-4">
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="text-gray-500">Patient:</div>
                                            <div className="font-medium text-gray-700">{image.patientName}</div>
                                            
                                            <div className="text-gray-500">Age:</div>
                                            <div className="font-medium text-gray-700">{image.patientAge}</div>
                                            
                                            <div className="text-gray-500">Gender:</div>
                                            <div className="font-medium text-gray-700">{image.patientGender}</div>
                                            
                                            <div className="text-gray-500">Disease:</div>
                                            <div className="font-medium text-gray-700">{image.patientDisease || "None"}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-2 bg-gray-50 flex justify-end">
                                        <input
                                            type="checkbox"
                                            checked={selectedImages.includes(image._id)}
                                            onChange={() => {}} // Handled by parent div click
                                            className="h-5 w-5 text-blue-600"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-500">No images found. Please enter your email and fetch your uploads.</p>
                        </div>
                    )}
                </div>
                
                {/* Share Button */}
                {uploadHistory.length > 0 && (
                    <div className="mt-6">
                        <button
                            onClick={shareSelectedImages}
                            disabled={loading || selectedImages.length === 0 || !receiverId}
                            className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 font-medium"
                        >
                            {loading ? "Processing..." : `Share ${selectedImages.length} Selected Images`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Page;