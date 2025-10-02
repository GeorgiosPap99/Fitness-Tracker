import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Profile() {
  const { token, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:5000/api/profile", {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setProfile(data);
        }
      })
      .catch((err) => console.error(err));
  }, [token]);

  if (!token) return <h2>Please login first.</h2>;
  if (!profile) return <h2>Loading profile...</h2>;

  return (
    <div>
      <h1>My Profile</h1>
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>

      {/* if you included stats in backend */}
      {profile.totalWorkouts !== undefined && (
        <>
          <p><strong>Total Workouts:</strong> {profile.totalWorkouts}</p>
          <p><strong>Total Minutes:</strong> {profile.totalMinutes || 0}</p>
          <p><strong>Last Workout:</strong> {profile.lastWorkout || "No workouts yet"}</p>
        </>
      )}

      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Profile;

