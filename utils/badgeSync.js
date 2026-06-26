export async function syncBadge(userId, badge) {
  try {
    const res = await fetch('/api/badges/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ userId, newBadge: badge }),
    });
    const data = await res.json();
    return data.badges;
  } catch (err) {
    console.error('Badge sync error:', err);
  }
}
