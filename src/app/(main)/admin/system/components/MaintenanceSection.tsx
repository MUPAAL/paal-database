"use client";

import { Button } from "@/components/Button_S";
import { Card } from "@/components/Card";
import axios from "axios";
import { Activity, AlertCircle, CheckCircle, Trash } from "lucide-react";
import { useState } from "react";

export default function MaintenanceSection() {
  const [isClearing, setIsClearing] = useState(false);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [diagnosticsResult, setDiagnosticsResult] = useState<any>(null);

  // Clear cache
  const handleClearCache = async () => {
    try {
      setIsClearing(true);
      setMessage(null);

      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const response = await axios.post(
        `/api/system/clear-cache`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: "success", text: "Cache cleared successfully" });
    } catch (error) {
      console.error("Error clearing cache:", error);
      setMessage({ type: "error", text: "Failed to clear cache" });
    } finally {
      setIsClearing(false);
    }
  };

  // Run diagnostics
  const handleRunDiagnostics = async () => {
    try {
      setIsRunningDiagnostics(true);
      setMessage(null);
      setDiagnosticsResult(null);

      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const response = await axios.post(
        `/api/system/diagnostics`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDiagnosticsResult(response.data.diagnostics);
      setMessage({ type: "success", text: "Diagnostics completed successfully" });
    } catch (error) {
      console.error("Error running diagnostics:", error);
      setMessage({ type: "error", text: "Failed to run diagnostics" });
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  // Format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Format uptime
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Maintenance</h3>

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
          onClick={handleClearCache}
          disabled={isClearing}
          className="flex items-center"
        >
          <Trash className="h-4 w-4 mr-2" />
          {isClearing ? "Clearing Cache..." : "Clear Cache"}
        </Button>

        <Button
          variant="secondary"
          onClick={handleRunDiagnostics}
          disabled={isRunningDiagnostics}
          className="flex items-center"
        >
          <Activity className="h-4 w-4 mr-2" />
          {isRunningDiagnostics ? "Running Diagnostics..." : "Run Diagnostics"}
        </Button>
      </div>

      {/* Diagnostics Results */}
      {diagnosticsResult && (
        <Card className="p-4 mt-4 max-h-96 overflow-y-auto">
          <h4 className="font-medium mb-3">Diagnostics Results</h4>

          <div className="space-y-4">
            {/* OS Info */}
            <div>
              <h5 className="font-medium text-sm text-gray-500 mb-2">Operating System</h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Platform:</span>
                  <span>{diagnosticsResult.os.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Type:</span>
                  <span>{diagnosticsResult.os.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Release:</span>
                  <span>{diagnosticsResult.os.release}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Architecture:</span>
                  <span>{diagnosticsResult.os.arch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Uptime:</span>
                  <span>{formatUptime(diagnosticsResult.os.uptime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">CPU Cores:</span>
                  <span>{diagnosticsResult.os.cpus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total Memory:</span>
                  <span>{formatBytes(diagnosticsResult.os.totalmem)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Free Memory:</span>
                  <span>{formatBytes(diagnosticsResult.os.freemem)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Load Average:</span>
                  <span>{diagnosticsResult.os.loadavg.map((load: number) => load.toFixed(2)).join(", ")}</span>
                </div>
              </div>
            </div>

            {/* Process Info */}
            <div>
              <h5 className="font-medium text-sm text-gray-500 mb-2">Process</h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">PID:</span>
                  <span>{diagnosticsResult.process.pid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">PPID:</span>
                  <span>{diagnosticsResult.process.ppid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Title:</span>
                  <span>{diagnosticsResult.process.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Node Version:</span>
                  <span>{diagnosticsResult.process.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Uptime:</span>
                  <span>{formatUptime(diagnosticsResult.process.uptime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">RSS Memory:</span>
                  <span>{formatBytes(diagnosticsResult.process.memoryUsage.rss)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Heap Total:</span>
                  <span>{formatBytes(diagnosticsResult.process.memoryUsage.heapTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Heap Used:</span>
                  <span>{formatBytes(diagnosticsResult.process.memoryUsage.heapUsed)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">External:</span>
                  <span>{formatBytes(diagnosticsResult.process.memoryUsage.external)}</span>
                </div>
              </div>
            </div>

            {/* Timestamp */}
            <div className="text-xs text-gray-500 text-right">
              Generated at: {new Date(diagnosticsResult.timestamp).toLocaleString()}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
