import { useState } from "react";
import Header from "../common/Header";
import Footer from "../common/Footer";
import LabForm from "../forms/LabForm";
import RoomForm from "../forms/RoomForm";
import useLabsRooms from "../../hooks/useLabsRooms";

const formatLabSubtitle = (lab) => {
  const details = [];

  if (lab.building) {
    details.push(lab.building);
  }

  if (lab.capacity) {
    details.push(`Capacity ${lab.capacity}`);
  }

  return details.join(" • ");
};

const formatRoomSubtitle = (room) => {
  const details = [room.type, room.block, room.capacity ? `Capacity ${room.capacity}` : ""];
  return details.filter(Boolean).join(" • ");
};

export default function LocationsManager() {
  const { labs, rooms, addLab, addRoom, isLoading, error } = useLabsRooms();
  const [isCreatingLab, setIsCreatingLab] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const handleAddLab = async (payload) => {
    setIsCreatingLab(true);
    try {
      await addLab(payload);
    } finally {
      setIsCreatingLab(false);
    }
  };

  const handleAddRoom = async (payload) => {
    setIsCreatingRoom(true);
    try {
      await addRoom(payload);
    } finally {
      setIsCreatingRoom(false);
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
            Manage Labs and Rooms
          </h1>
          <p className="mt-4 max-w-3xl text-slate-300">
            Add new labs and rooms through one shared data layer. Labs are synced
            with the backend, while room records are persisted locally for instant reuse.
          </p>
        </section>

        {error && (
          <section className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800">
            {error}
          </section>
        )}

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                Create Lab
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                Add a backend-backed lab
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

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                Create Room
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                Add a persistent room record
              </h2>
            </div>
            <div className="mt-6">
              <RoomForm
                existingRooms={rooms}
                onSubmit={handleAddRoom}
                isSubmitting={isCreatingRoom}
              />
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Labs
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                  Current lab inventory
                </h2>
              </div>
              <span className="rounded-full bg-cyan-100 px-4 py-2 text-sm font-semibold text-cyan-700">
                {labs.length}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {isLoading ? (
                <p className="text-sm text-slate-500">Loading labs...</p>
              ) : (
                labs.map((lab) => (
                  <article
                    key={lab.lab_id}
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4"
                  >
                    <h3 className="text-lg font-semibold text-slate-900">
                      {lab.lab_name}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {formatLabSubtitle(lab) || "Additional details not provided yet."}
                    </p>
                    {lab.metadata && (
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {lab.metadata}
                      </p>
                    )}
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Rooms
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                  Saved room directory
                </h2>
              </div>
              <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                {rooms.length}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {rooms.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No rooms created yet. Add one using the form above.
                </p>
              ) : (
                rooms.map((room) => (
                  <article
                    key={room.id}
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4"
                  >
                    <h3 className="text-lg font-semibold text-slate-900">
                      {room.name}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {formatRoomSubtitle(room)}
                    </p>
                    {room.metadata && (
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {room.metadata}
                      </p>
                    )}
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
