"use client";

import { Button } from "@/components/Button_S";
import axios from "axios";
import { AlertCircle, CheckCircle, Download, Upload } from "lucide-react";
import { useEffect, useState } from "react";

type Backup = {
  filename: string;
  size: number;
  createdAt: string;
};

export default function BackupRestoreSection() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch backups
  const fetchBackups = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const response = await axios.get(
        `/api/system/backups`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBackups(response.data.backups);
    } catch (error) {
      console.error("Error fetching backups:", error);
      setMessage({ type: "error", text: "Failed to fetch backups" });
    } finally {
      setIsLoading(false);
    }
  };

  // Create backup
  const handleBackup = async () => {
    try {
      setIsBackingUp(true);
      setMessage(null);

      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      await axios.post(
        `/api/system/backup`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: "success", text: "Database backup created successfully" });
      fetchBackups();
    } catch (error) {
      console.error("Error creating backup:", error);
      setMessage({ type: "error", text: "Failed to create backup" });
    } finally {
      setIsBackingUp(false);
    }
  };

  // Restore backup
  const handleRestore = async () => {
    if (!selectedBackup) {
      setMessage({ type: "error", text: "Please select a backup to restore" });
      return;
    }

    if (!window.confirm("Are you sure you want to restore this backup? This will overwrite the current database.")) {
      return;
    }

    try {
      setIsRestoring(true);
      setMessage(null);

      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      await axios.post(
        `/api/system/restore`,
        { filename: selectedBackup },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: "success", text: "Database restored successfully" });
    } catch (error) {
      console.error("Error restoring backup:", error);
      setMessage({ type: "error", text: "Failed to restore backup" });
    } finally {
      setIsRestoring(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Get file extension
  const getFileExtension = (filename: string) => {
    return filename.split('.').pop() || '';
  };

  // Get file icon based on extension
  const getFileIcon = (filename: string) => {
    const ext = getFileExtension(filename);
    switch (ext) {
      case 'json':
        return <span className="text-green-500 font-bold mr-2">JSON</span>;
      case 'gz':
        return <span className="text-blue-500 font-bold mr-2">GZ</span>;
      default:
        return <span className="text-gray-500 font-bold mr-2">FILE</span>;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Load backups on mount
  useEffect(() => {
    fetchBackups();
  }, []);

  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Backup & Restore</h3>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-3 rounded-md flex items-center ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-3 mb-4">
        <Button
          variant="secondary"
          onClick={handleBackup}
          disabled={isBackingUp}
          className="flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          {isBackingUp ? "Creating Backup..." : "Backup Database"}
        </Button>

        <Button
          variant="secondary"
          onClick={handleRestore}
          disabled={isRestoring || !selectedBackup}
          className="flex items-center"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isRestoring ? "Restoring..." : "Restore Backup"}
        </Button>
      </div>

      {/* Backups List */}
      <div className="border rounded-md overflow-hidden">
        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 font-medium">
          Available Backups
        </div>

        {isLoading ? (
          <div className="p-4 text-center">Loading backups...</div>
        ) : backups.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No backups available</div>
        ) : (
          <div className="max-h-60 overflow-y-auto">
            {backups.map((backup) => (
              <div
                key={backup.filename}
                className={`p-3 border-b last:border-b-0 flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedBackup === backup.filename ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  } ${getFileExtension(backup.filename) === 'json' ? 'border-l-2 border-l-green-500' : ''}`}
                onClick={() => setSelectedBackup(backup.filename)}
              >
                <input
                  type="radio"
                  name="backup"
                  checked={selectedBackup === backup.filename}
                  onChange={() => setSelectedBackup(backup.filename)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium flex items-center">
                    {getFileIcon(backup.filename)}
                    {backup.filename}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatFileSize(backup.size)} • {formatDate(backup.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
