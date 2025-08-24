import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const emptyItem = { item_description:"", pcs:"", carat:"", process_type:"" };
const emptyMaster = { jangad_no:"", issue_date:"", return_date:"", party_id:"", worker_id:"", remarks:"" };

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // e.g., http://localhost:3003/api
  headers: { Authorization: `Bearer ${sessionStorage.getItem("jwtToken") || ""}` }
});

export default function JangadManagement(){
  const [rows, setRows] = useState([]);
  const [master, setMaster] = useState(emptyMaster);
  const [items, setItems] = useState([{...emptyItem}]);
  const [loading, setLoading] = useState(false);
  const [parties, setParties] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  const [edit, setEdit] = useState(null); // { id, master:{...}, items:[...] }

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [j,p,w] = await Promise.all([
        api.get("/jangad"),
        api.get("/party"),
        api.get("/worker"),
      ]);
      setRows(Array.isArray(j.data?.data) ? j.data.data : []);
      setParties(Array.isArray(p.data?.data) ? p.data.data : []);
      setWorkers(Array.isArray(w.data?.data) ? w.data.data : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load data");
    } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

  // ---- Create
  const addRow = () => setItems([...items, {...emptyItem}]);
  const removeRow = (idx) => setItems(items.filter((_,i)=>i!==idx));
  const saveNew = async (e) => {
    e.preventDefault();
    if (!master.jangad_no || !master.party_id || !master.worker_id) {
      return alert("Jangad No, Party and Worker are required");
    }
    const cleanItems = items
      .filter(i => i.item_description || i.pcs || i.carat || i.process_type)
      .map(i => ({ ...i, pcs:Number(i.pcs||0), carat:Number(i.carat||0) }));
    await api.post("/jangad", { ...master, items: cleanItems });
    setMaster(emptyMaster); setItems([{...emptyItem}]); await load();
  };

  // ---- Delete
  const askDelete = async (id) => {
    if (!window.confirm("Delete this Jangad permanently?")) return;
    await api.delete(`/jangad/${id}`);
    await load();
  };

  // ---- Edit
  const openEdit = async (row) => {
    const { data } = await api.get(`/jangad/${row.id}`);
    if (!data?.success) return alert("Failed to load record");
    const m = data.data;
    setEdit({
      id: row.id,
      master: {
        jangad_no: m.jangad_no || "",
        issue_date: m.issue_date ? String(m.issue_date).slice(0,10) : "",
        return_date: m.return_date ? String(m.return_date).slice(0,10) : "",
        party_id: m.party_id || "",
        worker_id: m.worker_id || "",
        remarks: m.remarks || "",
      },
      items: (m.items || []).map(it => ({
        item_description: it.item_description || "",
        pcs: it.pcs || "",
        carat: it.carat || "",
        process_type: it.process_type || "",
      }))
    });
  };
  const closeEdit = () => setEdit(null);
  const addEditItem = () => setEdit(prev => ({ ...prev, items:[...prev.items, {...emptyItem}] }));
  const removeEditItem = (idx) => setEdit(prev => ({ ...prev, items: prev.items.filter((_,i)=>i!==idx) }));
  const saveEdit = async (e) => {
    e.preventDefault();
    const cleanItems = edit.items
      .filter(i => i.item_description || i.pcs || i.carat || i.process_type)
      .map(i => ({ ...i, pcs:Number(i.pcs||0), carat:Number(i.carat||0) }));
    await api.put(`/jangad/${edit.id}`, { ...edit.master, items: cleanItems });
    closeEdit();
    await load();
  };

  // ---- Search (client only)
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(r =>
      [r.jangad_no, r.party_name, r.worker_name, r.remarks]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(s))
    );
  }, [rows, q]);


  const [ret, setRet] = useState(null); // { id, items:[{item_id,desc,issued,returned,outstanding, pcs, carat, polished_carat}] , return_date, remarks }

const openReturn = async (row) => {
  const { data } = await api.get(`/jangad/${row.id}/summary`);
  const items = (data?.data||[]).map(it => ({
    item_id: it.item_id,
    desc: it.item_description,
    issued_pcs: it.issued_pcs, issued_carat: it.issued_carat,
    returned_pcs: it.returned_pcs, returned_carat: it.returned_carat,
    out_pcs: it.out_pcs, out_carat: it.out_carat,
    pcs: "", carat: "", polished_carat: ""
  }));
  setRet({ id: row.jangad_no, return_date: new Date().toISOString().slice(0,10), remarks:"", items });
};

const closeReturn = () => setRet(null);

const saveReturn = async (e) => {
  e.preventDefault();
  const payload = {
    return_date: ret.return_date,
    remarks: ret.remarks,
    items: ret.items
      .map(i => ({
        item_id: i.item_id,
        pcs: Number(i.pcs||0),
        carat: Number(i.carat||0),
        polished_carat: i.polished_carat ? Number(i.polished_carat) : null
      }))
      .filter(i => i.pcs>0 || i.carat>0)
  };
  if (!payload.items.length) return alert("Enter at least one return quantity.");
  await api.post(`/jangad/${ret.id}/return`, payload);
  closeReturn();
  await load();
};


  return (
    <div className="container py-3">
      <h2 className="mb-3">Jangad Management</h2>



      {/* Create */}
      <form onSubmit={saveNew} className="border rounded p-3 mb-4">
        <div className="row g-2 mb-2">
          <div className="col-md-3"><input className="form-control" placeholder="Jangad No" required value={master.jangad_no} onChange={(e)=>setMaster({...master,jangad_no:e.target.value})}/></div>
          <div className="col-md-3"><input type="date" className="form-control" value={master.issue_date} onChange={(e)=>setMaster({...master,issue_date:e.target.value})}/></div>
          <div className="col-md-3"><input type="date" className="form-control" value={master.return_date} onChange={(e)=>setMaster({...master,return_date:e.target.value})}/></div>
          <div className="col-md-3"><input className="form-control" placeholder="Remarks" value={master.remarks} onChange={(e)=>setMaster({...master,remarks:e.target.value})}/></div>

          <div className="col-md-3">
            <select className="form-select" required value={master.party_id} onChange={(e)=>setMaster({...master,party_id:e.target.value})}>
              <option value="">Select Party</option>
              {parties.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select" required value={master.worker_id} onChange={(e)=>setMaster({...master,worker_id:e.target.value})}>
              <option value="">Select Worker</option>
              {workers.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead><tr><th>Description</th><th>PCS</th><th>Carat</th><th>Process</th><th></th></tr></thead>
            <tbody>
              {items.map((it,idx)=>(
                <tr key={idx}>
                  <td><input className="form-control" value={it.item_description} onChange={(e)=>setItems(items.map((r,i)=>i===idx?{...r,item_description:e.target.value}:r))}/></td>
                  <td style={{maxWidth:100}}><input type="number" min="0" className="form-control" value={it.pcs} onChange={(e)=>setItems(items.map((r,i)=>i===idx?{...r,pcs:e.target.value}:r))}/></td>
                  <td style={{maxWidth:120}}><input type="number" step="0.01" min="0" className="form-control" value={it.carat} onChange={(e)=>setItems(items.map((r,i)=>i===idx?{...r,carat:e.target.value}:r))}/></td>
                  <td><input className="form-control" value={it.process_type} onChange={(e)=>setItems(items.map((r,i)=>i===idx?{...r,process_type:e.target.value}:r))}/></td>
                  <td className="text-end">
                    {items.length>1 && <button type="button" className="btn btn-outline-danger btn-sm" onClick={()=>removeRow(idx)}>Remove</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="d-flex gap-2">
          <button type="button" className="btn btn-outline-secondary" onClick={addRow}>+ Add Item</button>
          <button className="btn btn-primary">Create Jangad</button>
        </div>
      </form>
      
      {/* Search */}
      <div className="mb-3">
        <input className="form-control" placeholder="Search by Jangad No / Party / Worker / Remarks..."
               value={q} onChange={e=>setQ(e.target.value)} />
      </div>
      {/* List */}
      {error && <div className="alert alert-danger py-2">{error}</div>}
      {loading ? <div>Loading...</div> : (
        <table className="table table-sm">
          <thead><tr><th>Jangad No</th><th>Issue</th><th>Party</th><th>Worker</th><th>Remarks</th><th className="text-end">Actions</th></tr></thead>
          <tbody>
            {filtered.map(r=>(
              <tr key={r.id}>
                <td>{r.jangad_no}</td>
                <td>{r.issue_date?.slice(0,10)}</td>
                <td>{r.party_name}</td>
                <td>{r.worker_name}</td>
                <td>{r.remarks}</td>
                <td> <button className="btn btn-outline-success btn-sm" onClick={()=>openReturn(r)}>Return</button></td>
                <td className="text-end">
                  <div className="btn-group">
                    <button className="btn btn-outline-secondary btn-sm" onClick={()=>openEdit(r)}>Edit</button>
                    <button className="btn btn-outline-danger btn-sm" onClick={()=>askDelete(r.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={6} className="text-center">No records</td></tr>}
          </tbody>
        </table>
      )}

      {/* Edit Modal */}
      {edit && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{background:"rgba(0,0,0,.5)"}}>
          <div className="modal-dialog modal-xl"><div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Jangad</h5>
              <button type="button" className="btn-close" onClick={closeEdit}></button>
            </div>
            <form onSubmit={saveEdit}>
              <div className="modal-body">
                <div className="row g-2 mb-2">
                  <div className="col-md-3"><input className="form-control" placeholder="Jangad No" required value={edit.master.jangad_no} onChange={(e)=>setEdit({...edit, master:{...edit.master, jangad_no:e.target.value}})}/></div>
                  <div className="col-md-3"><input type="date" className="form-control" value={edit.master.issue_date} onChange={(e)=>setEdit({...edit, master:{...edit.master, issue_date:e.target.value}})}/></div>
                  <div className="col-md-3"><input type="date" className="form-control" value={edit.master.return_date} onChange={(e)=>setEdit({...edit, master:{...edit.master, return_date:e.target.value}})}/></div>
                  <div className="col-md-3"><input className="form-control" placeholder="Remarks" value={edit.master.remarks} onChange={(e)=>setEdit({...edit, master:{...edit.master, remarks:e.target.value}})}/></div>
                  <div className="col-md-3">
                    <select className="form-select" required value={edit.master.party_id} onChange={(e)=>setEdit({...edit, master:{...edit.master, party_id:e.target.value}})}>
                      <option value="">Select Party</option>
                      {parties.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <select className="form-select" required value={edit.master.worker_id} onChange={(e)=>setEdit({...edit, master:{...edit.master, worker_id:e.target.value}})}>
                      <option value="">Select Worker</option>
                      {workers.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead><tr><th>Description</th><th>PCS</th><th>Carat</th><th>Process</th><th></th></tr></thead>
                    <tbody>
                      {edit.items.map((it,idx)=>(
                        <tr key={idx}>
                          <td><input className="form-control" value={it.item_description} onChange={(e)=>setEdit({...edit, items: edit.items.map((r,i)=>i===idx?{...r,item_description:e.target.value}:r)})}/></td>
                          <td style={{maxWidth:100}}><input type="number" min="0" className="form-control" value={it.pcs} onChange={(e)=>setEdit({...edit, items: edit.items.map((r,i)=>i===idx?{...r,pcs:e.target.value}:r)})}/></td>
                          <td style={{maxWidth:120}}><input type="number" step="0.01" min="0" className="form-control" value={it.carat} onChange={(e)=>setEdit({...edit, items: edit.items.map((r,i)=>i===idx?{...r,carat:e.target.value}:r)})}/></td>
                          <td><input className="form-control" value={it.process_type} onChange={(e)=>setEdit({...edit, items: edit.items.map((r,i)=>i===idx?{...r,process_type:e.target.value}:r)})}/></td>
                          <td className="text-end">
                            {edit.items.length>1 && <button type="button" className="btn btn-outline-danger btn-sm" onClick={()=>removeEditItem(idx)}>Remove</button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button type="button" className="btn btn-outline-secondary" onClick={addEditItem}>+ Add Item</button>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={closeEdit}>Cancel</button>
                <button className="btn btn-primary">Save changes</button>
              </div>
            </form>
          </div></div>
        </div>
      )}

      {ret && (
  <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{background:"rgba(0,0,0,.5)"}}>
    <div className="modal-dialog modal-xl"><div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">Return against Jangad #{ret.id}</h5>
        <button type="button" className="btn-close" onClick={closeReturn}></button>
      </div>
      <form onSubmit={saveReturn}>
        <div className="modal-body">
          <div className="row g-2 mb-3">
            <div className="col-md-3">
              <input type="date" className="form-control" value={ret.return_date}
                     onChange={e=>setRet({...ret, return_date:e.target.value})}/>
            </div>
            <div className="col-md-9">
              <input className="form-control" placeholder="Remarks"
                     value={ret.remarks} onChange={e=>setRet({...ret, remarks:e.target.value})}/>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Description</th>
                  <th className="text-end">Issued (Pcs/Carat)</th>
                  <th className="text-end">Returned</th>
                  <th className="text-end">Outstanding</th>
                  <th>Return Now (Pcs)</th>
                  <th>Return Now (Carat)</th>
                  <th>Polished Carat (opt)</th>
                </tr>
              </thead>
              <tbody>
                {ret.items.map((it,idx)=>(
                  <tr key={it.item_id}>
                    <td>{it.desc}</td>
                    <td className="text-end">{it.issued_pcs} / {it.issued_carat}</td>
                    <td className="text-end">{it.returned_pcs} / {it.returned_carat}</td>
                    <td className="text-end fw-semibold">{it.out_pcs} / {it.out_carat}</td>
                    <td style={{maxWidth:120}}>
                      <input type="number" min="0" className="form-control"
                        value={it.pcs}
                        onChange={e=>{
                          const v = e.target.value;
                          setRet(r=>({...r, items:r.items.map((x,i)=>i===idx?{...x, pcs:v}:x)}));
                        }}/>
                    </td>
                    <td style={{maxWidth:140}}>
                      <input type="number" step="0.01" min="0" className="form-control"
                        value={it.carat}
                        onChange={e=>{
                          const v = e.target.value;
                          setRet(r=>({...r, items:r.items.map((x,i)=>i===idx?{...x, carat:v}:x)}));
                        }}/>
                    </td>
                    <td style={{maxWidth:140}}>
                      <input type="number" step="0.01" min="0" className="form-control"
                        value={it.polished_carat}
                        onChange={e=>{
                          const v = e.target.value;
                          setRet(r=>({...r, items:r.items.map((x,i)=>i===idx?{...x, polished_carat:v}:x)}));
                        }}/>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <small className="text-muted">Tip: leave polished carat blank for approval returns; use it for job-work yield.</small>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-outline-secondary" onClick={closeReturn}>Cancel</button>
          <button className="btn btn-success">Save Return</button>
        </div>
      </form>
    </div></div>
  </div>
)}

    </div>
  );
}
