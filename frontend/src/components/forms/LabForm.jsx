import { useState } from "react";

const initialState = {
  name: "",
  capacity: "",
  building: "",
  metadata: "",
};

export default function LabForm({ existingLabs, onSubmit, isSubmitting }) {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name: form.name.trim(),
      capacity: Number(form.capacity),
      building: form.building.trim(),
      metadata: form.metadata.trim(),
    };

    if (!payload.name || !payload.building) {
      setError("Name and block/building are required.");
      return;
    }

    if (!Number.isFinite(payload.capacity) || payload.capacity <= 0) {
      setError("Capacity must be a positive number.");
      return;
    }

    const duplicate = existingLabs.some(
      (lab) =>
        lab.lab_name.toLowerCase() === payload.name.toLowerCase() &&
        (lab.building || "").toLowerCase() === payload.building.toLowerCase()
    );

    if (duplicate) {
      setError("This lab already exists.");
      return;
    }

    try {
      await onSubmit(payload);
      setForm(initialState);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to create lab.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700">
          Lab Name
        </label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
          placeholder="Embedded Systems Lab"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700">
          Capacity
        </label>
        <input
          type="number"
          min="1"
          name="capacity"
          value={form.capacity}
          onChange={handleChange}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
          placeholder="40"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700">
          Block / Building
        </label>
        <input
          name="building"
          value={form.building}
          onChange={handleChange}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
          placeholder="MCA Block"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700">
          Metadata
        </label>
        <textarea
          name="metadata"
          value={form.metadata}
          onChange={handleChange}
          className="mt-2 min-h-[110px] w-full rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
          placeholder="Optional notes about this lab."
        />
      </div>

      {error && (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-cyan-300"
      >
        {isSubmitting ? "Creating Lab..." : "Create Lab"}
      </button>
    </form>
  );
}
