import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from "recharts";

function Dashboard() {
  const { token, user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [form, setForm] = useState({ name: "", duration: "", date: "" });
  const [editingId, setEditingId] = useState(null); 

  
  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:5000/api/profile", {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch((err) => console.error(err));
  }, [token]);

  
  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:5000/api/workouts", {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => setWorkouts(data))
      .catch((err) => console.error(err));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        
        const res = await fetch(`http://localhost:5000/api/workouts/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          setWorkouts(
            workouts.map((w) =>
              w.id === editingId ? { ...w, ...form } : w
            )
          );
          setEditingId(null);
          setForm({ name: "", duration: "", date: "" });
        }
      } else {
        
        const res = await fetch("http://localhost:5000/api/workouts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(form),
        });

        const data = await res.json();
        if (res.ok) {
          setWorkouts([...workouts, data]);
          setForm({ name: "", duration: "", date: "" });
        } else {
          alert("Failed to add workout: " + (data.error || "unknown error"));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/workouts/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      if (res.ok) {
        setWorkouts(workouts.filter((w) => w.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (workout) => {
    setEditingId(workout.id);
    setForm({
      name: workout.name,
      duration: workout.duration,
      date: workout.date,
    });
  };

  if (!token) return <h2>Please login first.</h2>;
  if (!profile) return <h2>Loading dashboard...</h2>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {/* Profile Section */}
      <div className="mb-6 p-4 border rounded shadow">
        <h2 className="text-xl font-semibold mb-2">My Profile</h2>
        <p><strong>Name:</strong> {profile.name}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <button
          onClick={logout}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
        >
          Logout
        </button>
      </div>

      {/* Add/Edit Workout */}
      <div className="mb-6 p-4 border rounded shadow">
        <h2 className="text-xl font-semibold mb-2">
          {editingId ? "Edit Workout" : "Add Workout"}
        </h2>
        <form onSubmit={handleSubmit} className="flex gap-2 flex-wrap">
          <input
            placeholder="Workout Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            placeholder="Duration (mins)"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="border p-2 rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ name: "", duration: "", date: "" });
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* Workout List */}
      <div className="mb-6 p-4 border rounded shadow">
        <h2 className="text-xl font-semibold mb-2">My Workouts</h2>
        {workouts.length === 0 ? (
          <p>No workouts yet.</p>
        ) : (
          <ul>
            {workouts.map((w) => (
              <li key={w.id} className="flex justify-between items-center border-b py-2">
                <span>
                  {w.name} — {w.duration} mins on {w.date}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(w)}
                    className="px-2 py-1 bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(w.id)}
                    className="px-2 py-1 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Progress Chart */}
      <div className="p-4 border rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Progress</h2>
        {workouts.length === 0 ? (
          <p>No workouts yet to show progress.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={workouts.map((w) => ({
                date: w.date,
                duration: Number(w.duration),
              }))}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: "Minutes", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Line type="monotone" dataKey="duration" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
