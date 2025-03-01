import { useState, useEffect } from "react";
import { fetchUser } from "../actions/fetchDetails";
import { fetchUploads } from "../actions/fetchDetails";

export default function FileUpload({ useremail }) {
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [decryptedImage, setDecryptedImage] = useState(null);
  const [iv, setIv] = useState(""); // IV for current upload
  const [uploadHistory, setUploadHistory] = useState([]); // List of uploads from MongoDB
  const [isModalOpen, setIsModalOpen] = useState(false); // For enlarged image view

  // Function to fetch upload history from your backend (MongoDB)
  const getData = async () => {
    let u = await fetchUser(useremail);
    let images = await fetchUploads(u);
    setUploadHistory(images);
  };
  

  useEffect(() => {
    getData();
  }, []);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");
    setLoading(true);
    try {
      const { encryptedData, iv } = await encryptImage(file);
      const formData = new FormData();
      formData.append("file", new Blob([encryptedData])); // Encrypted file
      formData.append("iv", iv); // IV as base64 string
      formData.append("useremail", useremail); // Pass the user identifier

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      if (data.hash) {
        setHash(data.hash);
        setIv(iv);
        // After a successful upload, re-fetch the uploads from MongoDB
        getData();
      } else {
        alert("Upload failed: Hash not found");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Upload failed");
    }
    setLoading(false);
  };

  // Decrypt the most recent upload
  const handleDecrypt = async () => {
    if (!hash) return alert("No encrypted file to decrypt");
    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`);
      if (!response.ok) throw new Error("Failed to download encrypted file");
      const encryptedData = new Uint8Array(await response.arrayBuffer());
      const decryptedBlob = await decryptImage(encryptedData, iv);
      setDecryptedImage(URL.createObjectURL(decryptedBlob));
    } catch (error) {
      console.error("Decryption error:", error);
      alert("Failed to decrypt file");
    }
  };

  // Decrypt an image from upload history
  const handleDecryptHistory = async (record) => {
    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${record.hash}`);
      if (!response.ok) throw new Error("Failed to download encrypted file");
      const encryptedData = new Uint8Array(await response.arrayBuffer());
      const decryptedBlob = await decryptImage(encryptedData, record.iv);
      setDecryptedImage(URL.createObjectURL(decryptedBlob));
    } catch (error) {
      console.error("Decryption error:", error);
      alert("Failed to decrypt file from history");
    }
  };

  // Hide the decrypted image
  const handleHideImage = () => {
    setDecryptedImage(null);
  };

  // Open modal for enlarged view
  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 border rounded-lg shadow-md max-w-md mx-auto relative">
      <h2 className="text-xl font-bold mb-4">Upload to IPFS (Encrypted)</h2>
      <div className="mb-4">
        <input type="file" onChange={handleFileChange} className="mb-2 w-full" />
        <button
          onClick={handleUpload}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400 w-full"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {hash && (
        <div className="mt-4 p-3 border rounded bg-gray-100 relative">
          <p>
            <strong>Encrypted File Hash:</strong>
          </p>
          <p className="mb-2 break-all">
            <strong>IPFS:</strong> {hash}
          </p>
          <p>
            <a
              href={`https://gateway.pinata.cloud/ipfs/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View on IPFS
            </a>
          </p>
          <button
            onClick={handleDecrypt}
            className="bg-green-500 text-white px-4 py-2 mt-3 rounded w-full"
          >
            Decrypt and View
          </button>
        </div>
      )}

      {uploadHistory.length > 0 && (
        <div className="mt-6 p-3 border rounded bg-gray-50">
          <h3 className="text-lg font-bold mb-2">Upload History</h3>
          {uploadHistory.map((upload, index) => (
            <div key={upload._id || index} className="border p-2 rounded mb-2">
              <p className="text-sm">
                <strong>{upload.fileName}</strong>
              </p>
              <p className="text-xs text-gray-600">
                {new Date(upload.uploadDate).toLocaleString()}
              </p>
              <p>
                <a
                  href={`https://gateway.pinata.cloud/ipfs/${upload.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-xs"
                >
                  View on IPFS
                </a>
              </p>
              <button
                onClick={() => handleDecryptHistory(upload)}
                className="bg-green-500 text-white px-2 py-1 mt-2 rounded text-xs"
              >
                Decrypt & View
              </button>
            </div>
          ))}
        </div>
      )}

      {decryptedImage && (
        <div className="mt-4 p-3 border rounded bg-gray-100 relative">
          {/* Cross button to hide the image */}
          <button
            onClick={handleHideImage}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
            title="Hide Image"
          >
            &times;
          </button>
          <p>
            <strong>Decrypted Image:</strong>
          </p>
          <img
            src={decryptedImage}
            alt="Decrypted"
            className="w-full mt-2 rounded cursor-pointer transition-transform duration-200 hover:scale-105"
            onClick={handleImageClick}
          />
        </div>
      )}

      {/* Modal for enlarged image view */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="relative max-w-3xl max-h-full">
            <button
              onClick={handleCloseModal}
              className="absolute top-0 right-0 m-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
              title="Close Enlarged View"
            >
              &times;
            </button>
            <img
              src={decryptedImage}
              alt="Enlarged Decrypted"
              className="max-w-full max-h-full rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Encrypt the file using AES-CBC
async function encryptImage(file) {
  const iv = crypto.getRandomValues(new Uint8Array(16)); // 16-byte IV
  const keyBuffer = new TextEncoder().encode("0123456789abcdef0123456789abcdef"); // 32-byte key
  const key = await crypto.subtle.importKey("raw", keyBuffer, { name: "AES-CBC" }, false, ["encrypt"]);
  const fileBuffer = await file.arrayBuffer();
  const encryptedData = await crypto.subtle.encrypt({ name: "AES-CBC", iv }, key, fileBuffer);
  return { encryptedData: new Uint8Array(encryptedData), iv: Buffer.from(iv).toString("base64") };
}

// Decrypt the file using AES-CBC
async function decryptImage(encryptedData, iv) {
  const ivBuffer = new Uint8Array(Buffer.from(iv, "base64"));
  const keyBuffer = new TextEncoder().encode("0123456789abcdef0123456789abcdef");
  const key = await crypto.subtle.importKey("raw", keyBuffer, { name: "AES-CBC" }, false, ["decrypt"]);
  const decryptedData = await crypto.subtle.decrypt({ name: "AES-CBC", iv: ivBuffer }, key, encryptedData);
  return new Blob([decryptedData]);
}
