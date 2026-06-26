'use client';

export default function GlobalError({ error, reset }) {
  return (
    <div className='card'>
      <div className='h2'>Something went sideways.</div>
      <div className='alert' style={{ marginTop: 10 }}>{String(error?.message || error)}</div>
      <div style={{ height: 10 }} />
      <button className='btn' onClick={() => reset()}>Try again</button>
    </div>
  );
}
