import React from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function Blog() {
  return (
    <div className="max-w-6xl mx-auto mt-4">
      <div>
        <div className="flex justify-between items-center w-full h-48">
          <div className="flex gap-2 w-1/3 h-12 ml-3">
            <button className="bg-indigo-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
              <ArrowLeft size={15} />
            </button>
            <button className="bg-indigo-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="w-2/3">
            <div className="flex gap-4 items-center">
              <a className="flex w-full max-w-xl h-32 border-5 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src="https://www.nvidia.com/content/dam/en-zz/Solutions/geforce/graphic-cards/50-series/rtx-5090/geforce-rtx-5090-learn-more-og-1200x630.jpg"
                  className="w-1/2 h-full object-cover"
                />
                <div className="flex flex-col justify-center px-4 bg-gray-200 w-2/3">
                  <p className="text-lg font-semibold">RTX 5090</p>
                </div>
              </a>

              <a className="flex w-full max-w-xl h-32 border-5 rounded-lg overflow-hidden">
                <img
                  src="https://www.nvidia.com/content/dam/en-zz/Solutions/geforce/graphic-cards/50-series/rtx-5090/geforce-rtx-5090-learn-more-og-1200x630.jpg"
                  className="w-1/2 h-full object-cover"
                />
                <div className="flex flex-col justify-center px-4 bg-gray-200 w-2/3">
                  <p className="text-lg font-semibold">RTX 5090</p>
                </div>
              </a>

              <a className="flex w-full max-w-xl h-32 border-5 rounded-lg overflow-hidden">
                <img
                  src="https://www.nvidia.com/content/dam/en-zz/Solutions/geforce/graphic-cards/50-series/rtx-5090/geforce-rtx-5090-learn-more-og-1200x630.jpg"
                  className="w-1/2 h-full object-cover"
                />
                <div className="flex flex-col justify-center px-4 bg-gray-200 w-2/3">
                  <p className="text-lg font-semibold">RTX 5090</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div>Blog</div>
      </div>
    </div>
  );
}
