import React from "react";
import support from "../assets/support12.png";
import { FaCopy } from "react-icons/fa";
import { useState } from "react";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
function Help() {
  const [copied, Setcopied] = useState("");
  const handleCopy = (text) => {
    // Using the Clipboard API to copy the number to the clipboard
    navigator.clipboard.writeText(text);
    Setcopied(text);
    // .then(() => {
    //   alert("Phone number copied to clipboard!");
    // })
    // .catch((err) => {
    //   console.error("Failed to copy: ", err);
    // });
  };

  const [openIndexes, setOpenIndexes] = useState([]);

  // Toggle the state of a specific FAQ question
  const handleClick = (id) => {
    // console.log("idddddddddddd", id);
    setOpenIndexes((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [id]
    );
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

              <button
                onClick={() => handleCopy("expertsolutionbbsr@gmail.com")}
                className="text-blue-800 hover:text-blue-900 ml-3"
                aria-label="Copy email to clipboard"
              >
                <FaCopy />
              </button>
              {copied === "expertsolutionbbsr@gmail.com" && (
                <span className="text-green-500 text-sm ml-2">Copied!
                </span>
              )}
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
                aria-label="NUmber Copy to clipboard"
              >
                <FaCopy />
              </button>
              {copied === "7509627777" && (
                <span className="text-green-500 text-sm ml-2">Copied!</span>
              )}
            </li>
          </ul>
        </div>
      </div>

      {/* Faq */}
      <div className="mt-4 sm:mt-7">
        <div className="bg-gray-50 px-10 py-16 rounded-lg">
          <h1 className="text-center font-bold text-5xl pb-10">
            Frequently Asked Questions
          </h1>

          {/* Question 1 */}
          <div className=" rounded pb-5 ">
            <div
              className="flex justify-between text-xl p-4 border-b-2 border-gray-200 cursor-pointer"
              onClick={() => handleClick(0)}
            >
              <div>What's the best thing about Trip management system?</div>
              <div>
                <button onClick={() => handleClick(0)}>
                  {openIndexes.includes(0) ? (
                    <AiOutlineMinus />
                  ) : (
                    <AiOutlinePlus />
                  )}
                </button>
              </div>
            </div>
            <div
              className={`flex w-full p-3 ${
                openIndexes.includes(0) ? "" : "hidden"
              }`}
            >
              <p className="text-gray-600 border-b-2 pb-4 text-md ">
                We are providing customise features with reduce costs and
                provide faster, cost-effective services with the best tracker,
                enabling efficient vehicle and human resource management. Create
                and manage bookings, track expenses by driver, modify and view
                expenses, store documents digitally, assign user permissions,
                and enjoy flexible data storage—all at your fingertips with
                real-time updates and trip reports.
              </p>
            </div>
          </div>

          {/* Question 2 */}
          <div className="rounded pb-5">
            <div
              className="flex justify-between text-xl p-4 border-b-2 border-gray-200 cursor-pointer"
              onClick={() => handleClick(1)}
            >
              <div>How can I contact customer support?</div>
              <div>
                <button onClick={() => handleClick(1)}>
                  {openIndexes.includes(1) ? (
                    <AiOutlineMinus />
                  ) : (
                    <AiOutlinePlus />
                  )}
                </button>
              </div>
            </div>
            <div
              className={`flex w-full p-3 ${
                openIndexes.includes(1) ? "" : "hidden"
              }`}
            >
              <p className="text-gray-600 border-b-2 pb-4 text-md">
                We are dedicated to providing effective solutions to our
                happiest customers. We are available 24/7 to assist you. For
                support, email us at expgpsrpr@gmail.com, call 7509627777 /
                7509617777, or visit our website at expsolutions.net
              </p>
            </div>
          </div>
          {/* Question 3 */}
          <div className="rounded pb-5">
            <div
              className="flex justify-between text-xl p-4 border-b-2 border-gray-200 cursor-pointer"
              onClick={() => handleClick(2)}
            >
              <div>How to create an account?</div>
              <div>
                <button onClick={() => handleClick(2)}>
                  {openIndexes.includes(2) ? (
                    <AiOutlineMinus />
                  ) : (
                    <AiOutlinePlus />
                  )}
                </button>
              </div>
            </div>
            <div
              className={`flex w-full p-3 ${
                openIndexes.includes(2) ? "" : "hidden"
              }`}
            >
              <p className="text-gray-600 border-b-2 pb-4 text-md">
                Please contact our admin and provide your details. They will
                generate your user ID and password for accessing our website.
              </p>
            </div>
          </div>
          {/* Question 4 */}
          <div className="rounded pb-5">
            <div
              className="flex justify-between text-xl p-4 border-b-2 border-gray-200 cursor-pointer"
              onClick={() => handleClick(3)}
            >
              <div>What is the payment process?</div>
              <div>
                <button onClick={() => handleClick(3)}>
                  {openIndexes.includes(3) ? (
                    <AiOutlineMinus />
                  ) : (
                    <AiOutlinePlus />
                  )}
                </button>
              </div>
            </div>
            <div
              className={`flex w-full p-3 ${
                openIndexes.includes(3) ? "" : "hidden"
              }`}
            >
              <p className="text-gray-600 border-b-2 pb-4 text-md">
                Please contact our admin for assistance with the payment
                process.
              </p>
            </div>
          </div>
          {/* Question 5 */}
          <div className="rounded pb-5">
            <div
              className="flex justify-between text-xl p-4 border-b-2 border-gray-200 cursor-pointer"
              onClick={() => handleClick(4)}
            >
              <div>How do I find my purchase history?</div>
              <div>
                <button onClick={() => handleClick(4)}>
                  {openIndexes.includes(4) ? (
                    <AiOutlineMinus />
                  ) : (
                    <AiOutlinePlus />
                  )}
                </button>
              </div>
            </div>
            <div
              className={`flex w-full p-3 ${
                openIndexes.includes(4) ? "" : "hidden"
              }`}
            >
              <p className="text-gray-600 border-b-2 pb-4 text-md">
                Go to your profile, and under 'Available Plans,' you'll find
                your plan history below.
              </p>
            </div>
          </div>
          {/* Question 6 */}

          <div className="rounded pb-5">
            <div
              className="flex justify-between text-xl p-4 border-b-2 border-gray-200 cursor-pointer"
              onClick={() => handleClick(5)}
            >
              <div>How do I delete my account?</div>
              <div>
                <button onClick={() => handleClick(5)}>
                  {openIndexes.includes(5) ? (
                    <AiOutlineMinus />
                  ) : (
                    <AiOutlinePlus />
                  )}
                </button>
              </div>
            </div>
            <div
              className={`flex w-full p-3 ${
                openIndexes.includes(5) ? "" : "hidden"
              }`}
            >
              <p className="text-gray-600 border-b-2 pb-4 text-md">
                To delete your account, please contact customer support or the
                admin for assistance.
              </p>
            </div>
          </div>
          {/* Question 7 */}
          <div className="rounded pb-5">
            <div
              className="flex justify-between text-xl p-4 shadow-sm border-gray-200 cursor-pointer"
              onClick={() => handleClick(6)}
            >
              <div> What does the tyre management feature include?</div>
              <div>
                <button onClick={() => handleClick(6)}>
                  {openIndexes.includes(6) ? (
                    <AiOutlineMinus />
                  ) : (
                    <AiOutlinePlus />
                  )}
                </button>
              </div>
            </div>
            <div
              className={`flex w-full p-3 ${
                openIndexes.includes(6) ? "" : "hidden"
              }`}
            >
              <p className="text-gray-600 border-b-2 pb-4 text-md">
                The tyre management feature tracks tyre history, wear and tear,
                replacement schedules, and ensures optimal tyre performance.
              </p>
            </div>
          </div>
          {/* Question 8 */}
          <div className="rounded pb-5">
            <div
              className="flex justify-between text-xl p-4 border-b-2 border-gray-200 cursor-pointer"
              onClick={() => handleClick(7)}
            >
              <div>How does mileage tracking work?</div>
              <div>
                <button onClick={() => handleClick(7)}>
                  {openIndexes.includes(7) ? (
                    <AiOutlineMinus />
                  ) : (
                    <AiOutlinePlus />
                  )}
                </button>
              </div>
            </div>
            <div
              className={`flex w-full p-3 ${
                openIndexes.includes(7) ? "" : "hidden"
              }`}
            >
              <p className="text-gray-600 border-b-2 pb-4 text-md">
                Mileage tracking is integrated with GPS data and odometer
                readings to provide accurate vehicle mileage for better fuel
                efficiency analysis.
              </p>
            </div>
          </div>
          {/* Question 9 */}
          <div className="rounded pb-5">
            <div
              className="flex justify-between text-xl p-4 border-b-2 border-gray-200 cursor-pointer"
              onClick={() => handleClick(8)}
            >
              <div>How does the service reminder system work?</div>
              <div>
                <button onClick={() => handleClick(8)}>
                  {openIndexes.includes(8) ? (
                    <AiOutlineMinus />
                  ) : (
                    <AiOutlinePlus />
                  )}
                </button>
              </div>
            </div>
            <div
              className={`flex w-full p-3 ${
                openIndexes.includes(8) ? "" : "hidden"
              }`}
            >
              <p className="text-gray-600 border-b-2 pb-4 text-md">
                The system notifies you about upcoming services based on
                mileage, time, or custom schedules to ensure timely maintenance.
              </p>
            </div>
          </div>
          {/* Question 10 */}
          <div className="rounded pb-5">
            <div
              className="flex justify-between text-xl p-4 border-b-2 border-gray-200 cursor-pointer"
              onClick={() => handleClick(9)}
            >
              <div>Can I customize service intervals?</div>
              <div>
                <button onClick={() => handleClick(9)}>
                  {openIndexes.includes(9) ? (
                    <AiOutlineMinus />
                  ) : (
                    <AiOutlinePlus />
                  )}
                </button>
              </div>
            </div>
            <div
              className={`flex w-full p-3 ${
                openIndexes.includes(9) ? "" : "hidden"
              }`}
            >
              <p className="text-gray-600 border-b-2 pb-4 text-md">
                Yes, you can set service intervals based on manufacturer
                recommendations or your preferences.
              </p>
            </div>
          </div>
          {/* Question 11 */}
          <div className="rounded pb-5">
            <div
              className="flex justify-between text-xl p-4 border-b-2 border-gray-200 cursor-pointer"
              onClick={() => handleClick(10)}
            >
              <div>What is the documents remaining feature?</div>
              <div>
                <button onClick={() => handleClick(10)}>
                  {openIndexes.includes(10) ? (
                    <AiOutlineMinus />
                  ) : (
                    <AiOutlinePlus />
                  )}
                </button>
              </div>
            </div>
            <div
              className={`flex w-full p-3 ${
                openIndexes.includes(10) ? "" : "hidden"
              }`}
            >
              <p className="text-gray-600 border-b-2 pb-4 text-md">
                This feature tracks important documents like permits, insurance,
                and registration, notifying you when renewals are due.
              </p>
            </div>
          </div>
          {/*Question 12 */}
          <div className="rounded pb-5">
            <div
              className="flex justify-between text-xl p-4 border-b-2 border-gray-200 cursor-pointer"
              onClick={() => handleClick(11)}
            >
              <div> Can the system upload and store vehicle documents?</div>
              <div>
                <button onClick={() => handleClick(11)}>
                  {openIndexes.includes(11) ? (
                    <AiOutlineMinus />
                  ) : (
                    <AiOutlinePlus />
                  )}
                </button>
              </div>
            </div>
            <div
              className={`flex w-full p-3 ${
                openIndexes.includes(11) ? "" : "hidden"
              }`}
            >
              <p className="text-gray-600 border-b-2 pb-4 text-md">
                Yes, you can upload and store digital copies of all important
                documents for easy access.
              </p>
            </div>
          </div>
          {/*Question 13 */}
          <div className="rounded pb-5">
            <div
              className="flex justify-between text-xl p-4 border-b-2 border-gray-200 cursor-pointer"
              onClick={() => handleClick(12)}
            >
              <div>What does the driver management system offer?</div>
              <div>
                <button onClick={() => handleClick(12)}>
                  {openIndexes.includes(12) ? (
                    <AiOutlineMinus />
                  ) : (
                    <AiOutlinePlus />
                  )}
                </button>
              </div>
            </div>
            <div
              className={`flex w-full p-3 ${
                openIndexes.includes(12) ? "" : "hidden"
              }`}
            >
              <p className="text-gray-600 border-b-2 pb-4 text-md">
                It includes driver profiles, performance tracking, license
                validity reminders, and salary records.
              </p>
            </div>
          </div>
          {/*Question 14 */}
          <div className="rounded pb-5">
            <div
              className="flex justify-between text-xl p-4 border-b-2 border-gray-200 cursor-pointer"
              onClick={() => handleClick(13)}
            >
              <div>Can I monitor driver behavior?</div>
              <div>
                <button onClick={() => handleClick(13)}>
                  {openIndexes.includes(13) ? (
                    <AiOutlineMinus />
                  ) : (
                    <AiOutlinePlus />
                  )}
                </button>
              </div>
            </div>
            <div
              className={`flex w-full p-3 ${
                openIndexes.includes(13) ? "" : "hidden"
              }`}
            >
              <p className="text-gray-600 border-b-2 pb-4 text-md">
                Yes, the system tracks driving patterns, helping you monitor and
                improve driver safety.
              </p>
            </div>
          </div>
          {/*Question 15 */}
          <div className="rounded pb-5">
            <div
              className="flex justify-between text-xl p-4 border-b-2 border-gray-200 cursor-pointer"
              onClick={() => handleClick(14)}
            >
              <div> How does mobile login tracking work?</div>
              <div>
                <button onClick={() => handleClick(14)}>
                  {openIndexes.includes(14) ? (
                    <AiOutlineMinus />
                  ) : (
                    <AiOutlinePlus />
                  )}
                </button>
              </div>
            </div>
            <div
              className={`flex w-full p-3 ${
                openIndexes.includes(14) ? "" : "hidden"
              }`}
            >
              <p className="text-gray-600 border-b-2 pb-4 text-md">
                Drivers can log in via a mobile app that tracks their location
                and activities in real-time, ensuring accountability.
              </p>
            </div>
          </div>
          {/*Question 16 */}
          <div className="rounded pb-5">
            <div
              className="flex justify-between text-xl p-4 border-b-2 border-gray-200 cursor-pointer"
              onClick={() => handleClick(15)}
            >
              <div>Is the mobile tracking feature secure?</div>
              <div>
                <button onClick={() => handleClick(15)}>
                  {openIndexes.includes(15) ? (
                    <AiOutlineMinus />
                  ) : (
                    <AiOutlinePlus />
                  )}
                </button>
              </div>
            </div>
            <div
              className={`flex w-full p-3 ${
                openIndexes.includes(15) ? "" : "hidden"
              }`}
            >
              <p className="text-gray-600 border-b-2 pb-4 text-md">
                Yes, the system uses encrypted data and user authentication to
                ensure security and privacy.
              </p>
            </div>
          </div>
          {/*Question 17 */}
          <div className="rounded pb-5">
            <div
              className="flex justify-between text-xl p-4 border-b-2 border-gray-200 cursor-pointer"
              onClick={() => handleClick(16)}
            >
              <div>
                {" "}
                Can I create estimates and bookings directly from the system?
              </div>
              <div>
                <button onClick={() => handleClick(16)}>
                  {openIndexes.includes(16) ? (
                    <AiOutlineMinus />
                  ) : (
                    <AiOutlinePlus />
                  )}
                </button>
              </div>
            </div>
            <div
              className={`flex w-full p-3 ${
                openIndexes.includes(16) ? "" : "hidden"
              }`}
            >
              <p className="text-gray-600 border-b-2 pb-4 text-md">
                Yes, the system allows you to generate estimates and confirm
                bookings seamlessly.
              </p>
            </div>
          </div>
          {/*Question 18 */}
          <div className="rounded pb-5">
            <div
              className="flex justify-between text-xl p-4 border-b-2 border-gray-200 cursor-pointer"
              onClick={() => handleClick(17)}
            >
              <div>How does the invoicing feature work?</div>
              <div>
                <button onClick={() => handleClick(17)}>
                  {openIndexes.includes(17) ? (
                    <AiOutlineMinus />
                  ) : (
                    <AiOutlinePlus />
                  )}
                </button>
              </div>
            </div>
            <div
              className={`flex w-full p-3 ${
                openIndexes.includes(17) ? "" : "hidden"
              }`}
            >
              <p className="text-gray-600 border-b-2 pb-4 text-md">
                The system automates invoice generation based on completed
                bookings, providing detailed cost breakdowns and payment
                tracking.
              </p>
            </div>
          </div>
          {/*Question 19 */}
          <div className="rounded pb-5">
            <div
              className="flex justify-between text-xl p-4 border-b-2 border-gray-200 cursor-pointer"
              onClick={() => handleClick(18)}
            >
              <div>Can I customize invoices?</div>
              <div>
                <button onClick={() => handleClick(18)}>
                  {openIndexes.includes(18) ? (
                    <AiOutlineMinus />
                  ) : (
                    <AiOutlinePlus />
                  )}
                </button>
              </div>
            </div>
            <div
              className={`flex w-full p-3 ${
                openIndexes.includes(18) ? "" : "hidden"
              }`}
            >
              <p className="text-gray-600 border-b-2 pb-4 text-md">
                Yes, invoices can be customized with your branding, terms, and
                conditions
              </p>
            </div>
          </div>
          {/*Question 20 */}
          <div className="rounded pb-5">
            <div
              className="flex justify-between text-xl p-4 border-b-2 border-gray-200 cursor-pointer"
              onClick={() => handleClick(19)}
            >
              <div>Is the system cloud-based?</div>
              <div>
                <button onClick={() => handleClick(19)}>
                  {openIndexes.includes(19) ? (
                    <AiOutlineMinus />
                  ) : (
                    <AiOutlinePlus />
                  )}
                </button>
              </div>
            </div>
            <div
              className={`flex w-full p-3 ${
                openIndexes.includes(19) ? "" : "hidden"
              }`}
            >
              <p className="text-gray-600 border-b-2 pb-4 text-md">
                Yes, the system is cloud-based, providing secure access from
                anywhere.
              </p>
            </div>
          </div>
          {/*Question 21 */}
          <div className="rounded pb-5">
            <div
              className="flex justify-between text-xl p-4 border-b-2 border-gray-200 cursor-pointer"
              onClick={() => handleClick(20)}
            >
              <div>Can I integrate this system with other software?</div>
              <div>
                <button onClick={() => handleClick(20)}>
                  {openIndexes.includes(20) ? (
                    <AiOutlineMinus onClick={() => handleClick(20)}/>
                  ) : (
                    <AiOutlinePlus onClick={() => handleClick(20)}/>
                  )}
                </button>
              </div>
            </div>
            <div
              className={`flex w-full p-3 ${
                openIndexes.includes(20) ? "" : "hidden"
              }`}
            >
              <p className="text-gray-600 border-b-2 pb-4 text-md">
                Yes, the system supports integrations with accounting, GPS, and
                other third-party software.
              </p>
            </div>
          </div>
          {/*Question 22 */}
          <div className="rounded pb-5">
            <div
              className="flex justify-between text-xl p-4 border-b-2 border-gray-200 cursor-pointer"
              onClick={() => handleClick(21)}
            >
              <div>Is there customer support available?</div>
              <div>
                <button onClick={() => handleClick(21)}>
                  {openIndexes.includes(21) ? (
                    <AiOutlineMinus />
                  ) : (
                    <AiOutlinePlus />
                  )}
                </button>
              </div>
            </div>
            <div
              className={`flex w-full p-3 ${
                openIndexes.includes(21) ? "" : "hidden"
              }`}
            >
              <p className="text-gray-600  p-4 text-xl">
                Yes, we offer 24/7 customer support to address your
                queries and issues.
              </p>
            </div>




            
          </div>
        </div>
      </div>
    </>
  );
}

export default Help;
