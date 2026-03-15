import { useState, useEffect } from "react";

/* ── Design tokens ─────────────────────────────────────────── */
const M  = "#F5A500";   // mango
const MD = "#F5A50012"; // mango dim
const MB = "#F5A50030"; // mango border
const BG = "#080808";
const S1 = "#111111";
const S2 = "#1A1A1A";
const S3 = "#252525";
const T1 = "#F0F0F0";
const T2 = "#888888";
const T3 = "#3A3A3A";

/* ── SVG icon set ──────────────────────────────────────────── */
const Icon = ({ name, size = 16, color = "currentColor", strokeWidth = 1.5 }) => {
  const paths = {
    wrench:   "M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z",
    zap:      "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    wind:     "M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2",
    hammer:   "M15 12l-8.5 8.5a2.12 2.12 0 01-3-3L12 9m3 3l2-2.5a3.5 3.5 0 00-5-5L10 6m5 6l-6-6",
    clipboard:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    home:     "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
    plus:     "M12 5v14M5 12h14",
    x:        "M18 6L6 18M6 6l12 12",
    moreH:    "M12 13a1 1 0 100-2 1 1 0 000 2zm-7 0a1 1 0 100-2 1 1 0 000 2zm14 0a1 1 0 100-2 1 1 0 000 2z",
    arrow:    "M5 12h14M12 5l7 7-7 7",
    trash:    "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
    check:    "M20 6L9 17l-5-5",
    user:     "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  };
  const catIcons = { Plumbing:"wrench", Electric:"zap", HVAC:"wind", General:"hammer", Other:"clipboard" };
  const d = paths[catIcons[name] || name];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
};

/* ── Data ──────────────────────────────────────────────────── */
const CATS = ["Plumbing","Electric","HVAC","General","Other"];
const KEY  = "joblog_v3";

const load = () => { try { return JSON.parse(localStorage.getItem(KEY)||"null"); } catch { return null; } };
const save = d => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {} };
const init = () => load() || { jobs:[], clients:[] };

const fmtDay = ts => {
  const d = Math.floor((Date.now()-ts)/86400000);
  if (d===0) return "Today";
  if (d===1) return "Yesterday";
  if (d<7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString("en-US",{month:"short",day:"numeric"});
};
const fmtTime = ts => new Date(ts).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});
const initials = n => n.trim().split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);

/* ── Category pill ─────────────────────────────────────────── */
const CatPill = ({ cat, active, onClick }) => (
  <button onClick={onClick} style={{
    display:"flex", alignItems:"center", gap:"5px",
    padding:"5px 11px", borderRadius:"6px", cursor:"pointer",
    border: active ? `1px solid ${MB}` : "1px solid transparent",
    background: active ? MD : S2,
    color: active ? M : T3,
    fontSize:"11px", letterSpacing:".06em", textTransform:"uppercase",
    fontFamily:"'Syne', sans-serif", fontWeight:"600",
    transition:"all .15s ease",
  }}>
    <Icon name={cat} size={12} color={active ? M : T3} strokeWidth={2} />
    {cat}
  </button>
);

/* ── Job card ──────────────────────────────────────────────── */
const JobCard = ({ job, onDelete, onMove, clients, idx }) => {
  const [open, setOpen] = useState(false);
  const client = clients.find(c=>c.id===job.clientId);

  return (
    <div style={{
      background: S1,
      border: `1px solid ${S3}`,
      borderRadius:"12px",
      padding:"15px 16px",
      display:"flex", flexDirection:"column", gap:"8px",
      animation:`slideIn .22s ease both`,
      animationDelay:`${idx*40}ms`,
      position:"relative", overflow:"hidden",
    }}>
      {/* mango top line */}
      <div style={{
        position:"absolute", top:0, left:"16px", right:"16px", height:"1px",
        background:`linear-gradient(90deg, ${M}88, transparent)`,
      }}/>

      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
        <div style={{display:"flex", gap:"8px", alignItems:"center"}}>
          <div style={{
            width:"28px", height:"28px", borderRadius:"7px",
            background: S2, border:`1px solid ${S3}`,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <Icon name={job.category} size={13} color={M} strokeWidth={1.8}/>
          </div>
          <div>
            <div style={{fontSize:"10px", color:T3, fontFamily:"'Syne',sans-serif", fontWeight:"700", letterSpacing:".08em", textTransform:"uppercase"}}>{job.category}</div>
            {client && <div style={{fontSize:"10px", color:M, fontFamily:"'Syne',sans-serif", letterSpacing:".04em"}}>→ {client.name}</div>}
          </div>
        </div>
        <button onClick={()=>setOpen(o=>!o)} style={{
          background:"none", border:"none", color:T3, cursor:"pointer",
          padding:"4px", borderRadius:"6px", display:"flex", alignItems:"center",
          transition:"color .15s",
        }}>
          <Icon name="moreH" size={15} color={open ? T1 : T3}/>
        </button>
      </div>

      <p style={{margin:0, fontSize:"14px", color:T1, fontFamily:"'Lora',Georgia,serif", lineHeight:"1.6", fontWeight:"400"}}>{job.text}</p>

      <div style={{display:"flex", gap:"8px", alignItems:"center"}}>
        <span style={{fontSize:"10px", color:T3, fontFamily:"'Syne',sans-serif", letterSpacing:".04em"}}>
          {fmtDay(job.ts)} · {fmtTime(job.ts)}
        </span>
      </div>

      {open && (
        <div style={{display:"flex", gap:"7px", flexWrap:"wrap", paddingTop:"4px", borderTop:`1px solid ${S3}`, animation:"slideIn .15s ease"}}>
          {!job.clientId && onMove && (
            <button onClick={()=>{onMove(job.id);setOpen(false);}} style={actionBtn(M, MB)}>
              <Icon name="arrow" size={12} color={M}/> Assign to client
            </button>
          )}
          <button onClick={()=>onDelete(job.id)} style={actionBtn("#EF4444","#EF444430")}>
            <Icon name="trash" size={12} color="#EF4444"/> Delete
          </button>
          <button onClick={()=>setOpen(false)} style={actionBtn(T3,S3)}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

const actionBtn = (color, border) => ({
  display:"flex", alignItems:"center", gap:"5px",
  background:"transparent", border:`1px solid ${border}`,
  color, borderRadius:"7px", padding:"6px 12px",
  fontSize:"11px", cursor:"pointer",
  fontFamily:"'Syne',sans-serif", fontWeight:"600", letterSpacing:".05em",
});

/* ── Add Job Form ──────────────────────────────────────────── */
const AddJobForm = ({ onAdd, onCancel, placeholder }) => {
  const [text, setText] = useState("");
  const [cat,  setCat]  = useState("General");

  const submit = () => {
    if (!text.trim()) return;
    onAdd({ text: text.trim(), category: cat });
    setText(""); setCat("General");
  };

  return (
    <div style={{
      background:S1, border:`1px solid ${MB}`,
      borderRadius:"14px", padding:"18px",
      display:"flex", flexDirection:"column", gap:"14px",
      animation:"fadeUp .2s ease", marginBottom:"16px",
    }}>
      <textarea autoFocus
        placeholder={placeholder || "Describe the job…"}
        value={text} onChange={e=>setText(e.target.value)}
        onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submit();} }}
        rows={3} style={{
          background:"transparent", border:"none", color:T1,
          fontSize:"15px", fontFamily:"'Lora',serif",
          resize:"none", padding:0, lineHeight:"1.6",
        }}/>

      <div style={{display:"flex", gap:"6px", flexWrap:"wrap"}}>
        {CATS.map(c=><CatPill key={c} cat={c} active={cat===c} onClick={()=>setCat(c)}/>)}
      </div>

      <div style={{display:"flex", gap:"8px"}}>
        <button onClick={submit} style={{
          flex:1, background:M, color:"#000", border:"none",
          borderRadius:"9px", padding:"12px",
          fontSize:"13px", fontWeight:"700", cursor:"pointer",
          fontFamily:"'Syne',sans-serif", letterSpacing:".06em",
          display:"flex", alignItems:"center", justifyContent:"center", gap:"7px",
        }}><Icon name="check" size={14} color="#000" strokeWidth={2.5}/> LOG JOB</button>
        <button onClick={onCancel} style={{
          background:"transparent", border:`1px solid ${S3}`,
          color:T3, borderRadius:"9px", padding:"12px 15px",
          fontSize:"13px", cursor:"pointer", display:"flex", alignItems:"center",
        }}><Icon name="x" size={15} color={T3}/></button>
      </div>
    </div>
  );
};

/* ── Day divider ───────────────────────────────────────────── */
const DayDivider = ({ label, count }) => (
  <div style={{
    display:"flex", alignItems:"center", gap:"10px",
    marginBottom:"10px",
  }}>
    <span style={{
      fontSize:"10px", color:T3, fontFamily:"'Syne',sans-serif",
      fontWeight:"700", letterSpacing:".12em", textTransform:"uppercase",
      whiteSpace:"nowrap",
    }}>{label}</span>
    <div style={{flex:1, height:"1px", background:S2}}/>
    <span style={{
      fontSize:"10px", color:T3, fontFamily:"'Syne',sans-serif",
      fontWeight:"600", letterSpacing:".06em",
    }}>{count}</span>
  </div>
);

/* ── Client view ───────────────────────────────────────────── */
const ClientView = ({ client, jobs, onDeleteJob, onDeleteClient, onAddJob }) => {
  const [adding,  setAdding]  = useState(false);
  const [confirm, setConfirm] = useState(false);
  const cJobs = jobs.filter(j=>j.clientId===client.id);

  return (
    <div style={{padding:"18px 16px 100px"}}>
      {/* Client header */}
      <div style={{
        display:"flex", justifyContent:"space-between", alignItems:"center",
        marginBottom:"22px",
      }}>
        <div style={{display:"flex", alignItems:"center", gap:"13px"}}>
          <div style={{
            width:"46px", height:"46px", borderRadius:"12px",
            background: MD, border:`1px solid ${MB}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"15px", fontWeight:"800", color:M,
            fontFamily:"'Syne',sans-serif", letterSpacing:"-.01em",
          }}>{initials(client.name)}</div>
          <div>
            <div style={{fontSize:"18px", fontWeight:"800", color:T1, fontFamily:"'Syne',sans-serif", letterSpacing:"-.03em"}}>{client.name}</div>
            <div style={{fontSize:"10px", color:T3, fontFamily:"'Syne',sans-serif", letterSpacing:".06em", textTransform:"uppercase"}}>
              {cJobs.length} job{cJobs.length!==1?"s":""} · outstanding
            </div>
          </div>
        </div>
        <button onClick={()=>setConfirm(true)} style={{
          background:"transparent", border:`1px solid ${S3}`,
          color:T3, borderRadius:"8px", padding:"8px 12px",
          fontSize:"11px", cursor:"pointer",
          fontFamily:"'Syne',sans-serif", fontWeight:"600", letterSpacing:".06em",
        }}>CLOSE TAB</button>
      </div>

      {confirm && (
        <div style={{
          background:"#120808", border:"1px solid #EF444430",
          borderRadius:"12px", padding:"16px", marginBottom:"16px",
          animation:"slideIn .2s ease",
        }}>
          <p style={{margin:"0 0 14px", fontSize:"13px", color:"#EF9090", fontFamily:"'Lora',serif", lineHeight:"1.5"}}>
            Delete <strong>{client.name}</strong> and all {cJobs.length} job{cJobs.length!==1?"s":""}? This cannot be undone.
          </p>
          <div style={{display:"flex", gap:"8px"}}>
            <button onClick={()=>onDeleteClient(client.id)} style={actionBtn("#EF4444","#EF444430")}>
              <Icon name="trash" size={12} color="#EF4444"/> Confirm delete
            </button>
            <button onClick={()=>setConfirm(false)} style={actionBtn(T3,S3)}>Cancel</button>
          </div>
        </div>
      )}

      {adding ? (
        <AddJobForm
          placeholder={`What did you do for ${client.name}?`}
          onAdd={({text,category})=>{ onAddJob({text,category,clientId:client.id}); setAdding(false); }}
          onCancel={()=>setAdding(false)}
        />
      ) : (
        <button onClick={()=>setAdding(true)} style={{
          width:"100%", background:"transparent",
          border:`1px dashed ${S3}`, color:T3,
          borderRadius:"11px", padding:"13px",
          fontSize:"11px", cursor:"pointer",
          fontFamily:"'Syne',sans-serif", fontWeight:"700", letterSpacing:".1em",
          textTransform:"uppercase", marginBottom:"16px",
          display:"flex", alignItems:"center", justifyContent:"center", gap:"7px",
          transition:"all .15s ease",
        }}>
          <Icon name="plus" size={13} color={T3}/> Add job
        </button>
      )}

      {cJobs.length===0 ? (
        <div style={{textAlign:"center", padding:"50px 0", color:T3}}>
          <div style={{marginBottom:"10px", opacity:.3}}>
            <Icon name="user" size={36} color={T3} strokeWidth={1}/>
          </div>
          <p style={{fontFamily:"'Syne',sans-serif", fontSize:"11px", letterSpacing:".08em", textTransform:"uppercase"}}>No jobs logged yet</p>
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
          {cJobs.map((j,i)=>(
            <JobCard key={j.id} job={j} onDelete={onDeleteJob} clients={[client]} idx={i}/>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Tab button ────────────────────────────────────────────── */
const TabBtn = ({ active, onClick, children, badge }) => (
  <button onClick={onClick} style={{
    flexShrink:0,
    display:"flex", flexDirection:"column", alignItems:"center",
    gap:"4px", padding:"7px 13px", borderRadius:"10px", cursor:"pointer",
    border: active ? `1px solid ${MB}` : "1px solid transparent",
    background: active ? MD : "transparent",
    position:"relative", minWidth:"52px",
    transition:"all .15s ease",
  }}>
    {children}
    {badge > 0 && (
      <span style={{
        position:"absolute", top:"4px", right:"6px",
        background: badge === "home" ? M : "#EF4444",
        color: badge === "home" ? "#000" : "#fff",
        borderRadius:"50%", fontSize:"8px",
        width:"13px", height:"13px",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontWeight:"800", fontFamily:"'Syne',sans-serif",
      }}>{badge>9?"9+":badge}</span>
    )}
  </button>
);

/* ── App ───────────────────────────────────────────────────── */
export default function App() {
  const [data,           setData]          = useState(init);
  const [tab,            setTab]           = useState("home");
  const [adding,         setAdding]        = useState(false);
  const [moveModal,      setMoveModal]     = useState(null);
  const [showAddClient,  setShowAddClient] = useState(false);
  const [newClientName,  setNewClientName] = useState("");

  useEffect(()=>{ save(data); },[data]);

  const addJob = ({text, category, clientId=null}) => {
    setData(d=>({...d, jobs:[{id:Date.now()+Math.random(),text,category,clientId,ts:Date.now()},...d.jobs]}));
  };
  const deleteJob    = id  => setData(d=>({...d, jobs:d.jobs.filter(j=>j.id!==id)}));
  const deleteClient = cid => { setData(d=>({clients:d.clients.filter(c=>c.id!==cid),jobs:d.jobs.filter(j=>j.clientId!==cid)})); setTab("home"); };
  const moveJob      = (jid, cid) => { setData(d=>({...d,jobs:d.jobs.map(j=>j.id===jid?{...j,clientId:cid}:j)})); setMoveModal(null); };

  const addClient = () => {
    if (!newClientName.trim()) return;
    const c = {id:Date.now(), name:newClientName.trim()};
    setData(d=>({...d, clients:[...d.clients,c]}));
    setNewClientName(""); setShowAddClient(false);
    setTab(String(c.id));
  };

  const homeJobs     = data.jobs.filter(j=>!j.clientId);
  const activeClient = data.clients.find(c=>String(c.id)===tab);

  const grouped = homeJobs.reduce((acc,job)=>{
    const k = fmtDay(job.ts);
    if (!acc[k]) acc[k]=[];
    acc[k].push(job);
    return acc;
  },{});

  return (
    <div style={{minHeight:"100vh", background:BG, color:T1, fontFamily:"'Syne',sans-serif", maxWidth:"480px", margin:"0 auto"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Lora:ital,wght@0,400;1,400&display=swap');
        * { box-sizing:border-box; }
        body { margin:0; background:${BG}; }
        textarea, input { outline:none; }
        ::-webkit-scrollbar { display:none; }
        @keyframes slideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        button:active { opacity:.75; }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        padding:"28px 20px 16px",
        borderBottom:`1px solid ${S2}`,
        position:"sticky", top:0, background:BG, zIndex:20,
        display:"flex", justifyContent:"space-between", alignItems:"center",
      }}>
        <div>
          <div style={{display:"flex", alignItems:"baseline", gap:"2px"}}>
            <span style={{fontSize:"22px", fontWeight:"800", letterSpacing:"-.04em", color:T1}}>JOB</span>
            <span style={{fontSize:"22px", fontWeight:"800", letterSpacing:"-.04em", color:M}}>LOG</span>
          </div>
          <div style={{fontSize:"10px", color:T3, letterSpacing:".1em", textTransform:"uppercase", marginTop:"2px"}}>
            {homeJobs.length} pending · {data.clients.length} client{data.clients.length!==1?"s":""}
          </div>
        </div>
        {tab==="home" && !adding && (
          <button onClick={()=>setAdding(true)} style={{
            width:"40px", height:"40px", borderRadius:"10px",
            background:M, border:"none", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:`0 0 20px ${M}33`,
          }}>
            <Icon name="plus" size={18} color="#000" strokeWidth={2.5}/>
          </button>
        )}
      </div>

      {/* ── Home ── */}
      {tab==="home" && (
        <div style={{padding:"16px 16px", paddingBottom:"100px"}}>
          {adding && (
            <AddJobForm onAdd={({text,category})=>{addJob({text,category});setAdding(false);}} onCancel={()=>setAdding(false)}/>
          )}

          {/* Assign to client modal */}
          {moveModal && (
            <div style={{
              background:S1, border:`1px solid ${MB}`,
              borderRadius:"13px", padding:"16px", marginBottom:"16px",
              animation:"fadeUp .2s ease",
            }}>
              <div style={{fontSize:"10px", color:T3, letterSpacing:".1em", textTransform:"uppercase", marginBottom:"12px", fontWeight:"700"}}>
                Assign job to client
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:"6px",marginBottom:"12px"}}>
                {data.clients.map(c=>(
                  <button key={c.id} onClick={()=>moveJob(moveModal,c.id)} style={{
                    background:MD, border:`1px solid ${MB}`, color:M,
                    borderRadius:"9px", padding:"11px 14px",
                    display:"flex", alignItems:"center", gap:"10px",
                    fontSize:"13px", cursor:"pointer", textAlign:"left",
                    fontFamily:"'Syne',sans-serif", fontWeight:"700",
                  }}>
                    <div style={{
                      width:"28px", height:"28px", borderRadius:"7px",
                      background:MD, border:`1px solid ${MB}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:"11px", fontWeight:"800", color:M,
                    }}>{initials(c.name)}</div>
                    {c.name}
                  </button>
                ))}
                {data.clients.length===0 && (
                  <p style={{color:T3, fontSize:"12px", fontFamily:"'Lora',serif", margin:0, fontStyle:"italic"}}>
                    No clients yet — add one below first.
                  </p>
                )}
              </div>
              <button onClick={()=>setMoveModal(null)} style={actionBtn(T3,S3)}>Cancel</button>
            </div>
          )}

          {homeJobs.length===0&&!adding ? (
            <div style={{textAlign:"center", padding:"80px 0"}}>
              <div style={{margin:"0 auto 14px", opacity:.15, display:"flex", justifyContent:"center"}}>
                <Icon name="wrench" size={40} color={T1} strokeWidth={1}/>
              </div>
              <p style={{fontFamily:"'Syne',sans-serif", fontSize:"11px", color:T3, letterSpacing:".1em", textTransform:"uppercase"}}>
                Nothing logged yet
              </p>
            </div>
          ) : (
            Object.entries(grouped).map(([day,dayJobs])=>(
              <div key={day} style={{marginBottom:"24px"}}>
                <DayDivider label={day} count={dayJobs.length}/>
                <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                  {dayJobs.map((j,i)=>(
                    <JobCard key={j.id} job={j} onDelete={deleteJob} onMove={setMoveModal} clients={data.clients} idx={i}/>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Client view ── */}
      {activeClient && (
        <ClientView
          client={activeClient}
          jobs={data.jobs}
          onDeleteJob={deleteJob}
          onDeleteClient={deleteClient}
          onAddJob={addJob}
        />
      )}

      {/* ── Bottom tab bar ── */}
      <div style={{
        position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"100%", maxWidth:"480px",
        background:"#0C0C0C",
        borderTop:`1px solid ${S2}`,
        display:"flex", alignItems:"center",
        padding:"8px 10px 18px", gap:"4px",
        zIndex:30, overflowX:"auto",
      }}>
        {/* Home */}
        <TabBtn active={tab==="home"} onClick={()=>setTab("home")} badge={homeJobs.length > 0 ? homeJobs.length : 0}>
          <Icon name="home" size={18} color={tab==="home" ? M : T3} strokeWidth={1.8}/>
          <span style={{fontSize:"9px", fontWeight:"700", letterSpacing:".07em", color:tab==="home"?M:T3, textTransform:"uppercase"}}>Home</span>
        </TabBtn>

        {data.clients.length>0 && (
          <div style={{width:"1px", height:"28px", background:S2, flexShrink:0, margin:"0 2px"}}/>
        )}

        {/* Client tabs */}
        {data.clients.map(client=>{
          const count = data.jobs.filter(j=>j.clientId===client.id).length;
          const active = tab===String(client.id);
          return (
            <TabBtn key={client.id} active={active} onClick={()=>setTab(String(client.id))} badge={count}>
              <div style={{
                width:"28px", height:"28px", borderRadius:"8px",
                background: active ? MD : S2,
                border:`1px solid ${active ? MB : S3}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"10px", fontWeight:"800",
                color: active ? M : T3,
              }}>{initials(client.name)}</div>
              <span style={{
                fontSize:"9px", fontWeight:"700", letterSpacing:".06em",
                color: active ? M : T3, textTransform:"uppercase",
                maxWidth:"52px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
              }}>{client.name.split(" ")[0]}</span>
            </TabBtn>
          );
        })}

        {/* Add client */}
        {!showAddClient ? (
          <TabBtn active={false} onClick={()=>setShowAddClient(true)}>
            <div style={{
              width:"28px", height:"28px", borderRadius:"8px",
              border:`1px dashed ${S3}`,
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <Icon name="user" size={13} color={T3} strokeWidth={1.8}/>
            </div>
            <span style={{fontSize:"9px", fontWeight:"700", letterSpacing:".06em", color:T3, textTransform:"uppercase"}}>Client</span>
          </TabBtn>
        ) : (
          <div style={{
            display:"flex", gap:"6px", alignItems:"center",
            background:S1, border:`1px solid ${MB}`,
            borderRadius:"10px", padding:"7px 11px",
            animation:"fadeUp .15s ease",
          }}>
            <input autoFocus placeholder="Name…"
              value={newClientName} onChange={e=>setNewClientName(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter")addClient(); if(e.key==="Escape"){setShowAddClient(false);setNewClientName("");} }}
              style={{
                background:"transparent", border:"none", color:M,
                fontSize:"13px", fontFamily:"'Syne',sans-serif", fontWeight:"700", width:"80px",
              }}/>
            <button onClick={addClient} style={{
              background:M, color:"#000", border:"none",
              borderRadius:"6px", padding:"5px 9px",
              display:"flex", alignItems:"center",
            }}><Icon name="check" size={12} color="#000" strokeWidth={2.5}/></button>
            <button onClick={()=>{setShowAddClient(false);setNewClientName("");}} style={{
              background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center",
            }}><Icon name="x" size={14} color={T3}/></button>
          </div>
        )}
      </div>
    </div>
  );
}
