// components/AnswerFeedback.jsx
const AnswerFeedback = ({ 
  isCorrect, 
  selectedAnswer, 
  correctAnswer, 
  onNext, 
  current, 
  total, 
  isLastQuestion 
}) => {
  const getFeedbackData = () => {
    if (isCorrect) {
      return {
        emoji: "🎉",
        title: "Benar!",
        message: "Jawaban kamu tepat sekali!",
        bgColor: "var(--success-color)",
        textColor: "#ffffff"
      };
    } else {
      return {
        emoji: "😔",
        title: "Salah!",
        message: "Jangan khawatir, terus belajar ya!",
        bgColor: "var(--danger-color)",
        textColor: "#ffffff"
      };
    }
  };

  const feedback = getFeedbackData();

  return (
    <div className="quiz-container">
      <div className="quiz-content">
        {/* Header dengan emoji dan status */}
        <div className="feedback-header" style={{
          background: feedback.bgColor,
          color: feedback.textColor,
          padding: "24px",
          borderRadius: "var(--border-radius)",
          textAlign: "center",
          marginBottom: "24px"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>
            {feedback.emoji}
          </div>
          <h1 style={{ 
            margin: "0 0 8px 0", 
            color: feedback.textColor,
            background: "none",
            WebkitTextFillColor: feedback.textColor
          }}>
            {feedback.title}
          </h1>
          <p style={{ margin: 0, fontSize: "16px", opacity: 0.9 }}>
            {feedback.message}
          </p>
        </div>

        {/* Jawaban yang dipilih */}
        <div className="answer-review" style={{
          background: "var(--background-primary)",
          padding: "20px",
          borderRadius: "var(--border-radius-sm)",
          marginBottom: "16px",
          border: `2px solid ${isCorrect ? 'var(--success-color)' : 'var(--danger-color)'}`
        }}>
          <h4 style={{ margin: "0 0 8px 0", color: "var(--text-secondary)", fontSize: "14px" }}>
            Jawaban Kamu:
          </h4>
          <p style={{ 
            margin: 0, 
            fontWeight: "600",
            color: isCorrect ? "var(--success-color)" : "var(--danger-color)"
          }} dangerouslySetInnerHTML={{ __html: selectedAnswer }} />
        </div>

        {/* Jawaban yang benar (jika salah) */}
        {!isCorrect && (
          <div className="correct-answer" style={{
            background: "var(--background-primary)",
            padding: "20px",
            borderRadius: "var(--border-radius-sm)",
            marginBottom: "24px",
            border: "2px solid var(--success-color)"
          }}>
            <h4 style={{ margin: "0 0 8px 0", color: "var(--text-secondary)", fontSize: "14px" }}>
              Jawaban yang Benar:
            </h4>
            <p style={{ 
              margin: 0, 
              fontWeight: "600",
              color: "var(--success-color)"
            }} dangerouslySetInnerHTML={{ __html: correctAnswer }} />
          </div>
        )}

        {/* Tombol lanjut */}
        <button 
          onClick={onNext}
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "16px",
            background: isCorrect 
              ? "linear-gradient(135deg, var(--success-color), #059669)" 
              : "linear-gradient(135deg, var(--primary-color), var(--primary-hover))"
          }}
        >
          {isLastQuestion ? "🏁 Lihat Hasil" : "➡️ Soal Berikutnya"}
        </button>
      </div>
      
      <div className="progress-indicator">
        <p>📊 Soal {current + 1} dari {total}</p>
      </div>
    </div>
  );
};

export default AnswerFeedback;