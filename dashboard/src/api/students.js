import { API_BASE_URL } from "./config";

export async function login(accountId, password) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account_id: accountId, password }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || "Login failed");
  return res.json();
}

export async function logout(token) {
  await fetch(`${API_BASE_URL}/auth/logout`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
}

export async function fetchAtRiskStudents(token) {
  const res = await fetch(`${API_BASE_URL}/students/at-risk`, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 401) {
    sessionStorage.removeItem("mentor_session");
    window.location.reload();
    throw new Error("Session expired. Please log in again.");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to load students");
  }
  return res.json();
}

export async function fetchStudentDetail(studentId, token) {
  const res = await fetch(`${API_BASE_URL}/students/${studentId}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error("Failed to load student detail");
  return res.json();
}

export async function uploadDataSource(source, file, token) {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch(`${API_BASE_URL}/ingest/${source}`, { 
    method: "POST", 
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body 
  });
  if (!res.ok) {
    if (res.status === 401) {
      sessionStorage.removeItem("mentor_session");
      window.location.reload();
      throw new Error("Session expired. Please log in again.");
    }
    let errMsg = `Upload failed (${res.status})`;
    try {
      const data = await res.json();
      errMsg = data.detail || data.message || JSON.stringify(data);
    } catch {
      try {
        const text = await res.text();
        if (text) errMsg = text.substring(0, 150);
      } catch (_) {}
    }
    throw new Error(errMsg);
  }
  return res.json();
}

export async function saveIntervention(studentId, payload, token) {
  const res = await fetch(`${API_BASE_URL}/students/${studentId}/interventions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || "Failed to save intervention");
  return res.json();
}

export async function fetchPolicy(token) {
  const res = await fetch(`${API_BASE_URL}/policy`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to load policy");
  return res.json();
}

export async function updatePolicy(policy, token) {
  const res = await fetch(`${API_BASE_URL}/policy`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(policy),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || "Failed to update policy");
  return res.json();
}

export async function queueAlerts(token) {
  const res = await fetch(`${API_BASE_URL}/alerts/run`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || "Failed to queue alerts");
  return res.json();
}


export async function fetchDataSources(token) {
  const res = await fetch(`${API_BASE_URL}/ingest/sources`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) return {};
  return res.json();
}

export async function fetchMentorsDirectory() {
  try {
    const res = await fetch(`${API_BASE_URL}/mentors/directory`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

