import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    user_name: "",
    email: "",
    password: "",
    role: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.role) {
      setError("Please select a role");
      return;
    }

    try {
      await api.post("/auth/signup", form);
      alert("Signup successful!");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="relative w-1/3 h-4/5 flex flex-col items-center justify-center rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold pb-5">SIGNUP</h2>

        {error && <p className="text-red-500">{error}</p>}

        <div className="flex w-4/5 h-4/5 flex-col items-center justify-center">
          <form onSubmit={handleSubmit} className="flex w-full h-11/12 flex-col justify-around">
            <input
              type="text"
              name="user_name"
              placeholder="Name"
              value={form.user_name}
              onChange={handleChange}
              className="p-2.5 rounded-lg border border-gray-300 outline-none focus:outline-gray-300"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="p-2.5 rounded-lg border border-gray-300 outline-none focus:outline-gray-300"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="p-2.5 rounded-lg border border-gray-300 outline-none focus:outline-gray-300"
            />

            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="p-2.5 rounded-lg border border-gray-300 outline-none focus:outline-gray-300"
            >
              <option value="">Select Role</option>
              <option value="lab-assist">Lab Assistant</option>
              <option value="admin">Admin</option>
            </select>

            <button type="submit" className="p-2.5 rounded-lg border-none bg-black text-white cursor-pointer">
              Signup
            </button>
          </form>
        </div>

        <p className="absolute bottom-5">
          Already have an account? 
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-blue-600 underline hover:text-blue-800"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}
