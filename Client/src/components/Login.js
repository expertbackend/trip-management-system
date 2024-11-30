import React, { useState } from "react";
import axios from "axios";
// import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/tms.png";
import signin from "../assets/signin.png";
import signinbg from "../assets/sign2.png";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true)
    const deviceToken = localStorage.getItem("deviceToken");
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/login`,
        {
          email,
          password,
          deviceToken,
        }
      );
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem('tokenId',response.data.tokenId)
      window.location.href = "/details"; // Redirect to the main app
    } catch (error) {
      console.error("Login failed:", error);
    }
    finally {
      setLoading(false);
  }
  };

  return (
    <>
      <div
        className="flex flex-col items-center justify-center min-h-screen"
        style={{
          backgroundImage: `url(${signinbg})`,
          backgroundPosition: "center",
          backgroundColor: "rgba(0,0,0,0.8)",
          backgroundBlendMode: "multiply",
        }}
      >
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8 bg-slate-300 p-5 rounded-xl justify-center  shadow-lg shadow-slate-400">
          {/* Form Container */}
          <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center text-teal-600 mb-6">
              WELCOME ! To
              <br />
              <span className="text-red-500">
                <img
                  src={logo}
                  alt="logo"
                  className="h-8 inline-block m-0 p-0"
                />
              </span>
              <br />
              Billing Software
            </h2>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label
                  className="block text-sm font-semibold text-gray-600"
                  htmlFor="username"
                >
                  Username
                </label>
                <input
                  type="email"
                  id="username"
                  className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter your username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-semibold text-gray-600"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember</span>
                </label>
                <a href="/" className="text-sm text-teal-600 hover:underline">
                  Forgot Password?
                </a>
              </div>
              <button
                type="submit"
                className="w-full py-2 text-white bg-yellow-500 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {loading ? 'Login...' : 'Login'}
              </button>
            </form>
          </div>

          {/* Right Image Section - Only visible on medium screens and above */}
          <div className="hidden md:block items-center  text-center  justify-center pt-20">
            <img src={signin} alt="Sign-in" className="w-auto h-auto" />
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
