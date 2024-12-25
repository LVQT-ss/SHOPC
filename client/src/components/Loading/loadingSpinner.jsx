import React from "react";

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">
        Loading products...
      </p>
    </div>
  );
}
