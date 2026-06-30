import { jsPDF } from 'jspdf'; // jsPDF 4.x uses named export
import autoTable from 'jspdf-autotable';

export function exportQuizReviewToPDF(quizId, data) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(`Quiz Review Summary: ${quizId}`, 14, 20);

  doc.setFontSize(12);
  autoTable(doc, {
    startY: 30,
    head: [['Question', 'Your Answer', 'Correct Answer', 'Result']],
    body: data?.questions?.map(q => [
      q.text,
      q.userAnswer,
      q.correctAnswer,
      q.isCorrect ? '✅' : '❌'
    ]) || []
  });

  doc.text(`Score: ${data?.score || '--'}%`, 14, doc.lastAutoTable.finalY + 10);
  doc.save(`quiz_review_${quizId}.pdf`);
}
