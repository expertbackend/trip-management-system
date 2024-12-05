import React from "react";
import support from "../assets/support12.png";
import { FaCopy } from "react-icons/fa";
function Help() {
  const handleCopy = (number) => {
    // Using the Clipboard API to copy the number to the clipboard
    navigator.clipboard
      .writeText(number)
      .then(() => {
        alert("Phone number copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };
  return (
    <>
      <div className="text-center">
        <div className="flex justify-center ">
          <img src={support} alt="Support" />
        </div>
        <div className="flex justify-center mb-6">
          <h1 className="text-4xl font-bold">
            <span className="text-orange-500">24/7</span> Customer Services
          </h1>
        </div>
        <div className="flex justify-center">
          <ul className="p-0 space-y-4">
            <li className="flex items-center gap-3 mb-4">
              <span className="bg-blue-900 text-white font-semibold rounded-full h-10 w-10 flex items-center justify-center">
                1
              </span>
              <a
                href="mailto:expertsolutionbbsr@gmail.com"
                className="flex items-center gap-3 "
              >
                <span className="text-lg font-bold">
                  expertsolutionbbsr@gmail.com
                </span>
              </a>
            </li>
            <li className="flex items-center gap-3">
              {/* Number Circle */}
              <span className="bg-blue-900 text-white font-semibold rounded-full h-10 w-10 flex items-center justify-center">
                2
              </span>

              {/* Phone Number */}
              <a href="tel:+917509627777" className="flex items-center gap-3">
                <span className="text-lg font-bold">7509627777</span>
              </a>

              {/* Clipboard Icon (copy to clipboard) */}
              <button
                onClick={() => handleCopy("7509627777")}
                className="text-blue-800 hover:text-blue-900 ml-3"
                aria-label="Copy to clipboard"
              >
                <FaCopy/>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default Help;
