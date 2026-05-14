import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Header from "../common/Header";
import Footer from "../common/Footer";
import useLabsRooms from "../../hooks/useLabsRooms";

const emptyAsset = {
  type_id: "",
  brand: "",
  model: "",
  serial_no: "",
  working_status: "working",
  lab_id: "",
  purchase_date: "",
  funding_agency: "",
  price: "",
};

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
  const { labs, isLoading: labsLoading } = useLabsRooms();
  const [types, setTypes] = useState([]);
  const [asset, setAsset] = useState(emptyAsset);
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
  const [hasLedger, setHasLedger] = useState(false);
  const [hasSpecs, setHasSpecs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warranty, setWarranty] = useState({
    vendor_name: "",
    vendor_contact: "",
    warranty_startdate: "",
    warranty_enddate: "",
  });
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
      .get("/assets/types", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setTypes(res.data.types || []))
      .catch((err) => console.error("Failed to load asset types:", err));
  }, []);

  const handleAssetChange = (event) => {
    const { name, value } = event.target;
    setAsset((current) => ({ ...current, [name]: value }));
  };

  const handleWarrantyChange = (event) => {
    const { name, value } = event.target;
    setWarranty((current) => ({ ...current, [name]: value }));
  };

  const handleLedgerChange = (event) => {
    const { name, value } = event.target;
    setLedger((current) => ({ ...current, [name]: value }));
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

  const resetForm = () => {
    setAsset(emptyAsset);
    setHasWarranty(false);
    setHasLedger(false);
    setHasSpecs(false);
    setWarranty({
      vendor_name: "",
      vendor_contact: "",
      warranty_startdate: "",
      warranty_enddate: "",
    });
    setLedger({
      ledger_serial_no: "",
      page_no: "",
    });
    setSpecs([{ spec_key: "", spec_value: "", unit: "" }]);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
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
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Authorization: "Bearer " + token,
        },
      });

      alert("Asset added successfully!");
      resetForm();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error adding asset");
      navigate(`/assets/${res.data.asset_id}`);
    } catch (err) {
      console.error("Error adding asset:", err);
      alert(err.response?.data?.error || err.response?.data?.message || "Error adding asset");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-5 py-8">
        <section className="rounded-[2rem] bg-slate-950 px-8 py-10 text-white shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">
                Asset Intake
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight">
                Add a New Asset
              </h1>
              <p className="mt-4 text-slate-300">
                Create equipment records and assign them to the latest lab data
                managed from the shared locations store.
              </p>
            </div>
            <Link
              to="/locations"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Manage Labs & Rooms
            </Link>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                Basic Information
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                Asset details
              </h2>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Asset Type
                </label>
                <select
                  name="type_id"
                  value={asset.type_id}
                  onChange={handleAssetChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-500"
                >
                  <option value="">Select Type</option>
                  {types.map((type) => (
                    <option key={type.type_id} value={type.type_id}>
                      {type.type_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Location (Lab)
                </label>
                <select
                  name="lab_id"
                  value={asset.lab_id}
                  onChange={handleAssetChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-500"
                >
                  <option value="">
                    {labsLoading ? "Loading labs..." : "Select Lab"}
                  </option>
                  {labs.map((lab) => (
                    <option key={lab.lab_id} value={lab.lab_id}>
                      {lab.lab_name}
                      {lab.building ? ` • ${lab.building}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Brand
                </label>
                <input
                  name="brand"
                  value={asset.brand}
                  onChange={handleAssetChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Model
                </label>
                <input
                  name="model"
                  value={asset.model}
                  onChange={handleAssetChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Serial Number
                </label>
                <input
                  name="serial_no"
                  value={asset.serial_no}
                  onChange={handleAssetChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Status
                </label>
                <select
                  name="working_status"
                  value={asset.working_status}
                  onChange={handleAssetChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-500"
                >
                  <option value="working">Working</option>
                  <option value="defective">Defective</option>
                </select>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-6">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                Acquisition Details
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    name="purchase_date"
                    value={asset.purchase_date}
                    onChange={handleAssetChange}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Funding Agency
                  </label>
                  <input
                    name="funding_agency"
                    value={asset.funding_agency}
                    onChange={handleAssetChange}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Price
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={asset.price}
                    onChange={handleAssetChange}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <label className="flex items-center justify-between gap-4">
                <span className="text-lg font-semibold text-slate-900">
                  Ledger Details
                </span>
                <input
                  type="checkbox"
                  checked={hasLedger}
                  onChange={() => setHasLedger((current) => !current)}
                  className="h-5 w-5 rounded border-slate-300"
                />
              </label>

              {hasLedger && (
                <div className="mt-4 space-y-4">
                  <input
                    name="ledger_serial_no"
                    value={ledger.ledger_serial_no}
                    onChange={handleLedgerChange}
                    placeholder="Ledger Serial No"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-500"
                  />
                  <input
                    name="page_no"
                    value={ledger.page_no}
                    onChange={handleLedgerChange}
                    placeholder="Page No"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-500"
                  />
                </div>
              )}
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <label className="flex items-center justify-between gap-4">
                <span className="text-lg font-semibold text-slate-900">
                  Warranty Details
                </span>
                <input
                  type="checkbox"
                  checked={hasWarranty}
                  onChange={() => setHasWarranty((current) => !current)}
                  className="h-5 w-5 rounded border-slate-300"
                />
              </label>

              {hasWarranty && (
                <div className="mt-4 space-y-4">
                  <input
                    name="vendor_name"
                    value={warranty.vendor_name}
                    onChange={handleWarrantyChange}
                    placeholder="Vendor Name"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-500"
                  />
                  <input
                    name="vendor_contact"
                    value={warranty.vendor_contact}
                    onChange={handleWarrantyChange}
                    placeholder="Vendor Contact"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-500"
                  />
                  <input
                    type="date"
                    name="warranty_startdate"
                    value={warranty.warranty_startdate}
                    onChange={handleWarrantyChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-500"
                  />
                  <input
                    type="date"
                    name="warranty_enddate"
                    value={warranty.warranty_enddate}
                    onChange={handleWarrantyChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-500"
                  />
                </div>
              )}
            </section>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <label className="flex items-center justify-between gap-4">
            <span className="text-lg font-semibold text-slate-900">
              Specifications
            </span>
            <input
              type="checkbox"
              checked={hasSpecs}
              onChange={() => setHasSpecs((current) => !current)}
              className="h-5 w-5 rounded border-slate-300"
            />
          </label>

          {hasSpecs && (
            <div className="mt-6 space-y-4">
              {specs.map((spec, index) => (
                <div key={index} className="grid gap-3 lg:grid-cols-[1fr_1fr_160px_auto]">
                  <input
                    value={spec.spec_key}
                    onChange={(event) =>
                      handleSpecChange(index, "spec_key", event.target.value)
                    }
                    placeholder="Specification"
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-500"
                  />
                  <input
                    value={spec.spec_value}
                    onChange={(event) =>
                      handleSpecChange(index, "spec_value", event.target.value)
                    }
                    placeholder="Value"
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-500"
                  />
                  <input
                    value={spec.unit}
                    onChange={(event) =>
                      handleSpecChange(index, "unit", event.target.value)
                    }
                    placeholder="Unit"
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecRow(index)}
                    className="rounded-full bg-rose-100 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-200"
                  >
                    Remove
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addSpecRow}
                className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Add Specification
              </button>
            </div>
          )}
        </section>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-full bg-cyan-600 px-8 py-4 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-cyan-300"
          >
            {isSubmitting ? "Saving Asset..." : "Add Asset"}
          </button>
        </div>
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
