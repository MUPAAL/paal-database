"use client";

import { Button } from "@/components/Button_S";
import axios from "axios";
import { AlertCircle, CheckCircle, Eye, FileText } from "lucide-react";
import { useEffect, useState } from "react";

type LogFile = {
  filename: string;
  size: number;
  createdAt: string;
};

export default function SystemLogsSection() {
  const [logs, setLogs] = useState<LogFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isViewingLog, setIsViewingLog] = useState(false);
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const [logContent, setLogContent] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch logs
  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const response = await axios.get(
        `/api/system/logs`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLogs(response.data.logs);
    } catch (error) {
      console.error("Error fetching logs:", error);
      setMessage({ type: "error", text: "Failed to fetch logs" });
    } finally {
      setIsLoading(false);
    }
  };

  // View log
  const handleViewLog = async (filename: string) => {
    try {
      setIsViewingLog(true);
      setLogContent(null);
      setSelectedLog(filename);

      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const response = await axios.get(
        `/api/system/logs/${filename}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLogContent(response.data.content);
    } catch (error) {
      console.error("Error viewing log:", error);
      setMessage({ type: "error", text: "Failed to view log" });
    } finally {
      setIsViewingLog(false);
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

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Load logs on mount
  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div>
      <h3 className="text-lg font-medium mb-3">System Logs</h3>

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
          onClick={fetchLogs}
          disabled={isLoading}
          className="flex items-center"
        >
          <FileText className="h-4 w-4 mr-2" />
          {isLoading ? "Loading Logs..." : "Refresh Logs"}
        </Button>
      </div>

      {/* Logs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Log Files */}
        <div className="border rounded-md overflow-hidden">
          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 font-medium">
            Log Files
          </div>

          {isLoading ? (
            <div className="p-4 text-center">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No logs available</div>
          ) : (
            <div className="max-h-60 overflow-y-auto">
              {logs.map((log) => (
                <div
                  key={log.filename}
                  className={`p-3 border-b last:border-b-0 flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedLog === log.filename ? "bg-blue-50 dark:bg-blue-900/20" : ""
                    }`}
                  onClick={() => handleViewLog(log.filename)}
                >
                  <FileText className="h-4 w-4 mr-3 text-gray-400" />
                  <div className="flex-1">
                    <div className="font-medium">{log.filename}</div>
                    <div className="text-sm text-gray-500">
                      {formatFileSize(log.size)} • {formatDate(log.createdAt)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewLog(log.filename);
                    }}
                    className="ml-2"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Log Content */}
        <div className="border rounded-md overflow-hidden">
          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 font-medium">
            Log Content {selectedLog && `- ${selectedLog}`}
          </div>

          <div className="p-2">
            {isViewingLog ? (
              <div className="p-2 text-center">Loading log content...</div>
            ) : !selectedLog ? (
              <div className="p-2 text-center text-gray-500">Select a log file to view its content</div>
            ) : !logContent ? (
              <div className="p-2 text-center text-gray-500">No content available</div>
            ) : (
              <pre className="text-xs p-2 bg-gray-50 dark:bg-gray-900 rounded border overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap">
                {logContent}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
