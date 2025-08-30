const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function getSummaryFull(token: string) {
  const r = await fetch(`${API_URL}/summary/full`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    }
  });
  if (!r.ok) throw new Error(`Summary failed: ${r.status}`);
  return r.json();
}
