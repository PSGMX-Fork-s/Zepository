import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Header from "../common/Header";
import Footer from "../common/Footer";

const styles = {
  pageWrapper: "min-h-screen bg-slate-50 text-slate-900 flex flex-col",
  contentWrapper: "mx-auto w-full max-w-7xl flex-1 px-5 py-8",
  pageTitle: "text-3xl font-bold tracking-tight text-slate-900",
  splitContainer: "mt-6 grid gap-6 lg:grid-cols-2",
  block: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm",
  blockTitle: "mb-5 text-xl font-bold tracking-tight text-slate-900",
  checkboxLabel: "mt-4 flex items-center gap-3 text-sm font-medium text-slate-700",
  checkInput: "h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500",
  infoBox: "mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4",
  specBox: "mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4",
  specRow: "grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 md:grid-cols-[1fr_1fr_140px_auto]",
  removeButton:
    "rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50",
  addSpecButton:
    "mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100",
  submitButton:
    "mt-6 rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60",
};

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500";

const labelClass = "mt-4 block text-sm font-semibold text-slate-700";

export default function AddAsset() {
  const navigate = useNavigate();
  const [types, setTypes] = useState([]);
  const [labs, setLabs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [asset, setAsset] = useState({
    type_id: "",
    brand: "",
    model: "",
    serial_no: "",
    working_status: "working",
    lab_id: "",
    purchase_date: "",
    funding_agency: "",
    price: "",
  });

  const [hasWarranty, setHasWarranty] = useState(false);
  const [warranty, setWarranty] = useState({
    vendor_name: "",
    vendor_contact: "",
    warranty_startdate: "",
    warranty_enddate: "",
  });

  const [hasLedger, setHasLedger] = useState(false);
  const [ledger, setLedger] = useState({
    ledger_serial_no: "",
    page_no: "",
  });

  const [hasSpecs, setHasSpecs] = useState(false);
  const [specs, setSpecs] = useState([{ spec_key: "", spec_value: "", unit: "" }]);

  useEffect(() => {
    const headers = {
      Authorization: "Bearer " + localStorage.getItem("token"),
    };

    api
      .get("/assets/types", { headers })
      .then((res) => setTypes(res.data.types || []))
      .catch((err) => console.error("Failed to load asset types:", err));

    api
      .get("/labs", { headers })
      .then((res) => setLabs(res.data.labs || []))
      .catch((err) => console.error("Failed to load labs:", err));
  }, []);

  const handleAssetChange = (e) => {
    setAsset((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const handleWarrantyChange = (e) => {
    setWarranty((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const handleLedgerChange = (e) => {
    setLedger((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const handleSpecChange = (index, field, value) => {
    setSpecs((current) =>
      current.map((spec, specIndex) =>
        specIndex === index ? { ...spec, [field]: value } : spec
      )
    );
  };

  const addSpecRow = () => {
    setSpecs((current) => [...current, { spec_key: "", spec_value: "", unit: "" }]);
  };

  const removeSpecRow = (index) => {
    setSpecs((current) => current.filter((_, specIndex) => specIndex !== index));
  };

  const hasAnyValue = (obj) =>
    Object.values(obj).some((value) => String(value || "").trim() !== "");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!asset.type_id || !asset.brand || !asset.model || !asset.serial_no || !asset.lab_id) {
      alert("Please fill in the required asset details.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login again.");
      navigate("/login");
      return;
    }

    const filteredSpecs = hasSpecs
      ? specs.filter((spec) => hasAnyValue(spec))
      : [];

    const finalData = {
      ...asset,
      warranty: hasWarranty && hasAnyValue(warranty) ? warranty : null,
      ledger: hasLedger && hasAnyValue(ledger) ? ledger : null,
      specs: filteredSpecs,
    };

    try {
      setIsSubmitting(true);

      const res = await api.post("/assets/add", finalData, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      alert("Asset added successfully!");
      navigate(`/assets/${res.data.asset_id}`);
    } catch (err) {
      console.error("Error adding asset:", err);
      alert(err.response?.data?.error || err.response?.data?.message || "Error adding asset");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />

      <main className={styles.contentWrapper}>
        <form onSubmit={handleSubmit}>
          <h1 className={styles.pageTitle}>Add New Asset</h1>

          <div className={styles.splitContainer}>
            <section className={styles.block}>
              <h2 className={styles.blockTitle}>Basic Information</h2>

              <label className={labelClass}>Asset Type</label>
              <select
                className={inputClass}
                name="type_id"
                value={asset.type_id}
                onChange={handleAssetChange}
                required
              >
                <option value="">Select Type</option>
                {types.map((t) => (
                  <option key={t.type_id} value={t.type_id}>
                    {t.type_name}
                  </option>
                ))}
              </select>

              <label className={labelClass}>Brand</label>
              <input
                className={inputClass}
                name="brand"
                value={asset.brand}
                onChange={handleAssetChange}
                required
              />

              <label className={labelClass}>Model</label>
              <input
                className={inputClass}
                name="model"
                value={asset.model}
                onChange={handleAssetChange}
                required
              />

              <label className={labelClass}>Serial Number</label>
              <input
                className={inputClass}
                name="serial_no"
                value={asset.serial_no}
                onChange={handleAssetChange}
                required
              />

              <label className={labelClass}>Status</label>
              <select
                className={inputClass}
                name="working_status"
                value={asset.working_status}
                onChange={handleAssetChange}
              >
                <option value="working">Working</option>
                <option value="defective">Defective</option>
              </select>

              <label className={labelClass}>Location (Lab)</label>
              <select
                className={inputClass}
                name="lab_id"
                value={asset.lab_id}
                onChange={handleAssetChange}
                required
              >
                <option value="">Select Lab</option>
                {labs.map((lab) => (
                  <option key={lab.lab_id} value={lab.lab_id}>
                    {lab.lab_name}
                  </option>
                ))}
              </select>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={hasLedger}
                  onChange={() => setHasLedger((current) => !current)}
                  className={styles.checkInput}
                />
                <span>Include Ledger Details</span>
              </label>

              {hasLedger && (
                <div className={styles.infoBox}>
                  <h2 className={styles.blockTitle}>Ledger Details</h2>

                  <label className={labelClass}>Ledger Serial No</label>
                  <input
                    className={inputClass}
                    name="ledger_serial_no"
                    value={ledger.ledger_serial_no}
                    onChange={handleLedgerChange}
                  />

                  <label className={labelClass}>Page No</label>
                  <input
                    className={inputClass}
                    name="page_no"
                    value={ledger.page_no}
                    onChange={handleLedgerChange}
                  />
                </div>
              )}
            </section>

            <section className={styles.block}>
              <h2 className={styles.blockTitle}>Additional Details</h2>

              <label className={labelClass}>Purchase Date</label>
              <input
                className={inputClass}
                type="date"
                name="purchase_date"
                value={asset.purchase_date}
                onChange={handleAssetChange}
              />

              <label className={labelClass}>Funding Agency</label>
              <input
                className={inputClass}
                name="funding_agency"
                value={asset.funding_agency}
                onChange={handleAssetChange}
              />

              <label className={labelClass}>Cost</label>
              <input
                className={inputClass}
                type="number"
                min="0"
                name="price"
                value={asset.price}
                onChange={handleAssetChange}
              />

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={hasWarranty}
                  onChange={() => setHasWarranty((current) => !current)}
                  className={styles.checkInput}
                />
                <span>Include Warranty Details</span>
              </label>

              {hasWarranty && (
                <div className={styles.infoBox}>
                  <h2 className={styles.blockTitle}>Warranty Details</h2>

                  <label className={labelClass}>Vendor Name</label>
                  <input
                    className={inputClass}
                    name="vendor_name"
                    value={warranty.vendor_name}
                    onChange={handleWarrantyChange}
                  />

                  <label className={labelClass}>Vendor Contact</label>
                  <input
                    className={inputClass}
                    name="vendor_contact"
                    value={warranty.vendor_contact}
                    onChange={handleWarrantyChange}
                  />

                  <label className={labelClass}>Warranty Start Date</label>
                  <input
                    className={inputClass}
                    type="date"
                    name="warranty_startdate"
                    value={warranty.warranty_startdate}
                    onChange={handleWarrantyChange}
                  />

                  <label className={labelClass}>Warranty End Date</label>
                  <input
                    className={inputClass}
                    type="date"
                    name="warranty_enddate"
                    value={warranty.warranty_enddate}
                    onChange={handleWarrantyChange}
                  />
                </div>
              )}

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={hasSpecs}
                  className={styles.checkInput}
                  onChange={() => setHasSpecs((current) => !current)}
                />
                <span>Include Specifications</span>
              </label>

              {hasSpecs && (
                <div className={styles.specBox}>
                  <h2 className={styles.blockTitle}>Specifications</h2>

                  {specs.map((spec, index) => (
                    <div key={index} className={styles.specRow}>
                      <input
                        className={inputClass}
                        placeholder="Spec Key"
                        value={spec.spec_key}
                        onChange={(e) => handleSpecChange(index, "spec_key", e.target.value)}
                      />
                      <input
                        className={inputClass}
                        placeholder="Spec Value"
                        value={spec.spec_value}
                        onChange={(e) => handleSpecChange(index, "spec_value", e.target.value)}
                      />
                      <input
                        className={inputClass}
                        placeholder="Unit"
                        value={spec.unit}
                        onChange={(e) => handleSpecChange(index, "unit", e.target.value)}
                      />

                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => removeSpecRow(index)}
                        disabled={specs.length === 1}
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <button type="button" className={styles.addSpecButton} onClick={addSpecRow}>
                    + Add Specification
                  </button>
                </div>
              )}
            </section>
          </div>

          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? "Adding Asset..." : "Add Asset"}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
