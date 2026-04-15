import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Header from "../common/Header";
import Footer from "../common/Footer";

export default function SendToService() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [asset, setAsset] = useState(null);
  const [form, setForm] = useState({
    sent_date: new Date().toISOString().split("T")[0],
    service_note: "",
    service_provider: "",
    service_through: "",
  });

  useEffect(() => {
    api
      .get(`/assets/${id}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
      .then((res) => setAsset(res.data.asset))
      .catch(() => alert("Failed to load asset"));
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitService = () => {
    api
      .post(
        `/service/send/${id}`,
        { asset_id: id, ...form },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      )
      .then(() => {
        alert("Service request created successfully!");
        navigate(`/assets/${id}`);
      })
      .catch((err) => {
        console.log(err);
        alert("Error sending service request");
      });
  };

  if (!asset) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100 text-slate-700">
        <p className="text-lg font-medium">Loading asset details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Header />

      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-500">Service Request</p>
            <h1 className="mt-3 text-4xl font-semibold">Send Asset to Service</h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Open a service request for this asset with a clear note and service provider details.
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            ← Back
          </button>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-slate-200">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-cyan-100 px-4 py-2 text-sm font-semibold text-cyan-700">Service Asset</span>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">ID #{asset.asset_id}</span>
            </div>

            <div className="mt-8 space-y-5">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Asset</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{asset.brand} {asset.model}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Serial Number</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">{asset.serial_no}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Lab</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">{asset.lab_name}</p>
                </div>
              </div>

              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Current Status</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{asset.working_status}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] bg-slate-950 p-8 text-slate-100 shadow-xl">
            <h2 className="text-2xl font-semibold">Request Details</h2>
            <p className="mt-2 text-slate-400">Complete the form below and submit your service request.</p>

            <div className="mt-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300">Sent Date</label>
                <input
                  type="date"
                  name="sent_date"
                  value={form.sent_date}
                  onChange={handleChange}
                  className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 shadow-sm outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">Service Provider</label>
                <input
                  type="text"
                  name="service_provider"
                  placeholder="E.g. Lenovo Care Coimbatore"
                  onChange={handleChange}
                  className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 shadow-sm outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">Service Through</label>
                <select
                  name="service_through"
                  onChange={handleChange}
                  className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 shadow-sm outline-none focus:border-cyan-400"
                >
                  <option value="">Select</option>
                  <option value="department">Department</option>
                  <option value="central">Central IT</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">Service Note</label>
                <textarea
                  name="service_note"
                  placeholder="Describe the issue..."
                  onChange={handleChange}
                  className="mt-3 h-44 w-full rounded-[1.75rem] border border-slate-800 bg-slate-900 px-4 py-4 text-slate-100 shadow-sm outline-none focus:border-cyan-400"
                />
              </div>

              <button
                className="w-full rounded-full bg-cyan-500 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400"
                onClick={submitService}
              >
                Submit Service Request
              </button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
