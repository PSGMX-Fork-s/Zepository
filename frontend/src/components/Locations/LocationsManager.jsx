import { useState } from "react";
import Header from "../common/Header";
import Footer from "../common/Footer";
import LabForm from "../forms/LabForm";
import useLabsRooms from "../../hooks/useLabsRooms";

export default function LocationsManager() {
  const { labs, addLab, editLab, removeLab, isLoading, error } = useLabsRooms();
  const [isCreatingLab, setIsCreatingLab] = useState(false);
  const [editingLabId, setEditingLabId] = useState(null);
  const [isEditingLab, setIsEditingLab] = useState(false);

  const handleAddLab = async (payload) => {
    setIsCreatingLab(true);
    try {
      await addLab(payload);
    } finally {
      setIsCreatingLab(false);
    }
  };

  const handleEditLab = async (payload) => {
    setIsEditingLab(true);
    try {
      await editLab(editingLabId, payload);
      setEditingLabId(null);
    } finally {
      setIsEditingLab(false);
    }
  };

  const handleDeleteLab = async (labId) => {
    if (!window.confirm("Are you sure you want to delete this lab?")) return;
    try {
      await removeLab(labId);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-5 py-8">
        <section className="rounded-[2rem] bg-slate-950 px-8 py-10 text-white shadow-xl">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">
            Location Directory
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Manage Labs
          </h1>
        </section>

        {error && (
          <section className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800">
            {error}
          </section>
        )}

        <section className="grid gap-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Labs
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                  Existing Labs
                </h2>
              </div>
              <span className="rounded-full bg-cyan-100 px-4 py-2 text-sm font-semibold text-cyan-700">
                {labs.length}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {isLoading ? (
                <p className="text-sm text-slate-500">Loading labs...</p>
              ) : labs.length === 0 ? (
                <p className="text-sm text-slate-500">No labs created yet. Add one using the form below.</p>
              ) : (
                labs.map((lab) => (
                  <article
                    key={lab.lab_id}
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5"
                  >
                    {editingLabId === lab.lab_id ? (
                      <LabForm
                        existingLabs={labs}
                        onSubmit={handleEditLab}
                        isSubmitting={isEditingLab}
                        initialData={lab}
                        onCancel={() => setEditingLabId(null)}
                      />
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {lab.lab_name}
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingLabId(lab.lab_id)}
                            className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteLab(lab.lab_id)}
                            className="rounded-full bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-200 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                Create Lab
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                Add a Lab
              </h2>
            </div>
            <div className="mt-6">
              <LabForm
                existingLabs={labs}
                onSubmit={handleAddLab}
                isSubmitting={isCreatingLab}
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
