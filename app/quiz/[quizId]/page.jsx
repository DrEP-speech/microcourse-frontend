"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "../../../lib/http";
import { getToken } from "../../../lib/auth";

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params?.quizId;

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]); // index-aligned with quiz.questions
  const [result, setResult] = useState(null); // most recently submitted/persisted result
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    if (!quizId) return;

    (async () => {
      try {
        const quizData = await apiFetch(`quizzes/${encodeURIComponent(quizId)}`);
        const loadedQuiz = quizData?.data || quizData;
        setQuiz(loadedQuiz);
        setAnswers(new Array((loadedQuiz?.questions || []).length).fill(null));
      } catch (e) {
        setMsg(e?.message || "Failed to load quiz");
      }

      // Load any previously persisted result so a refresh / re-login still
      // shows the last saved attempt instead of resetting silently.
      try {
        const resultData = await apiFetch(`quizzes/${encodeURIComponent(quizId)}/result`);
        if (resultData?.result) {
          setResult(resultData.result);
        }
      } catch {
        // No prior result yet — not an error condition.
      }
    })();
  }, [quizId, router]);

  function selectAnswer(questionIndex, choiceIndex) {
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = choiceIndex;
      return next;
    });
  }

  async function submit() {
    setMsg("");
    setBusy(true);
    try {
      const data = await apiFetch(`quizzes/${encodeURIComponent(quizId)}/submit`, {
        method: "POST",
        json: { answers },
      });
      setResult(data?.result || data);
      setMsg(`Submitted. Score: ${data?.score ?? data?.scorePct ?? "OK"} — ${data?.passed ? "Passed" : "Not passed"}`);
    } catch (e) {
      setMsg(e?.message || "Submit failed");
    } finally {
      setBusy(false);
    }
  }

  if (!quiz) {
    return (
      <main style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1 className="h1" data-testid="quiz-heading">Quiz</h1>
        <p className="muted" data-testid="quiz-loading">{msg || "Loading..."}</p>
      </main>
    );
  }

  const questions = quiz.questions || [];

  return (
    <main style={{ maxWidth: 720, margin: "0 auto" }}>
      <h1 className="h1" data-testid="quiz-heading">{quiz.title || quiz.name || "Quiz"}</h1>

      {result && (
        <div style={{ marginTop: 14 }}>
          <span className={`score-badge ${result.passed ? "pass" : "fail"}`} data-testid="quiz-last-result">
            {result.score ?? result.percent}% ({result.correctCount}/{result.total}) — {result.passed ? "Passed" : "Not passed"}
          </span>
        </div>
      )}

      <div className="stack" style={{ marginTop: 18 }}>
        {questions.map((q, idx) => (
          <div key={q._id || q.id || idx} data-testid={`quiz-q-${idx}`} className="quiz-q">
            <div style={{ fontWeight: 700, marginBottom: 10 }}>{q.prompt || q.question || `Question ${idx + 1}`}</div>
            <div className="stack" style={{ gap: 4 }}>
              {(q.choices || q.options || []).map((choice, choiceIdx) => (
                <label key={choiceIdx} className="quiz-choice">
                  <input
                    type="radio"
                    name={`question-${idx}`}
                    data-testid={`quiz-a-${idx}-${choiceIdx}`}
                    checked={answers[idx] === choiceIdx}
                    onChange={() => selectAnswer(idx, choiceIdx)}
                  />
                  <span>{choice}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        data-testid="quiz-submit"
        onClick={submit}
        disabled={busy}
        className="btn primary"
        style={{ marginTop: 18 }}
      >
        {busy ? "Submitting..." : "Submit"}
      </button>

      {msg ? <p className="muted" data-testid="quiz-msg" style={{ marginTop: 12 }}>{msg}</p> : null}
    </main>
  );
}
