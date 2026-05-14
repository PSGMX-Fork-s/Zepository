import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", form);

      localStorage.setItem("token", res.data.token);

      alert("Login successful!");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="w-1/3 h-4/5 flex flex-col items-center justify-center rounded-lg shadow-xl">
        <div>
          <h1 className="text-4xl font-semibold text-center pb-5">Zepository</h1>
        </div>

        <div className="h-1/2 w-4/5 flex flex-col items-center justify-center">
          <h2 className="pb-2.5">SIGN IN</h2>

          {error && <p className="text-red-500">{error}</p>}

          <form onSubmit={handleSubmit} className="w-full h-3/5 flex flex-col justify-around">
            <input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="p-2.5 rounded-lg border border-gray-300 outline-none focus:outline-gray-300"
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="p-2.5 rounded-lg border border-gray-300 outline-none focus:outline-gray-300"
            />

            <button type="submit" className="p-2.5 rounded-lg border-none bg-black text-white cursor-pointer">Login</button>
          </form>

          <div className="text-center">
            <p>
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-blue-600 underline hover:text-blue-800"
              >
                Click here
              </button> to create new account
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
