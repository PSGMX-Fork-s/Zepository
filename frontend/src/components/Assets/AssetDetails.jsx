import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Header from "../common/Header";
import Footer from "../common/Footer";

export default function AssetDetails() {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get(`/assets/${id}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
      .then((res) => setAsset(res.data.asset))
      .catch((err) => console.log("Error:", err));
  }, [id]);

  const formatDate = (str) => {
    if (!str) return "";
    const date = str.includes("T") ? str.split("T")[0] : str;
    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
  };

  if (!asset) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm uppercase tracking-widest text-slate-500 font-semibold">Loading Asset...</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || "";
    if (s === "working") return "bg-emerald-100 text-emerald-800";
    if (s === "defective") return "bg-rose-100 text-rose-800";
    if (s === "under_service") return "bg-cyan-100 text-cyan-800";
    return "bg-slate-100 text-slate-800";
  };

  const totalServiceCost = asset.services?.reduce(
    (sum, service) => sum + Number(service?.service_cost || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-5 py-8 flex flex-col gap-8">
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            className="flex w-fit items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            onClick={() => window.history.back()}
          >
            ← Back to Directory
          </button>
          
          <div className="flex gap-2">
            <button
              className="rounded-lg bg-white border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 shadow-sm"
              onClick={() => navigate(`/assets/${id}/edit`)}
            >
              Edit Asset
            </button>
            {asset.working_status === "defective" && (
              <button
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 shadow-sm"
                onClick={() => navigate(`/service/send/${id}`)}
              >
                Send to Service
              </button>
            )}
          </div>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`inline-flex rounded px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${getStatusColor(asset.working_status)}`}>
              {asset.working_status}
            </span>
            <span className="inline-flex rounded bg-slate-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-slate-700">
              {asset.type_name}
            </span>
            <span className="inline-flex rounded bg-slate-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-slate-700">
              #{asset.asset_id}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            {asset.brand} • {asset.model}
          </h1>
          <p className="mt-2 text-lg text-slate-500">
            Serial: {asset.serial_no}
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <h2 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">Brand</p>
                <p className="mt-1 text-base font-semibold text-slate-900">{asset.brand}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Model</p>
                <p className="mt-1 text-base font-semibold text-slate-900">{asset.model}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Lab</p>
                <p className="mt-1 text-base font-semibold text-slate-900">{asset.lab_name}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Type</p>
                <p className="mt-1 text-base font-semibold text-slate-900">{asset.type_name}</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <h2 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-6">Acquisition</h2>
            
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">Purchase Date</p>
                <p className="mt-1 text-base font-semibold text-slate-900">{formatDate(asset.purchase_date) || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Agency</p>
                <p className="mt-1 text-base font-semibold text-slate-900">{asset.funding_agency || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Cost</p>
                <p className="mt-1 text-base font-semibold text-emerald-600">{asset.price ? `₹${asset.price}` : "—"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Updated</p>
                <p className="mt-1 text-base font-semibold text-slate-900">{formatDate(asset.updated_at) || "—"}</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <h2 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-6">Ledger Details</h2>
            
            {asset.ledger_id ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Serial No</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">{asset.ledger_serial_no}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Page No</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">{asset.page_no}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No Ledger Details Available.</p>
            )}
          </section>

          <section className="rounded-2xl bg-slate-900 text-white p-6 shadow-sm">
            <h2 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-6">Warranty</h2>
            
            {asset.warranty_id ? (
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className="text-sm font-semibold text-slate-400">Vendor</p>
                  <p className="mt-1 text-base font-semibold">{asset.vendor_name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-400">Contact</p>
                  <p className="mt-1 text-base font-semibold">{asset.vendor_contact}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-400">Start</p>
                  <p className="mt-1 text-base font-semibold text-cyan-200">{formatDate(asset.warranty_startdate)}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-400">End</p>
                  <p className="mt-1 text-base font-semibold text-rose-200">{formatDate(asset.warranty_enddate)}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No warranty data available.</p>
            )}
          </section>
        </div>

        <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <h2 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-6">Specifications</h2>

          {asset.specs && asset.specs.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {asset.specs.map((spec, idx) => (
                <div key={idx} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{spec.spec_key}</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">
                    {spec.spec_value} <span className="text-slate-400 text-sm">{spec.unit || ""}</span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No specifications added.</p>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <h2 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-6">Service History</h2>

          {asset.services && asset.services.length > 0 ? (
            <>
              <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">Total Service Cost</p>
                <p className="text-lg font-bold text-slate-900">₹{totalServiceCost}</p>
              </div>
              <div className="space-y-4">
              {asset.services.map((service) => (
                <div key={service.service_id} className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                      <span className={`inline-flex rounded px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider mb-2 ${
                        service.service_status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-cyan-100 text-cyan-800'
                      }`}>
                        {service.service_status === "completed" ? "Completed" : "Under Service"}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900">{service.service_provider}</h3>
                    </div>
                    <div className="text-sm font-semibold text-slate-500 text-right">
                      <p>{formatDate(service.sent_date)}</p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-slate-700">
                    <p className="mb-2"><span className="font-semibold text-slate-500">Method:</span> {service.service_through}</p>
                    <p className="mb-4"><span className="font-semibold text-slate-500">Diagnostic:</span> {service.service_note || "N/A"}</p>
                    
                    {service.service_status === "completed" && (
                      <div className="pt-4 border-t border-slate-200">
                        <p className="mb-2"><span className="font-semibold text-slate-500">Completion Remarks:</span> {service.after_note || "N/A"}</p>
                        <p className="font-bold text-slate-900">Cost: ₹{service.service_cost}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">This asset has never been sent for service.</p>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
}
