import React from "react";

export function Toast({ message, type = "info", onClose }) {
  if (!message) return null;
  let bgColor = "bg-gray-800";
  if (type === "success") bgColor = "bg-emerald-600";
  if (type === "error") bgColor = "bg-red-600";
  if (type === "warning") bgColor = "bg-yellow-500";

  return (
    <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-lg shadow-lg text-white font-semibold ${bgColor}`}>
      <span>{message}</span>
      <button
        className="ml-4 px-2 py-1 bg-black bg-opacity-30 rounded hover:bg-opacity-50"
        onClick={onClose}
        aria-label="Close toast"
      >
        ×
      </button>
    </div>
  );
}
