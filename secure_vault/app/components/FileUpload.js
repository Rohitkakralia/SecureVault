import { useState, useEffect } from "react";

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadHistory, setUploadHistory] = useState([]);

  // Load previous uploads from localStorage on component mount
  useEffect(() => {
    const savedUploads = localStorage.getItem("ipfsUploads");
    if (savedUploads) {
      setUploadHistory(JSON.parse(savedUploads));
    }
  }, []);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) return alert("Please select a file");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      console.log("File:", file);
      console.log("FormData:", formData);

      console.log("Requesting upload...");
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      if (data.hash) {
        const newHash = data.hash;
        setHash(newHash);
        
        // Save to localStorage
        const newUpload = {
          hash: newHash,
          fileName: file.name,
          fileSize: file.size,
          uploadDate: new Date().toISOString(),
        };
        
        const updatedHistory = [newUpload, ...uploadHistory].slice(0, 10); // Keep only the last 10 uploads
        setUploadHistory(updatedHistory);
        localStorage.setItem("ipfsUploads", JSON.stringify(updatedHistory));
      } else {
        alert("Upload failed: Hash not found");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Upload failed");
    }

    setLoading(false);
  };

  const clearHistory = () => {
    localStorage.removeItem("ipfsUploads");
    setUploadHistory([]);
  };

  return (
    <div className="p-4 border rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Upload to IPFS</h2>
      
      <div className="mb-4">
        <input 
          type="file" 
          onChange={handleFileChange} 
          className="mb-2 w-full" 
        />
        <button 
          onClick={handleUpload} 
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400 w-full"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {hash && (
        <div className="mt-4 p-3 border rounded bg-gray-100">
          <p><strong>Current Upload:</strong></p>
          <p className="mb-2 break-all"><strong>Hash:</strong> {hash}</p>
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
        </div>
      )}

      {uploadHistory.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Upload History</h3>
            <button 
              onClick={clearHistory}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Clear History
            </button>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {uploadHistory.map((item, index) => (
              <div key={index} className="p-2 border-b last:border-b-0">
                <p className="font-medium">{item.fileName}</p>
                <p className="text-sm text-gray-600 break-all">Hash: {item.hash}</p>
                <p className="text-xs text-gray-500">
                  {new Date(item.uploadDate).toLocaleString()}
                </p>
                <a 
                  href={`https://gateway.pinata.cloud/ipfs/${item.hash}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-blue-600 hover:underline"
                >
                  View on IPFS
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}