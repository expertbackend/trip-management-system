import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const BadgeDisplay = ({ userId }) => {
  const [badges, setBadges] = useState([]);
  const [progress, setProgress] = useState(0); // Tracking progress as a percentage
  const [totalActions] = useState(5); // Assuming total actions (bookings) to achieve a badge
  const [leaderboard, setLeaderboard] = useState([]);

  const token = localStorage.getItem('token');
  const progressBarRef = useRef(null); // Reference for the progress bar

  const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/booking`, // Replace with your actual API URL
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Fetch User Progress (Badges and Actions)
  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        // Fetch user progress (badges and actions created)
        const response = await axiosInstance.get(`/progress/${userId}`);
        setBadges(response.data.badges); // Badges array from the API
        const actionsCreated = response.data.progress || 0; // Number of actions (e.g., bookings) created

        // Calculate the percentage of progress based on actions created
        const progressPercentage = (actionsCreated / totalActions) * 100;
        
        // Animate the progress bar when the progress changes
        setProgress(progressPercentage);
      } catch (error) {
        console.error('Error fetching user progress:', error);
      }
    };

    fetchUserProgress();
  }, [userId]);

  // Fetch Leaderboard Data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Fetch leaderboard data (users within the same owner group)
        const response = await axiosInstance.get(`/leaderboard`); // Replace with correct endpoint for leaderboard
        setLeaderboard(response.data.leaderboard); // Assuming leaderboard response is an array
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };

    fetchLeaderboard();
  }, []);

  // Smoothly animate the progress bar width when progress changes
  useEffect(() => {
    if (progressBarRef.current) {
      progressBarRef.current.style.transition = 'width 1s ease-in-out';
      progressBarRef.current.style.width = `${progress}%`;
    }
  }, [progress]);

  return (
    <div className="p-6 bg-gradient-to-r from-teal-400 to-teal-600 rounded-lg shadow-lg transition-transform transform hover:scale-105">
      {/* Badge Section */}
      <h3 className="text-2xl font-semibold text-white mb-4">Your Badges:</h3>
      <ul className="list-disc pl-5 space-y-2">
        {badges.length > 0 ? (
          badges.map((badge, index) => (
            <li key={index} className="text-white flex items-center space-x-2 hover:bg-teal-700 py-1 px-2 rounded-md transition-all duration-300">
              <span className="text-lg">{badge}</span>
            </li>
          ))
        ) : (
          <li className="text-gray-200">No badges earned yet!</li>
        )}
      </ul>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-sm font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-teal-700">
                Progress: {Math.round(progress)}%
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-teal-200">
                {progress.toFixed(0)}% of {totalActions} actions created
              </span>
            </div>
          </div>
          <div className="flex mb-2">
            <div className="w-full bg-gray-300 rounded-full">
              <div
                ref={progressBarRef}
                className={`h-2 rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Section */}
      <h3 className="text-2xl font-semibold text-white mb-4 mt-8">Leaderboard:</h3>
      {leaderboard.length > 0 ? (
        <ul className="space-y-2">
          {leaderboard.map((user, index) => (
            <li key={index} className="text-white flex justify-between items-center space-x-2 hover:bg-teal-700 py-1 px-2 rounded-md transition-all duration-300">
              <span className="text-lg">{user.name}</span>
              <span className="text-sm text-teal-200">
                {user.badgesCount} Badges | {user.actionsCreated} Actions
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-200">No leaderboard data available.</p>
      )}
    </div>
  );
};

export default BadgeDisplay;
