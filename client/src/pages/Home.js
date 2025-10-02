import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/fitness-bg.jpg')" }}
    >
      <div className="bg-white bg-opacity-80 p-10 rounded-xl shadow-xl text-center max-w-lg">
        <h1 className="text-4xl font-bold text-blue-700 mb-4">
          Welcome to Fitness Tracker 🚀
        </h1>
        <p className="text-gray-700 mb-6">
          Track your workouts, monitor progress, and stay motivated.
        </p>
        <div className="space-x-4">
          <Link
            to="/login"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
