// FrontEnd/src/pages/WorkerManagement.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // e.g. http://localhost:3003/api
  headers: { Authorization: `Bearer ${sessionStorage.getItem("jwtToken") || ""}` },
});

export default function WorkerManagement(){
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ name:"", contact_info:"" });
  const [editForm, setEditForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const { data } = await api.get("/worker");
      setRows(Array.isArray(data?.data) ? data.data : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load workers");
    } finally { setLoading(false); }
  };

  const save = async (e) => {
    e.preventDefault();
    await api.post("/worker", form);
    setForm({ name:"", contact_info:"" });
    await load();
  };

  const openEdit = (row) => setEditForm({ ...row });
  const closeEdit = () => setEditForm(null);
  const saveEdit = async (e) => {
    e.preventDefault();
    await api.put(`/worker/${editForm.id}`, editForm);
    closeEdit();
    await load();
  };

  // FK-aware hard delete with cascade prompt
  const askDelete = async (id) => {
    if (!window.confirm("Delete this worker permanently?")) return;
    try {
      await api.delete(`/worker/${id}`);
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
        const j = body?.usage?.jangad_master ?? null;
        const msg =
          (j !== null)
            ? `This worker is used in ${j} Jangad record(s).\nDo you want to delete those and the worker as well?`
            : `This worker is referenced in other records.\nDelete related records or delete all of them with cascade?`;

        if (window.confirm(msg)) {
          await api.delete(`/worker/${id}?cascade=1`);
          await load();
        }
        return;
      }

      alert(body?.message || "Delete failed");
    }
  };

  useEffect(()=>{ load(); },[]);

  // client-side search
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(r => [r.name, r.contact_info]
      .filter(Boolean)
      .some(v => String(v).toLowerCase().includes(s)));
  }, [rows, q]);

  return (
    <div className="container py-3">
      <h2 className="mb-3">Worker Management</h2>

     

      {/* Create */}
      <form onSubmit={save} className="row g-2 mb-3">
        <div className="col-md-4">
          <input className="form-control" placeholder="Name" required
                 value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/>
        </div>
        <div className="col-md-4">
          <input className="form-control" placeholder="Contact info"
                 value={form.contact_info} onChange={(e)=>setForm({...form,contact_info:e.target.value})}/>
        </div>
        <div className="col-12">
          <button className="btn btn-primary">Save</button>
        </div>
      </form>
 {/* Search */}
      <div className="mb-3">
        <input className="form-control"
               placeholder="Search workers by name/contact…"
               value={q} onChange={e=>setQ(e.target.value)} />
      </div>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      {loading ? <div>Loading...</div> : (
        <table className="table table-sm">
          <thead>
            <tr><th>Name</th><th>Contact</th><th className="text-end">Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(w=>(
              <tr key={w.id}>
                <td>{w.name}</td>
                <td>{w.contact_info}</td>
                <td className="text-end">
                  <div className="btn-group">
                    <button className="btn btn-outline-secondary btn-sm" onClick={()=>openEdit(w)}>Edit</button>
                    <button className="btn btn-outline-danger btn-sm" onClick={()=>askDelete(w.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={3} className="text-center">No records</td></tr>}
          </tbody>
        </table>
      )}

      {/* Edit Modal */}
      {editForm && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{background:"rgba(0,0,0,.5)"}}>
          <div className="modal-dialog"><div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Worker</h5>
              <button type="button" className="btn-close" onClick={closeEdit}></button>
            </div>
            <form onSubmit={saveEdit}>
              <div className="modal-body">
                <div className="mb-2">
                  <input className="form-control" placeholder="Name" required
                         value={editForm.name||""}
                         onChange={(e)=>setEditForm({...editForm,name:e.target.value})}/>
                </div>
                <div className="mb-2">
                  <input className="form-control" placeholder="Contact info"
                         value={editForm.contact_info||""}
                         onChange={(e)=>setEditForm({...editForm,contact_info:e.target.value})}/>
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
