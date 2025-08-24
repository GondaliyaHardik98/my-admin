import React, { useEffect, useMemo, useState } from "react";
import api from "../api/client";

const empty = { name:"", gst_no:"", contact_person:"", mobile:"", address:"", party_type:"Customer" };

export default function PartyManagement(){
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [editForm, setEditForm] = useState(null); // null or object with id + fields
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
        const { data } = await api.get("/party");
        setRows(Array.isArray(data?.data) ? data.data : []);
        } catch (e) { setError(e?.response?.data?.message || "Failed to load parties"); }
        finally { setLoading(false); }
    };

    const save = async (e) => {
        e.preventDefault(); setSaving(true); setError("");
        try { await api.post("/party", form); setForm(empty); await load(); }
        catch (e) { setError(e?.response?.data?.message || "Create failed"); }
        finally { setSaving(false); }
    };

    const askDelete = async (id) => {
        if (!window.confirm("Delete this party permanently?")) return;

    try {
        await api.delete(`/party/${id}`);
        await load();
    } catch (e) {
        const status = e?.response?.status;
        const body   = e?.response?.data || {};
        const code   = body.code;
        const errno  = body?.err?.errno || body?.errno;

        const isFK =
        status === 409 && (code === "FK_IN_USE" || code === "FK_IN_USE_DB") ||
        errno === 1451; // ER_ROW_IS_REFERENCED_2

        if (isFK) {
        // Try to show the best count we have (when provided)
        const j = body?.usage?.jangad_master ?? null;
        const msg =
            (j !== null)
            ? `This party is used in ${j} Jangad record(s).\nDo you want to delete those and the party as well?`
            : `This party is referenced in other records.\nDelete related records or delete all of them with cascade?`;

        if (window.confirm(msg)) {
            await api.delete(`/party/${id}?cascade=1`);
            await load();
        }
        return; // user canceled or we finished cascading
        }

        alert(body?.message || "Delete failed");
    }
  };

  const openEdit = (row) => setEditForm({ ...row });
  const closeEdit = () => setEditForm(null);
  const saveEdit = async (e) => {
    e.preventDefault();
    await api.put(`/party/${editForm.id}`, editForm);
    closeEdit(); await load();
  };

  useEffect(()=>{ load(); },[]);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(r =>
      [r.name, r.mobile, r.party_type, r.gst_no, r.contact_person, r.address]
        .filter(Boolean).some(v => String(v).toLowerCase().includes(s))
    );
  }, [rows, q]);

  return (
    <div className="container py-3">
      <h2 className="mb-3">Party Management</h2>

      {/* Search */}


      {/* Create */}
      <form onSubmit={save} className="row g-2 mb-3">
        {["name","gst_no","contact_person","mobile","address","party_type"].map((k)=>(
          <div key={k} className="col-md-4">
            <input className="form-control" placeholder={k.replace("_"," ").toUpperCase()}
              value={form[k]||""} onChange={(e)=>setForm({...form,[k]:e.target.value})} required={k==="name"} />
          </div>
        ))}
        <div className="col-12">
          <button disabled={saving || !form.name?.trim()} className="btn btn-primary">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
          </form>
          
        <div className="mb-3">
            <input className="form-control" placeholder="Search by name/mobile/type/GST..." value={q} onChange={e=>setQ(e.target.value)} />
        </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}
      {loading ? <div>Loading...</div> : (
        <table className="table table-sm">
          <thead><tr><th>Name</th><th>Mobile</th><th>Type</th><th className="text-end">Actions</th></tr></thead>
          <tbody>
            {filtered.map(r=>(
              <tr key={r.id}>
                <td>{r.name}</td><td>{r.mobile}</td><td>{r.party_type}</td>
                <td className="text-end">
                  <div className="btn-group">
                    <button className="btn btn-outline-secondary btn-sm" onClick={()=>openEdit(r)}>Edit</button>
                    <button className="btn btn-outline-danger btn-sm" onClick={()=>askDelete(r.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={4} className="text-center">No records</td></tr>}
          </tbody>
        </table>
      )}

      {/* Edit Modal */}
      {editForm && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{background:"rgba(0,0,0,.5)"}}>
          <div className="modal-dialog modal-lg"><div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Party</h5>
              <button type="button" className="btn-close" onClick={closeEdit}></button>
            </div>
            <form onSubmit={saveEdit}>
              <div className="modal-body">
                <div className="row g-2">
                  {["name","gst_no","contact_person","mobile","address","party_type"].map(k=>(
                    <div key={k} className="col-md-6">
                      <input className="form-control" placeholder={k.replace("_"," ").toUpperCase()}
                        value={editForm[k]||""}
                        onChange={(e)=>setEditForm({...editForm,[k]:e.target.value})}
                        required={k==="name"} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={closeEdit}>Cancel</button>
                <button className="btn btn-primary">Save changes</button>
              </div>
            </form>
          </div></div>
        </div>
      )}
    </div>
  );
}
