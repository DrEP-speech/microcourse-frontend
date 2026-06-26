'use client';

import { useEffect, useMemo, useState } from 'react';

function safeArr(v) {
  return Array.isArray(v) ? v : [];
}

export default function QuizPlayer({ quiz, onSubmit }) {
  const items = useMemo(() => safeArr(quiz?.items || quiz?.questions), [quiz]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);

  useEffect(() => {
    setIndex(0);
    setAnswers({});
    setDone(false);
  }, [quiz?._id]);

  if (!quiz) return <div className='card'><p className='p'>Loading quiz…</p></div>;
  if (!items.length) return <div className='card'><p className='p'>This quiz has no questions yet.</p></div>;

  const current = items[index];

  function setAnswer(value) {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  }

  function next() {
    if (index < items.length - 1) setIndex(index + 1);
    else setDone(true);
  }

  function back() {
    if (index > 0) setIndex(index - 1);
  }

  function grade() {
    // Supports:
    // - MC: item.type === 'mc' and item.answer (string or index) with item.choices
    // - Free: item.answer string compare (case-insensitive trim)
    let correct = 0;
    const detail = items.map((it, i) => {
      const given = answers[i];
      let ok = false;

      const truth = it.answer;
      if (it.type === 'mc') {
        // If answer matches exact choice string -> ok
        if (typeof truth === 'string') ok = String(given ?? '').trim() === truth.trim();
        // If answer is numeric index
        if (typeof truth === 'number') ok = Number(given) === truth;
      } else {
        ok = String(given ?? '').trim().toLowerCase() === String(truth ?? '').trim().toLowerCase();
      }

      if (ok) correct += 1;
      return { i, ok, given, truth, prompt: it.prompt };
    });

    const scorePct = Math.round((correct / items.length) * 100);
    return { correct, total: items.length, scorePct, detail };
  }

  const showReview = done;
  const result = showReview ? grade() : null;

  return (
    <div className='card'>
      <div className='row' style={{ justifyContent: 'space-between' }}>
        <div>
          <h2 className='h2'>{quiz.title || 'Quiz'}</h2>
          <p className='small'>Question {Math.min(index + 1, items.length)} of {items.length}</p>
        </div>
        <span className='badge'>Passing: {quiz.passingScore ?? 70}%</span>
      </div>

      <div className='hr' />

      {!showReview ? (
        <>
          <p className='p' style={{ fontSize: 16, color: 'var(--text)' }}>
            {current.prompt || 'Question prompt missing.'}
          </p>

          <div style={{ height: 12 }} />

          {current.type === 'mc' ? (
            <div style={{ display: 'grid', gap: 10 }}>
              {safeArr(current.choices).map((c, idx) => {
                const selected = answers[index] === c || answers[index] === idx;
                return (
                  <button
                    key={idx}
                    className='btn'
                    onClick={() => setAnswer(typeof current.answer === 'number' ? idx : c)}
                    style={{
                      textAlign: 'left',
                      background: selected ? 'rgba(77,163,255,.35)' : undefined,
                      borderColor: selected ? 'rgba(77,163,255,.55)' : undefined
                    }}
                  >
                    {String(c)}
                  </button>
                );
              })}
            </div>
          ) : (
            <input
              className='input'
              placeholder='Type your answer…'
              value={answers[index] ?? ''}
              onChange={(e) => setAnswer(e.target.value)}
            />
          )}

          <div className='hr' />

          <div className='row' style={{ justifyContent: 'space-between' }}>
            <button className='btn' onClick={back} disabled={index === 0}>Back</button>
            <button className='btn primary' onClick={next}>
              {index < items.length - 1 ? 'Next' : 'Finish'}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className={'toast ' + ((result.scorePct >= (quiz.passingScore ?? 70)) ? 'ok' : 'bad')}>
            <div className='row' style={{ justifyContent: 'space-between' }}>
              <strong>Score: {result.scorePct}%</strong>
              <span className='badge'>{result.correct}/{result.total} correct</span>
            </div>
            <p className='p' style={{ marginTop: 6 }}>
              {result.scorePct >= (quiz.passingScore ?? 70)
                ? 'Passed. Clean work.'
                : 'Not passed yet. That’s not failure—just data.'}
            </p>
          </div>

          <div className='hr' />

          <details>
            <summary className='btn'>Review answers</summary>
            <div style={{ height: 12 }} />
            <div style={{ display: 'grid', gap: 12 }}>
              {result.detail.map((d) => (
                <div key={d.i} className='card' style={{ padding: 12 }}>
                  <div className='row' style={{ justifyContent: 'space-between' }}>
                    <strong>Q{d.i + 1}</strong>
                    <span className='badge' style={{ color: d.ok ? 'var(--ok)' : 'var(--danger)' }}>
                      {d.ok ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  <p className='p' style={{ marginTop: 8, color: 'var(--text)' }}>{d.prompt}</p>
                  <div className='small' style={{ marginTop: 8 }}>Your answer: <code>{String(d.given ?? '')}</code></div>
                  <div className='small' style={{ marginTop: 6 }}>Correct answer: <code>{String(d.truth ?? '')}</code></div>
                </div>
              ))}
            </div>
          </details>

          <div className='hr' />

          <div className='row' style={{ justifyContent: 'space-between' }}>
            <button className='btn' onClick={() => { setDone(false); setIndex(0); setAnswers({}); }}>
              Retry
            </button>
            <button
              className='btn primary'
              onClick={() => onSubmit && onSubmit({ quizId: quiz._id, ...result })}
            >
              Submit Result (optional)
            </button>
          </div>
        </>
      )}
    </div>
  );
}
