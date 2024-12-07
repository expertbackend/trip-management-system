import React, { useState } from "react";
import about from "../assets/about.png";
import { FaArrowAltCircleRight, FaCheckCircle, FaMinus, FaPlus } from "react-icons/fa";



const features = [
  { title: "GPS Tracking System", description: "Track your fleet in real-time for enhanced visibility and control." },
  { title: "Fuel Tracking System", description: "Monitor fuel consumption and reduce costs with detailed tracking." },
  { title: "E-Commerce Solutions", description: "Boost sales, track orders, and enhance customer experience seamlessly." },
  { title: "Mobile App Solutions", description: "Stay connected on the go with real-time updates and management tools." },
  { title: "Web & CMS Solutions", description: "Easily manage your website, content, and user experience." },
  { title: "Fleet Management Solution", description: "Optimize vehicle performance, routes, and driver schedules in one platform." },
  { title: "Driver & Vehicle Management Solution", description: "Manage driver performance and vehicle health for smooth operations." },
  { title: "Load & Cargo Management Solution", description: "Track loads, optimize routes, and ensure timely deliveries." },
  { title: "Expense & Billing Management Solution", description: "Automate invoicing, track expenses, and gain financial insights." },
  { title: "Analytics & Reporting Solution", description: "Access real-time data, generate custom reports, and make informed decisions." },
  { title: "Group Management Solution", description: "Manage teams, locations, and permissions for seamless collaboration." },
  { title: "Automated Document Expiry Alerts", description: "Automated reminders for driver licenses, insurance renewals, and vehicle permits." },
  { title: "Tyre & Mileage Management", description: "Monitor tyre performance and vehicle mileage to ensure smooth operations and lower maintenance costs." },
  { title: "Profile Loss Prevention", description: "Securely store and manage driver, staff, and vehicle profiles, ensuring you never lose critical information again." },
  { title: "Instant Booking Estimates", description: "Generate accurate and reliable booking estimates in just a few clicks." },
  { title: "Effortless Invoicing", description: "Streamline billing with automated, professional invoices, ensuring timely and error-free payments." },
  { title: "Digital Document Management", description: "Store and manage all your essential documents securely in one place for easy access and organization." },
  { title: "User Permissions & Access Control", description: "Assign specific roles and permissions to your team, ensuring sensitive data is protected and only accessible by authorized personnel." },
  { title: "Maintenance Scheduling", description: "Automate maintenance reminders and vehicle servicing schedules, reducing unexpected downtime and improving fleet longevity." },
  { title: "Multi-Location Support", description: "Manage fleets across multiple locations or regions, providing centralized control with location-based data insights." },
];

function About() {
  const [isExpanded, setIsExpanded] = useState(false);

const toggleFeatures = () => {
  setIsExpanded(!isExpanded);
};
  return (
    <>
      <div className="py-4 px-4 bg-white">
        <h2 className="text-5xl font-extrabold text-gray-900 sm:text-4xl text-center font-serif">
          About Us
        </h2>
        <div className="mt-12 flex flex-col sm:flex-row sm:justify-between">
          <div className="flex-1 items-center rounded-lg p-4 my-4 pt-10">
            <h2 className="text-3xl text-start py-3 text-red-700 font-bold">
              Effortless Trip Management at Your Fingertips{" "}
            </h2>
            <p className="text-start items-start text-lg">
              Revolutionize Your Trip Management with One Powerful Platform! At
              FleetManagePro, we’re redefining the way businesses manage their
              fleets, drivers, and operations. Our complete trip management
              solution brings all the essential tools together, allowing you to
              boost efficiency, reduce costs, and provide faster, smarter
              services—all in one place.
            </p>
          </div>
          {/* <div className="flex-1 rounded-lg p-4 mt-4 sm:mt-0">
            <img
              className="max-w-full h-auto rounded-lg"
              src={about}
              alt="About Us"
            />
          </div> */}
        </div>
      </div>

      {/* Our story */}
      {/* <section className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-8">
            Our Story
          </h2>
          <ul className="space-y-6 text-gray-600 text-lg">
            <li>
              <p>
                Founded in [Year], Expert Solutions was created to address the
                challenges faced by logistics companies, travel agencies, and
                businesses in managing trips efficiently.
              </p>
            </li>
            <li>
              <p>
                With years of experience in fleet operations, we realized the
                need for a centralized, user-friendly platform to streamline
                trip management while reducing operational costs.
              </p>
            </li>
            <li>
              <p>
                Today, our solution serves [number] customers globally,
                revolutionizing how trips are planned, monitored, and executed.
              </p>
            </li>
          </ul>
        </div>
      </section> */}

      {/* <section className="py-8">
        <div className="flex flex-col sm:flex-row sm:space-x-8 mx-auto px-4">
          <div className="mb-8 sm:w-1/2">
            <h2 className="text-3xl font-bold text-red-700">Our Mission</h2>
            <div className="flex items-center gap-2">
              <span>
                <FaArrowAltCircleRight className="text-xl text-green-600" />
              </span>
              <p className="mt-4 text-gray-600 font-semibold">
                Empowering businesses with a comprehensive trip management
                solution that streamlines operations, enhances safety, and
                drives productivity.
              </p>
            </div>
          </div>
          <div className="mb-8 sm:w-1/2">
            <h2 className="text-3xl font-bold text-red-700">Our Vision</h2>
            <div className="flex items-center gap-2">
              <span>
                <FaArrowAltCircleRight className="text-xl text-green-600" />
              </span>
              <p className="mt-4 text-gray-600">
                To become the global leader in intelligent trip management,
                fostering innovation and sustainability in logistics and
                transportation.
              </p>
            </div>
          </div>
        </div>
      </section> */}

      <section className="flex flex-col sm:flex-row py-12 px-6 sm:px-10">
        <div className=" ">
          <h2 className="text-3xl font-semibold text-red-700 mb-5">
            Why Choose Us ?
          </h2>
          <p className="text-lg text-gray-600 mb-3 font-serif">
            Choosing FleetManagePro means choosing efficiency, security, and
            growth. Our platform is more than just a tool—it's a strategic
            advantage that streamlines every part of your fleet management,
            helping you to:
          </p>
          <div className="">
            <div className="p-2 lg:p-4 rounded-lg transition-shadow duration-300">
              <ul className="space-y-4 text-gray-600 p-0 m-0">
                <li className="flex gap-2 items-center text-black">
                  <FaArrowAltCircleRight className="text-green-500 text-2xl " />
                  <span>
                    Optimize driver and vehicle management with real-time
                    insights
                  </span>
                </li>
                <li className="flex gap-2 items-center text-black">
                  <FaArrowAltCircleRight className="text-green-500 text-2xl " />
                  Reduce operational overhead by automating time-consuming tasks
                </li>
                <li className="flex gap-2 items-center text-black">
                  <FaArrowAltCircleRight className="text-green-500 text-2xl " />
                  Improve cost control with detailed expense tracking and
                  automated invoicing
                </li>
                <li className="flex gap-2 items-center text-black">
                  <FaArrowAltCircleRight className="text-green-500 text-2xl " />
                  Scale your business easily with flexible, customizable
                  features
                </li>
                <li className="flex gap-2 items-center text-black">
                  <FaArrowAltCircleRight className="text-green-500 text-2xl " />
                  Join the thousands of businesses already transforming their
                  fleet operations
                </li>
              </ul>

              {/* <div className="mt-8">
                <h2 className="text-3xl font-semibold text-red-700">
                  Custom Features That Drive Efficiency
                </h2>
                <p className="mt-4 text-gray-600">
                  We provide customized features that reduce costs and deliver
                  faster, cost-effective services. With our advanced tracking
                  capabilities, we enable efficient vehicle and human resource
                  management, including:
                </p>
                <ul className="mt-4 space-y-2 text-gray-600">
                  <li className="flex gap-2 items-center text-black">
                    <FaArrowAltCircleRight className="text-green-500 text-2xl" />
                    Create and manage bookings seamlessly
                  </li>
                  <li className="flex gap-2 items-center text-black">
                    <FaArrowAltCircleRight className="text-green-500 text-2xl" />
                    Track expenses by driver, modify and view costs in real-time
                  </li>
                  <li className="flex gap-2 items-center text-black">
                    <FaArrowAltCircleRight className="text-green-500 text-2xl" />
                    Store documents digitally for easy access and organization
                  </li>
                  <li className="flex gap-2 items-center text-black">
                    <FaArrowAltCircleRight className="text-green-500 text-2xl" />
                    Assign user permissions for enhanced control and security
                  </li>
                  <li className="flex gap-2 items-center text-black">
                    <FaArrowAltCircleRight className="text-green-500 text-2xl" />
                    Flexible data storage with real-time updates and
                    comprehensive trip reports
                  </li>
                </ul>
              </div> */}
            </div>
          </div>
        </div>
        <div className=" block items-center mt-7">
          <div className="mb-8 w-full sm:w-auto">
            <h2 className="text-3xl font-bold text-red-700">Our Mission</h2>
            <div className="flex items-center gap-2">
              <span>
                <FaArrowAltCircleRight className="text-xl text-green-600" />
              </span>
              <p className="mt-4 text-gray-600 font-semibold">
                Empowering businesses with a comprehensive trip management
                solution that streamlines operations, enhances safety, and
                drives productivity.
              </p>
            </div>
          </div>
          <div className="mb-8 w-full sm:w-auto">
            <h2 className="text-3xl font-bold text-red-700">Our Vision</h2>
            <div className="flex items-center gap-2">
              <span>
                <FaArrowAltCircleRight className="text-xl text-green-600" />
              </span>
              <p className="mt-4 text-gray-600">
                To become the global leader in intelligent trip management,
                fostering innovation and sustainability in logistics and
                transportation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 px-6 md:px-16 lg:px-24">
        <h2 className="text-3xl font-bold text-center text-red-700 mb-12">
        Features
        </h2>

        {/* Clickable heading to toggle the feature list */}
        <div
        onClick={toggleFeatures}
        className="flex items-center justify-between cursor-pointer text-xl text-green-600 font-semibold mb-4 hover:text-green-800 transition-colors duration-300 shadow-lg py-3 px-3 rounded-md"
      >
        <span>Explore All Our Features</span>
        <span className="text-2xl">
          {isExpanded ? <FaMinus /> : <FaPlus />}
        </span>
      </div>
        {/* Render list only when 'isExpanded' is true */}
        {isExpanded && (
          <ul className="space-y-6">
            {features.map((feature, index) => (
              <li
                key={index}
                className="flex items-start gap-4 bg-white p-6 shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-green-600 text-3xl">
                  <FaCheckCircle />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-green-800">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 mt-1">{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export default About;
