import { useEffect, useState } from "react";
import api from "../../services/api";
import Header from "../common/Header";
import Footer from "../common/Footer";

export default function UnderService() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [completeModal, setCompleteModal] = useState(false);
  const [claimWarranty, setClaimWarranty] = useState("no");
  const [serviceCost, setServiceCost] = useState("");
  const [completionNote, setCompletionNote] = useState("");

  useEffect(() => {
    api
      .get("/service/", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
      .then((res) => setList(res.data.services))
      .catch((err) => console.log("Error loading services:", err));
  }, []);

  const formatDate = (str) => {
    if (!str) return "";
    const date = str.includes("T") ? str.split("T")[0] : str;
    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
  };

  const filtered = list.filter((item) => {
    const s = search.toLowerCase();
    return (
      item.brand.toLowerCase().includes(s) ||
      item.model.toLowerCase().includes(s) ||
      item.serial_no.toLowerCase().includes(s) ||
      item.service_provider.toLowerCase().includes(s) ||
      item.service_status.toLowerCase().includes(s) ||
      item.asset_id.toString().includes(s)
    );
  });

  const completedCount = list.filter(
    (item) => item.service_status.toLowerCase() === "completed"
  ).length;
  const pendingCount = list.length - completedCount;

  const finishService = () => {
    api
      .put(
        `/service/complete/${selected.service_id}`,
        {
          service_cost: claimWarranty === "yes" ? 0 : serviceCost,
          service_note: completionNote,
          claim_warranty: claimWarranty === "yes" ? 1 : 0,
        },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      )
      .then(() => {
        alert("Service marked as completed");
        setCompleteModal(false);
        setSelected(null);
        setServiceCost("");
        setCompletionNote("");
        setClaimWarranty("no");

        setList((prev) =>
          prev.filter((s) => s.service_id !== selected.service_id)
        );
      })
      .catch(() => alert("Error completing service"));
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Header />

      <main className="mx-auto max-w-7xl px-5 py-8">
        <section className="overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-8 shadow-2xl text-slate-100 sm:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.4em] text-cyan-300">Service Requests</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight">Service Requests In Progress</h1>
              <p className="mt-4 max-w-xl text-slate-300">
                Manage every service request in one place, with clear progress stats and fast access to request details.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:w-auto">
              <div className="rounded-[1.75rem] bg-white/10 p-5 ring-1 ring-white/10 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Total Requests</p>
                <p className="mt-3 text-3xl font-semibold">{list.length}</p>
              </div>
              <div className="rounded-[1.75rem] bg-white/10 p-5 ring-1 ring-white/10 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Pending</p>
                <p className="mt-3 text-3xl font-semibold">{pendingCount}</p>
              </div>
              <div className="rounded-[1.75rem] bg-white/10 p-5 ring-1 ring-white/10 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Completed</p>
                <p className="mt-3 text-3xl font-semibold">{completedCount}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Search & filter</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Find any service request quickly</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                placeholder="Search assets by brand, model, serial..."
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-3 text-slate-900 shadow-sm outline-none focus:border-black"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-10 space-y-4">
            {filtered.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
                No service records found.
              </div>
            ) : (
              filtered.map((item) => (
                <article
                  key={item.service_id}
                  className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                        <span className="rounded-full bg-slate-100 px-3 py-1">Asset #{item.asset_id}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1">Sent {formatDate(item.sent_date)}</span>
                      </div>
                      <h3 className="text-2xl font-semibold text-slate-900">
                        {item.brand} — {item.model}
                      </h3>
                      <p className="text-sm text-slate-500">
                        Serial: {item.serial_no} • Lab: {item.lab_name}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:items-end">
                      <span className="inline-flex items-center rounded-full bg-cyan-100 px-4 py-2 text-sm font-semibold text-cyan-700">
                        {item.service_provider}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold uppercase ${
                          item.service_status.toLowerCase() === "completed"
                            ? "bg-emerald-500 text-white"
                            : item.service_status.toLowerCase() === "defective"
                            ? "bg-red-500 text-white"
                            : "bg-sky-500 text-white"
                        }`}
                      >
                        {item.service_status}
                      </span>
                      <button
                        className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                        onClick={() => setSelected(item)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>

      <Footer />

      {selected && !completeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-[2rem] bg-white p-8 shadow-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-500">Service Details</p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">{selected.brand} — {selected.model}</h2>
                <p className="mt-2 text-sm text-slate-500">Complete request information for the selected service asset.</p>
              </div>
              <button
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Asset ID</p>
                <p className="mt-3 text-lg font-semibold text-slate-900">#{selected.asset_id}</p>
              </div>
              <div className="rounded-[1.5rem] bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Lab</p>
                <p className="mt-3 text-lg font-semibold text-slate-900">{selected.lab_name}</p>
              </div>
              <div className="rounded-[1.5rem] bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Serial</p>
                <p className="mt-3 text-lg font-semibold text-slate-900">{selected.serial_no}</p>
              </div>
              <div className="rounded-[1.5rem] bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Sent Date</p>
                <p className="mt-3 text-lg font-semibold text-slate-900">{formatDate(selected.sent_date)}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-slate-100 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Service Provider</p>
                <p className="mt-3 text-lg font-semibold text-slate-900">{selected.service_provider}</p>
              </div>
              <div className="rounded-[1.5rem] bg-slate-100 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Service Through</p>
                <p className="mt-3 text-lg font-semibold text-slate-900">{selected.service_through || "N/A"}</p>
              </div>
            </div>

            <div className="mt-8 rounded-[1.5rem] bg-slate-950 p-6 text-slate-100">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Notes</p>
              <p className="mt-4 text-sm leading-7 text-slate-200">{selected.service_note || "No notes were provided for this service request."}</p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
              <div className="space-y-2">
                <p className="text-sm text-slate-500">Claim Warranty</p>
                <p className="text-lg font-semibold text-slate-900">{selected.claim_warranty ? "Yes" : "No"}</p>
              </div>
              <button
                className="rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400"
                onClick={() => setCompleteModal(true)}
              >
                Complete Service
              </button>
            </div>
          </div>
        </div>
      )}

      {completeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-[2rem] bg-white p-8 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-slate-900">Complete Service</h2>
              <button
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                onClick={() => setCompleteModal(false)}
              >
                Cancel
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700">Claim in Warranty?</label>
                {selected?.is_warranty_valid === 1 ? (
                  <select
                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-slate-900"
                    value={claimWarranty}
                    onChange={(e) => setClaimWarranty(e.target.value)}
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                ) : (
                  <input
                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600"
                    value="Not eligible (No valid warranty)"
                    disabled
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Service Cost</label>
                <input
                  type="number"
                  className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-slate-900"
                  value={claimWarranty === "yes" ? 0 : serviceCost}
                  disabled={claimWarranty === "yes"}
                  onChange={(e) => setServiceCost(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Completion Note</label>
                <textarea
                  className="mt-3 w-full min-h-[140px] rounded-[1.75rem] border border-slate-200 bg-white px-4 py-4 text-slate-900 shadow-sm outline-none focus:border-slate-900"
                  value={completionNote}
                  onChange={(e) => setCompletionNote(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                onClick={finishService}
              >
                Finish Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
