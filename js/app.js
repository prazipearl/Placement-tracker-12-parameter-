/* ============================================================
   STATE
   ============================================================ */

const STORAGE_KEY = "readiness_tracker_state_v1";

function defaultState() {
  const paramState = {};
  PARAMETERS.forEach(p => {
    if (p.subtracks) {
      const sub = {};
      p.subtracks.forEach(s => {
        sub[s.key] = s.mode === "multi" ? { selected: [], evidence: "", status: "none" }
                                          : { selected: null, evidence: "", status: "none" };
      });
      paramState[p.id] = { subtracks: sub, notes: "" };
    } else {
      paramState[p.id] = p.mode === "multi"
        ? { selected: [], evidence: "", status: "none", notes: "" }
        : { selected: null, evidence: "", status: "none", notes: "" };
    }
  });

  return {
    batch: "2025-29",
    parameters: paramState,
    activities: [],
    profiles: [
      { platform: "LeetCode", handle: "", solved: "", rating: "", lastUpdated: "" },
      { platform: "Codeforces", handle: "", solved: "", rating: "", lastUpdated: "" },
      { platform: "CodeChef", handle: "", solved: "", rating: "", lastUpdated: "" },
      { platform: "AtCoder", handle: "", solved: "", rating: "", lastUpdated: "" },
    ],
  };
}

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    // merge with default in case new parameters were added later
    const def = defaultState();
    return { ...def, ...parsed, parameters: { ...def.parameters, ...parsed.parameters } };
  } catch (e) {
    console.error("Failed to load state, starting fresh.", e);
    return defaultState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Storage error", e);
    alert("Couldn't save — your browser storage might be full or blocked.");
  }
}

/* ============================================================
   SCORING
   ============================================================ */

function sumMilestones(milestones, selectedMarks, cap) {
  const total = selectedMarks.reduce((acc, m) => acc + m, 0);
  return Math.min(total, cap);
}

function getParamMark(param) {
  const ps = state.parameters[param.id];
  if (param.subtracks) {
    return param.subtracks.reduce((acc, s) => {
      const subState = ps.subtracks[s.key];
      if (s.mode === "multi") {
        return acc + sumMilestones(s.milestones, subState.selected, s.cap);
      }
      return acc + (subState.selected !== null ? subState.selected : 0);
    }, 0);
  }
  if (param.mode === "multi") {
    return sumMilestones(param.milestones, ps.selected, param.maxMarks);
  }
  return ps.selected !== null ? ps.selected : 0;
}

function getParamStatus(param) {
  const ps = state.parameters[param.id];
  if (param.subtracks) {
    const any = param.subtracks.some(s => {
      const sub = ps.subtracks[s.key];
      return s.mode === "multi" ? sub.selected.length > 0 : sub.selected !== null;
    });
    if (!any) return "none";
    const allHaveEvidence = param.subtracks.every(s => {
      const sub = ps.subtracks[s.key];
      const touched = s.mode === "multi" ? sub.selected.length > 0 : sub.selected !== null;
      return !touched || sub.evidence.trim() !== "";
    });
    return allHaveEvidence ? "verified" : "pending";
  }
  const touched = param.mode === "multi" ? ps.selected.length > 0 : ps.selected !== null;
  if (!touched) return "none";
  return ps.evidence.trim() !== "" ? "verified" : "pending";
}

function getTotalScore() {
  return PARAMETERS.reduce((acc, p) => acc + getParamMark(p), 0);
}

function getParam8Mark() {
  return getParamMark(PARAMETERS.find(p => p.id === 8));
}

function getGateCoreMark() {
  const p9 = PARAMETERS.find(p => p.id === 9);
  const ps = state.parameters[9];
  const coreSub = p9.subtracks.find(s => s.key === "gateCore");
  return ps.subtracks.gateCore.selected !== null ? ps.subtracks.gateCore.selected : 0;
}

/* ============================================================
   NAVIGATION
   ============================================================ */

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("view-" + btn.dataset.view).classList.add("active");
    if (btn.dataset.view === "passport") renderPassport();
  });
});

/* ============================================================
   RENDER: DASHBOARD + PARAMETERS LIST
   ============================================================ */

function renderAll() {
  renderHero();
  renderParamList("dashboardParamList");
  renderParamList("parametersFullList");
  renderActivities();
  renderProfiles();
}

function renderHero() {
  const total = getTotalScore();
  const coding = getParam8Mark();
  const gateCore = getGateCoreMark();
  const result = calculatePlacementLevel(total, coding, gateCore, state.batch);

  document.getElementById("heroScore").innerHTML = `${total}<sup>/ 250</sup>`;
  document.getElementById("heroLevel").textContent = result.pkg ? `${result.name} · ${result.pkg}` : result.name;

  const warningEl = document.getElementById("heroWarning");
  if (result.blockedReason) {
    warningEl.style.display = "block";
    warningEl.textContent = result.blockedReason;
  } else {
    warningEl.style.display = "none";
  }

  document.getElementById("chipCoding").textContent = coding;
  document.getElementById("chipGate").textContent = gateCore;
  const activeCount = PARAMETERS.filter(p => getParamStatus(p) !== "none").length;
  document.getElementById("chipActive").textContent = activeCount;
}

function renderParamList(containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  PARAMETERS.forEach(param => {
    const mark = getParamMark(param);
    const status = getParamStatus(param);
    const pct = Math.min(100, (mark / param.maxMarks) * 100);

    const row = document.createElement("div");
    row.className = `param-row status-${status}`;
    row.innerHTML = `
      <div class="param-row-top">
        <div class="name"><span class="idx">${param.id}.</span>${param.name}</div>
        <div class="param-mark">${mark} / ${param.maxMarks}</div>
      </div>
      <div class="param-progress"><div class="param-progress-fill" style="width:${pct}%"></div></div>
      <div class="param-sub">
        <span class="status-pill ${status}">${status === "none" ? "Not started" : status}</span>
      </div>
    `;
    row.addEventListener("click", () => openParamModal(param));
    container.appendChild(row);
  });
}

/* ============================================================
   PARAMETER MODAL
   ============================================================ */

const paramModalBackdrop = document.getElementById("paramModalBackdrop");
const paramModalContent = document.getElementById("paramModalContent");

function milestoneOptionHtml(milestone, idx, checked, inputType, name) {
  return `
    <label class="milestone-option ${checked ? "selected" : ""}">
      <input type="${inputType}" name="${name}" value="${idx}" ${checked ? "checked" : ""} />
      <span class="mlabel">${milestone.label}</span>
      <span class="mmark">+${milestone.mark}</span>
    </label>
  `;
}

function renderSingleTrack(milestones, selectedIdxOrMark, name) {
  // selected stores the MARK value (not index) for single mode, to keep things simple
  return milestones.map((m, idx) => milestoneOptionHtml(m, idx, selectedIdxOrMark === m.mark, "radio", name)).join("");
}

function renderMultiTrack(milestones, selectedMarks, name) {
  return milestones.map((m, idx) =>
    milestoneOptionHtml(m, idx, selectedMarks.includes(m.mark), "checkbox", name)
  ).join("");
}

function openParamModal(param) {
  const ps = state.parameters[param.id];

  let bodyHtml = `
    <h2>${param.id}. ${param.name}</h2>
    <div class="max">Max ${param.maxMarks} marks · ${param.evidenceHint}</div>
    ${param.note ? `<div class="note">${param.note}</div>` : ""}
  `;

  if (param.subtracks) {
    param.subtracks.forEach(sub => {
      const subState = ps.subtracks[sub.key];
      bodyHtml += `<div class="subtrack-label">${sub.label} (max ${sub.cap})</div>`;
      bodyHtml += `<div class="milestone-group" data-subtrack="${sub.key}">`;
      bodyHtml += sub.mode === "multi"
        ? renderMultiTrack(sub.milestones, subState.selected, `sub-${sub.key}`)
        : renderSingleTrack(sub.milestones, subState.selected, `sub-${sub.key}`);
      bodyHtml += `</div>`;
      bodyHtml += `
        <div class="field-group">
          <label>Evidence link — ${sub.label}</label>
          <input type="text" data-evidence-sub="${sub.key}" value="${subState.evidence}" placeholder="https://..." />
        </div>
      `;
    });
  } else {
    bodyHtml += `<div class="milestone-group" data-subtrack="main">`;
    bodyHtml += param.mode === "multi"
      ? renderMultiTrack(param.milestones, ps.selected, "main")
      : renderSingleTrack(param.milestones, ps.selected, "main");
    bodyHtml += `</div>`;
      bodyHtml += `<button type="button" class="btn-danger-ghost clear-group-btn" data-clear-group="main">Clear this selection</button>`;
    bodyHtml += `
      <div class="field-group">
        <label>Evidence link</label>
        <input type="text" id="mainEvidence" value="${ps.evidence}" placeholder="https://..." />
      </div>
    `;
  }

  bodyHtml += `
    <div class="field-group">
      <label>Notes (optional)</label>
      <textarea id="paramNotes" rows="2" placeholder="Any context for your mentor">${ps.notes || ""}</textarea>
    </div>
    <div class="modal-actions">
      <button class="btn-ghost" id="paramModalClose">Cancel</button>
      <button class="btn-primary" id="paramModalSave">Save</button>
    </div>
  `;

  paramModalContent.innerHTML = bodyHtml;
  paramModalBackdrop.classList.add("active");

  // click-to-check styling
  paramModalContent.querySelectorAll(".milestone-option").forEach(opt => {
    opt.addEventListener("click", (e) => {
      const input = opt.querySelector("input");
      if (input.type === "radio") {
        opt.closest(".milestone-group").querySelectorAll(".milestone-option").forEach(o => o.classList.remove("selected"));
        opt.classList.add("selected");
      } else {
        if (e.target !== input) input.checked = !input.checked;
        opt.classList.toggle("selected", input.checked);
      }
    });
  });

  document.getElementById("paramModalClose").addEventListener("click", closeParamModal);
    paramModalContent.querySelectorAll(".clear-group-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const groupKey = btn.dataset.clearGroup;
      const group = paramModalContent.querySelector(`[data-subtrack="${groupKey}"]`);
      group.querySelectorAll("input").forEach(inp => { inp.checked = false; });
      group.querySelectorAll(".milestone-option").forEach(opt => opt.classList.remove("selected"));
    });
  });

  document.getElementById("paramModalSave").addEventListener("click", () => {
    saveParamModal(param);
  });
}

function closeParamModal() {
  paramModalBackdrop.classList.remove("active");
}
paramModalBackdrop.addEventListener("click", (e) => {
  if (e.target === paramModalBackdrop) closeParamModal();
});

function saveParamModal(param) {
  const ps = state.parameters[param.id];

  function readGroup(groupSelector, milestones, mode) {
    const group = paramModalContent.querySelector(groupSelector);
    const checked = [...group.querySelectorAll("input:checked")];
    if (mode === "multi") {
      return checked.map(inp => milestones[parseInt(inp.value)].mark);
    }
    return checked.length ? milestones[parseInt(checked[0].value)].mark : null;
  }

  if (param.subtracks) {
    param.subtracks.forEach(sub => {
      const val = readGroup(`[data-subtrack="${sub.key}"]`, sub.milestones, sub.mode);
      ps.subtracks[sub.key].selected = val;
      const evInput = paramModalContent.querySelector(`[data-evidence-sub="${sub.key}"]`);
      ps.subtracks[sub.key].evidence = evInput.value.trim();
    });
  } else {
    const val = readGroup(`[data-subtrack="main"]`, param.milestones, param.mode);
    ps.selected = val;
    ps.evidence = document.getElementById("mainEvidence").value.trim();
  }

  ps.notes = document.getElementById("paramNotes").value.trim();

  saveState();
  closeParamModal();
  renderAll();
}

/* ============================================================
   ACTIVITIES
   ============================================================ */

const ACTIVITY_TYPES = ["Job Application", "Certification", "Internship", "Open Source PR", "Hackathon", "Course", "Other"];
const ACTIVITY_STATUSES = ["Not Started", "In Progress", "Under Review", "Completed", "Dropped"];

function renderActivities() {
  const list = document.getElementById("activityList");
  list.innerHTML = "";

  if (state.activities.length === 0) {
    list.innerHTML = `<div class="empty-state"><h3>Nothing tracked yet</h3><p>Add a certification, internship, PR, or application to keep it all in one place.</p></div>`;
    return;
  }

  state.activities.forEach((act, idx) => {
    const card = document.createElement("div");
    card.className = "activity-card";
    card.innerHTML = `
      <div class="activity-main">
        <span class="type-tag">${act.type}</span>
        <div class="title">${act.title}</div>
        <div class="meta">${act.status} ${act.targetDate ? "· due " + act.targetDate : ""} ${act.link ? `· <a href="${act.link}" target="_blank" rel="noopener">link</a>` : ""}</div>
      </div>
      <div>
        <button class="icon-btn" data-edit="${idx}">Edit</button>
        <button class="icon-btn" data-delete="${idx}">Delete</button>
      </div>
    `;
    list.appendChild(card);
  });

  list.querySelectorAll("[data-edit]").forEach(btn => {
    btn.addEventListener("click", () => openActivityModal(parseInt(btn.dataset.edit)));
  });
  list.querySelectorAll("[data-delete]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (confirm("Delete this activity?")) {
        state.activities.splice(parseInt(btn.dataset.delete), 1);
        saveState();
        renderActivities();
      }
    });
  });
}

document.getElementById("addActivityBtn").addEventListener("click", () => openActivityModal(null));

const activityModalBackdrop = document.getElementById("activityModalBackdrop");
const activityModalContent = document.getElementById("activityModalContent");

function openActivityModal(editIdx) {
  const isEdit = editIdx !== null;
  const act = isEdit ? state.activities[editIdx] : {
    type: ACTIVITY_TYPES[0], title: "", status: ACTIVITY_STATUSES[0],
    startDate: "", targetDate: "", link: "", notes: "",
  };

  activityModalContent.innerHTML = `
    <h2>${isEdit ? "Edit" : "Add"} activity</h2>
    <div class="field-group">
      <label>Type</label>
      <select id="actType">${ACTIVITY_TYPES.map(t => `<option ${t === act.type ? "selected" : ""}>${t}</option>`).join("")}</select>
    </div>
    <div class="field-group">
      <label>Title</label>
      <input type="text" id="actTitle" value="${act.title}" placeholder="e.g. AWS Cloud Practitioner" />
    </div>
    <div class="field-group">
      <label>Status</label>
      <select id="actStatus">${ACTIVITY_STATUSES.map(s => `<option ${s === act.status ? "selected" : ""}>${s}</option>`).join("")}</select>
    </div>
    <div class="field-group">
      <label>Start date</label>
      <input type="date" id="actStart" value="${act.startDate}" />
    </div>
    <div class="field-group">
      <label>Target / deadline date</label>
      <input type="date" id="actTarget" value="${act.targetDate}" />
    </div>
    <div class="field-group">
      <label>Link</label>
      <input type="text" id="actLink" value="${act.link}" placeholder="https://..." />
    </div>
    <div class="field-group">
      <label>Notes</label>
      <textarea id="actNotes" rows="2">${act.notes}</textarea>
    </div>
    <div class="modal-actions">
      <button class="btn-ghost" id="actCancel">Cancel</button>
      <button class="btn-primary" id="actSave">${isEdit ? "Save changes" : "Add activity"}</button>
    </div>
  `;

  activityModalBackdrop.classList.add("active");
  document.getElementById("actCancel").addEventListener("click", () => activityModalBackdrop.classList.remove("active"));

  document.getElementById("actSave").addEventListener("click", () => {
    const newAct = {
      type: document.getElementById("actType").value,
      title: document.getElementById("actTitle").value.trim(),
      status: document.getElementById("actStatus").value,
      startDate: document.getElementById("actStart").value,
      targetDate: document.getElementById("actTarget").value,
      link: document.getElementById("actLink").value.trim(),
      notes: document.getElementById("actNotes").value.trim(),
    };
    if (!newAct.title) { alert("Please give it a title."); return; }

    if (isEdit) state.activities[editIdx] = newAct;
    else state.activities.push(newAct);

    saveState();
    activityModalBackdrop.classList.remove("active");
    renderActivities();
  });
}
activityModalBackdrop.addEventListener("click", (e) => {
  if (e.target === activityModalBackdrop) activityModalBackdrop.classList.remove("active");
});

/* ============================================================
   CODING PROFILES (manual entry)
   ============================================================ */

function renderProfiles() {
  const list = document.getElementById("profileList");
  list.innerHTML = "";

  state.profiles.forEach((p, idx) => {
    const card = document.createElement("div");
    card.className = "profile-card";
    card.innerHTML = `
      <div>
        <div class="platform">${p.platform}</div>
        <div class="stats">${p.handle ? "@" + p.handle : "No handle yet"} ${p.rating ? "· rating " + p.rating : ""} ${p.solved ? "· " + p.solved + " solved" : ""}</div>
      </div>
      <button class="icon-btn" data-editp="${idx}">Edit</button>
    `;
    list.appendChild(card);
  });

  list.querySelectorAll("[data-editp]").forEach(btn => {
    btn.addEventListener("click", () => openProfileEdit(parseInt(btn.dataset.editp)));
  });
}

function openProfileEdit(idx) {
  const p = state.profiles[idx];
  activityModalContent.innerHTML = `
    <h2>${p.platform} profile</h2>
    <div class="field-group"><label>Handle / username</label><input type="text" id="pfHandle" value="${p.handle}" /></div>
    <div class="field-group"><label>Problems solved</label><input type="text" id="pfSolved" value="${p.solved}" /></div>
    <div class="field-group"><label>Rating</label><input type="text" id="pfRating" value="${p.rating}" /></div>
    <div class="field-group"><label>Last updated</label><input type="date" id="pfDate" value="${p.lastUpdated}" /></div>
    <div class="modal-actions">
      <button class="btn-ghost" id="pfCancel">Cancel</button>
      <button class="btn-primary" id="pfSave">Save</button>
    </div>
  `;
  activityModalBackdrop.classList.add("active");
  document.getElementById("pfCancel").addEventListener("click", () => activityModalBackdrop.classList.remove("active"));
  document.getElementById("pfSave").addEventListener("click", () => {
    state.profiles[idx] = {
      ...p,
      handle: document.getElementById("pfHandle").value.trim(),
      solved: document.getElementById("pfSolved").value.trim(),
      rating: document.getElementById("pfRating").value.trim(),
      lastUpdated: document.getElementById("pfDate").value,
    };
    saveState();
    activityModalBackdrop.classList.remove("active");
    renderProfiles();
  });
}

/* ============================================================
   PASSPORT VIEW
   ============================================================ */

function renderPassport() {
  const body = document.getElementById("passportBody");
  body.innerHTML = "";

  PARAMETERS.forEach(param => {
    const mark = getParamMark(param);
    const status = getParamStatus(param);
    const ps = state.parameters[param.id];
    let evidence = "";
    if (param.subtracks) {
      evidence = param.subtracks.map(s => ps.subtracks[s.key].evidence).filter(Boolean).join(", ") || "—";
    } else {
      evidence = ps.evidence || "—";
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${param.id}</td>
      <td>${param.name}</td>
      <td>${param.maxMarks}</td>
      <td>${mark}</td>
      <td style="max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${evidence}</td>
      <td><span class="status-pill ${status}">${status === "none" ? "Not started" : status}</span></td>
    `;
    body.appendChild(row);
  });

  const totalRow = document.createElement("tr");
  totalRow.innerHTML = `<td></td><td><b>Total</b></td><td><b>250</b></td><td><b>${getTotalScore()}</b></td><td></td><td></td>`;
  body.appendChild(totalRow);
}

document.getElementById("exportPdfBtn").addEventListener("click", () => {
  let text = `ACHIEVEMENT PASSPORT — ${new Date().toLocaleDateString()}\n\n`;
  PARAMETERS.forEach(param => {
    text += `${param.id}. ${param.name}: ${getParamMark(param)} / ${param.maxMarks}\n`;
  });
  text += `\nTOTAL: ${getTotalScore()} / 250\n`;
  const result = calculatePlacementLevel(getTotalScore(), getParam8Mark(), getGateCoreMark(), state.batch);
  text += `Level: ${result.name}${result.pkg ? " (" + result.pkg + ")" : ""}\n`;
  downloadFile("achievement-passport.txt", text);
});

/* ============================================================
   BACKUP / IMPORT / PUBLISH
   ============================================================ */

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById("exportJsonBtn").addEventListener("click", () => {
  downloadFile(`readiness-backup-${Date.now()}.json`, JSON.stringify(state, null, 2));
});

document.getElementById("publishBtn").addEventListener("click", () => {
  const total = getTotalScore();
  const result = calculatePlacementLevel(total, getParam8Mark(), getGateCoreMark(), state.batch);
  let text = `PLACEMENT READINESS SNAPSHOT\nGenerated: ${new Date().toLocaleString()}\n\n`;
  text += `TOTAL SCORE: ${total} / 250\n`;
  text += `LEVEL: ${result.name}${result.pkg ? " (" + result.pkg + ")" : ""}\n\n`;
  text += `PARAMETER BREAKDOWN\n`;
  PARAMETERS.forEach(p => {
    text += `${p.id}. ${p.name}: ${getParamMark(p)} / ${p.maxMarks} — ${getParamStatus(p)}\n`;
  });
  if (state.activities.length) {
    text += `\nACTIVITIES\n`;
    state.activities.forEach(a => { text += `- [${a.type}] ${a.title} — ${a.status}\n`; });
  }
  downloadFile(`mentor-snapshot-${Date.now()}.txt`, text);
});

document.getElementById("importFile").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const imported = JSON.parse(evt.target.result);
      if (!imported.parameters) throw new Error("Not a valid backup file");
      state = imported;
      saveState();
      renderAll();
      alert("Backup restored successfully.");
    } catch (err) {
      alert("Couldn't read that file — make sure it's a backup exported from this app.");
    }
  };
  reader.readAsText(file);
});

/* ============================================================
   INIT
   ============================================================ */

renderAll();
