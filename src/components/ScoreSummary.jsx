// components/ScoreSummary.jsx
const ScoreSummary = ({ score, total }) => {
  const getScoreEmoji = () => {
    const percentage = (score / total) * 100;
    if (percentage === 100) return "🏆";
    if (percentage >= 80) return "🎉";
    if (percentage >= 60) return "👏";
    if (percentage >= 40) return "👍";
    return "💪";
  };

  const getScoreMessage = () => {
    const percentage = (score / total) * 100;
    if (percentage === 100) return "Sempurna! Kamu jenius!";
    if (percentage >= 80) return "Luar biasa! Skor yang fantastis!";
    if (percentage >= 60) return "Bagus! Terus tingkatkan!";
    if (percentage >= 40) return "Lumayan! Bisa lebih baik lagi!";
    return "Jangan menyerah! Coba lagi!";
  };

  return (
    <div className="quiz-container">
      <div className="score-display">
        <h1>{getScoreEmoji()} Skor Kamu</h1>
        <div className="score-number">{score}/{total}</div>
        <p style={{ fontSize: '18px', marginBottom: '24px', color: 'var(--text-secondary)' }}>
          {getScoreMessage()}
        </p>
        <button onClick={() => window.location.reload()}>
          🔄 Main Lagi
        </button>
      </div>
    </div>
  );
};

export default ScoreSummary;