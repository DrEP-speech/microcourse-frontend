export function storeQuizOffline(quizResult) {
  const pending = JSON.parse(localStorage.getItem('offlineQuizzes')) || [];
  pending.push(quizResult);
  localStorage.setItem('offlineQuizzes', JSON.stringify(pending));
}

export function syncOfflineQuizzes() {
  const pending = JSON.parse(localStorage.getItem('offlineQuizzes')) || [];
  pending.forEach(async (quiz) => {
    await fetch('/api/quizzes/submit', {
      method: 'POST',
      body: JSON.stringify(quiz),
      headers: { 'Content-Type': 'application/json' },
    });
  });
  localStorage.removeItem('offlineQuizzes');
}
