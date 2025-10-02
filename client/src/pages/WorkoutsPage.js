import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function WorkoutsPage() {
  const { token } = useContext(AuthContext); 
  const [workouts, setWorkouts] = useState([]);
  const [form, setForm] = useState({ name: "", duration: "", date: "" });

  
  useEffect(() => {
    if (!token) return; 

    fetch("http://localhost:5000/api/workouts", {
      headers: {
        "Authorization": "Bearer " + token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setWorkouts(data);
        } else {
          setWorkouts([]); 
        }
      })
      .catch((err) => {
        console.error("Failed to load workouts", err);
        setWorkouts([]);
      });
  }, [token]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token, 
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Workout added ✅");
        setWorkouts([...workouts, data]); 
        setForm({ name: "", duration: "", date: "" });
      } else {
        alert(data.error || "Failed to add workout");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to add workout ❌");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/workouts/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": "Bearer " + token,
        },
      });
      const data = await res.json();

      if (res.ok) {
        setWorkouts(workouts.filter((w) => w.id !== id));
      } else {
        alert("Failed to delete workout: " + (data.error || "unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Delete failed ❌");
    }
  };

  if (!token) {
    return <h2>Please login first to see your workouts.</h2>;
  }

  return (
    <div>
      <h1>My Workouts</h1>

      {/* Add Workout Form */}
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Workout Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Duration (mins)"
          value={form.duration}
          onChange={(e) => setForm({ ...form, duration: e.target.value })}
        />
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <button type="submit">Add Workout</button>
      </form>

      {/* List Workouts */}
      <ul>
        {workouts.map((w) => (
          <li key={w.id}>
            {w.name} — {w.duration} mins on {w.date}
            <button onClick={() => handleDelete(w.id)}>❌ Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default WorkoutsPage;
