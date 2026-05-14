import { useState, useEffect } from "react";

export default function LabForm({ existingLabs, onSubmit, isSubmitting, initialData = null, onCancel }) {
  const [form, setForm] = useState({ name: initialData ? initialData.lab_name : "" });
  const [error, setError] = useState("");

  // Update the form state if initialData changes externally
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const newName = initialData ? initialData.lab_name : "";
    if (form.name !== newName) {
      // eslint-disable-next-line
      setForm({ name: newName });
    }
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name: form.name.trim(),
    };

    if (!payload.name) {
      setError("Name is required.");
      return;
    }

    const duplicate = existingLabs.some(
      (lab) => {
        // If editing, skip comparing with self
        if (initialData && String(lab.lab_id) === String(initialData.lab_id)) return false;
        return lab.lab_name.toLowerCase() === payload.name.toLowerCase();
      }
    );

    if (duplicate) {
      setError("This lab already exists.");
      return;
    }

    try {
      await onSubmit(payload);
      if (!initialData) {
        setForm({ name: "" });
      }
      setError("");
    } catch (err) {
      setError(err.message || "Failed to save lab.");
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

      {error && (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex-1 rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-cyan-300"
        >
          {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Create Lab"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
