// src/api.js
export async function getDoctors() {
  const API =
    (import.meta?.env?.VITE_API_URL) ||
    'http://localhost:8082';

  const url = `${API}/api/public/doctors`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch doctors');
  const json = await res.json();

  if (Array.isArray(json)) return json;
  if (json && Array.isArray(json.data)) return json.data;
  if (json && Array.isArray(json.result)) return json.result;
  return [];
}