import { useState } from "react";

const initialState = {
  name: "",
  capacity: "",
  type: "",
  block: "",
  metadata: "",
};

export default function RoomForm({ existingRooms, onSubmit, isSubmitting }) {
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
      type: form.type.trim(),
      block: form.block.trim(),
      metadata: form.metadata.trim(),
    };

    if (!payload.name || !payload.type || !payload.block) {
      setError("Name/number, type, and block are required.");
      return;
    }

    if (!Number.isFinite(payload.capacity) || payload.capacity <= 0) {
      setError("Capacity must be a positive number.");
      return;
    }

    const duplicate = existingRooms.some(
      (room) =>
        room.name.toLowerCase() === payload.name.toLowerCase() &&
        room.block.toLowerCase() === payload.block.toLowerCase()
    );

    if (duplicate) {
      setError("This room already exists.");
      return;
    }

    try {
      await onSubmit(payload);
      setForm(initialState);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to create room.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700">
          Room Name / Number
        </label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
          placeholder="A-204"
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
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
          placeholder="60"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700">
          Room Type
        </label>
        <input
          name="type"
          value={form.type}
          onChange={handleChange}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
          placeholder="Seminar Hall"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700">
          Block
        </label>
        <input
          name="block"
          value={form.block}
          onChange={handleChange}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
          placeholder="Main Block"
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
          className="mt-2 min-h-[110px] w-full rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
          placeholder="Optional notes about this room."
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
        className="w-full rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
      >
        {isSubmitting ? "Creating Room..." : "Create Room"}
      </button>
    </form>
  );
}
