import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Header from "../common/Header";
import Footer from "../common/Footer";

export default function EditAsset() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [asset, setAsset] = useState(null);
  const [types, setTypes] = useState([]);
  const [labs, setLabs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(null);

  // Editable states
  const [basic, setBasic] = useState({});
  const [ledger, setLedger] = useState(null);
  const [warranty, setWarranty] = useState(null);
  const [specs, setSpecs] = useState([]);

  // Format MySQL DATETIME → yyyy-mm-dd
  const formatDate = (str) => {
    if (!str) return "";
    return str.split("T")[0];
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    Promise.all([
      api.get(`/assets/${id}`, {
        headers: { Authorization: "Bearer " + token },
      }),
      api.get("/assets/types", {
        headers: { Authorization: "Bearer " + token },
      }),
      api.get("/labs", { headers: { Authorization: "Bearer " + token } }),
    ])
      .then(([assetRes, typesRes, labsRes]) => {
        const a = assetRes.data.asset;

        setAsset(a);
        setTypes(typesRes.data.types || typesRes.data.asset || []);
        setLabs(labsRes.data.labs || labsRes.data.stats || []);

        setBasic({
          asset_type_id: a.asset_type_id,
          brand: a.brand,
          model: a.model,
          serial_no: a.serial_no,
          working_status: a.working_status,
          lab_id: a.lab_id ? String(a.lab_id) : "",
          purchase_date: formatDate(a.purchase_date),
          funding_agency: a.funding_agency,
          price: a.price,
        });

        setLedger(
          a.ledger_id
            ? {
                ledger_id: a.ledger_id,
                ledger_serial_no: a.ledger_serial_no,
                page_no: a.page_no,
              }
            : null
        );

        setWarranty(
          a.warranty_id
            ? {
                warranty_id: a.warranty_id,
                vendor_name: a.vendor_name,
                vendor_contact: a.vendor_contact,
                warranty_startdate: formatDate(a.warranty_startdate),
                warranty_enddate: formatDate(a.warranty_enddate),
              }
            : null
        );

        setSpecs(
          a.specs && a.specs.length > 0
            ? a.specs.map((s) => ({
                spec_key: s.spec_key,
                spec_value: s.spec_value,
                unit: s.unit,
              }))
            : []
        );

        setLoading(false);
      })
      .catch((err) => {
        console.error("Load error:", err);
      });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-sm uppercase tracking-widest text-slate-500 font-semibold">Loading Asset Editor...</p>
    </div>
  );
  if (!asset) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-sm uppercase tracking-widest text-slate-500 font-semibold">Asset not found</p>
    </div>
  );

  const tokenHeader = {
    headers: { Authorization: "Bearer " + localStorage.getItem("token") },
  };

  const isUnderService = asset?.working_status === "under_service";

  const saveBasic = async () => {
    setSavingSection("basic");
    try {
      const payload = {
        ...basic,
        working_status: isUnderService ? asset.working_status : basic.working_status,
      };

      await api.put(`/assets/${id}`, { basic: payload }, tokenHeader);
      alert("Basic details updated");
      navigate(`/assets/${id}`);
    } catch (err) {
      alert("Error updating basic details");
      console.error(err);
    } finally {
      setSavingSection(null);
    }
  };

  const saveLedger = async () => {
    setSavingSection("ledger");
    try {
      await api.put(`/assets/${id}`, { ledger: ledger }, tokenHeader);
      alert("Ledger updated");
      navigate(`/assets/${id}`);
    } catch (err) {
      alert("Error updating ledger");
    } finally {
      setSavingSection(null);
    }
  };

  const saveWarranty = async () => {
    setSavingSection("warranty");
    try {
      await api.put(`/assets/${id}`, { warranty: warranty }, tokenHeader);
      alert("Warranty updated");
      navigate(`/assets/${id}`);
    } catch (err) {
      alert("Error updating warranty");
    } finally {
      setSavingSection(null);
    }
  };

  const saveSpecs = async () => {
    setSavingSection("specs");
    try {
      await api.put(`/assets/${id}`, { specs: specs }, tokenHeader);
      alert("Specifications updated");
      navigate(`/assets/${id}`);
    } catch (err) {
      alert("Error updating specifications");
    } finally {
      setSavingSection(null);
    }
  };

  const addSpecRow = () => {
    setSpecs([...specs, { spec_key: "", spec_value: "", unit: "" }]);
  };

  const updateSpec = (index, field, value) => {
    const arr = [...specs];
    arr[index][field] = value;
    setSpecs(arr);
  };

  const removeSpec = (index) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-5xl px-5 py-8 flex flex-col gap-6">
        <button className="flex w-fit items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-slate-900">
          Edit Asset — {asset.brand} {asset.model}
        </h1>

        <div className="grid gap-6 lg:grid-cols-2 mt-4">
          {/* BASIC */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Basic Information</h2>
              <button 
                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700" 
                onClick={saveBasic}
                disabled={savingSection === 'basic'}
              >
                {savingSection === 'basic' ? 'Saving...' : 'Save'}
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Asset Type</label>
                <select
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  value={basic.asset_type_id}
                  onChange={(e) => setBasic({ ...basic, asset_type_id: e.target.value })}
                >
                  <option value="">Select Type</option>
                  {types.map((t) => (
                    <option key={t.type_id} value={t.type_id}>{t.type_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Brand</label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  value={basic.brand || ""}
                  onChange={(e) => setBasic({ ...basic, brand: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Model</label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  value={basic.model || ""}
                  onChange={(e) => setBasic({ ...basic, model: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Serial Number</label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  value={basic.serial_no || ""}
                  onChange={(e) => setBasic({ ...basic, serial_no: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                <select
                  disabled={isUnderService}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
                  value={basic.working_status}
                  onChange={(e) => setBasic({ ...basic, working_status: e.target.value })}
                >
                  <option value="working">Working</option>
                  <option value="defective">Defective</option>
                  <option value="under_service">Under Service</option>
                </select>
                {isUnderService && (
                  <p className="mt-2 text-xs text-slate-500">Working status cannot be changed while the asset is under service.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Location (Lab)</label>
                <select
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  value={basic.lab_id}
                  onChange={(e) => setBasic({ ...basic, lab_id: e.target.value })}
                >
                  <option value="">Select Lab</option>
                  {labs.map((l) => (
                  <option key={l.lab_id} value={String(l.lab_id)}>{l.lab_name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* LEDGER */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Ledger Details</h2>
              <button 
                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700" 
                onClick={saveLedger}
                disabled={savingSection === 'ledger'}
              >
                {savingSection === 'ledger' ? 'Saving...' : ledger ? "Save" : "Add"}
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Ledger Serial No</label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  value={ledger?.ledger_serial_no || ""}
                  onChange={(e) => setLedger({ ...(ledger || {}), ledger_serial_no: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Page No</label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  value={ledger?.page_no || ""}
                  onChange={(e) => setLedger({ ...(ledger || {}), page_no: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* ADDITIONAL */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Acquisition Details</h2>
              <button 
                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700" 
                onClick={saveBasic}
                disabled={savingSection === 'basic'}
              >
                {savingSection === 'basic' ? 'Saving...' : 'Save'}
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Purchase Date</label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  value={basic.purchase_date || ""}
                  onChange={(e) => setBasic({ ...basic, purchase_date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Funding Agency</label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  value={basic.funding_agency || ""}
                  onChange={(e) => setBasic({ ...basic, funding_agency: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Price</label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  value={basic.price || ""}
                  onChange={(e) => setBasic({ ...basic, price: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* WARRANTY */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Warranty Details</h2>
              <button 
                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700" 
                onClick={saveWarranty}
                disabled={savingSection === 'warranty'}
              >
                {savingSection === 'warranty' ? 'Saving...' : warranty ? "Save" : "Add"}
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Vendor Name</label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  value={warranty?.vendor_name || ""}
                  onChange={(e) => setWarranty({ ...(warranty || {}), vendor_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Vendor Contact</label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  value={warranty?.vendor_contact || ""}
                  onChange={(e) => setWarranty({ ...(warranty || {}), vendor_contact: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Warranty Start</label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  value={warranty?.warranty_startdate || ""}
                  onChange={(e) => setWarranty({ ...(warranty || {}), warranty_startdate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Warranty End</label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  value={warranty?.warranty_enddate || ""}
                  onChange={(e) => setWarranty({ ...(warranty || {}), warranty_enddate: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SPECS */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mt-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Specifications</h2>
            <div className="flex gap-2">
              <button className="rounded-lg bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200" onClick={addSpecRow}>
                + Add Spec
              </button>
              <button 
                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700" 
                onClick={saveSpecs}
                disabled={savingSection === 'specs'}
              >
                {savingSection === 'specs' ? 'Saving...' : 'Save Specs'}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {specs.length === 0 && <p className="text-sm text-slate-500">No specifications added</p>}

            {specs.map((s, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-3 items-center">
                <input
                  className="w-full sm:flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  placeholder="Key (e.g. RAM)"
                  value={s.spec_key}
                  onChange={(e) => updateSpec(idx, "spec_key", e.target.value)}
                />
                <input
                  className="w-full sm:flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  placeholder="Value (e.g. 16)"
                  value={s.spec_value}
                  onChange={(e) => updateSpec(idx, "spec_value", e.target.value)}
                />
                <input
                  className="w-full sm:w-24 rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  placeholder="Unit (e.g. GB)"
                  value={s.unit}
                  onChange={(e) => updateSpec(idx, "unit", e.target.value)}
                />
                <button
                  className="w-full sm:w-auto rounded-lg bg-rose-100 text-rose-600 px-4 py-2 text-sm font-bold hover:bg-rose-200 transition"
                  onClick={() => removeSpec(idx)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
