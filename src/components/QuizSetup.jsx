// components/QuizSetup.jsx
const QuizSetup = ({ category, setCategory, difficulty, setDifficulty, onStart, loading }) => {
  return (
    <div className="quiz-container">
      <div className="quiz-content">
        <h1>⚙️ Setup Kuis</h1>
        
        <label>
          🎯 Kategori:
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="18">💻 Science: Computers</option>
            <option value="9">🧠 General Knowledge</option>
            <option value="23">📚 History</option>
            <option value="21">⚽ Sports</option>
            <option value="24">🏛️ Politics</option>
          </select>
        </label>
        
        <label>
          📈 Tingkat Kesulitan:
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="easy">😊 Mudah</option>
            <option value="medium">😐 Sedang</option>
            <option value="hard">😰 Sulit</option>
          </select>
        </label>
        
        <button onClick={onStart} disabled={loading}>
          {loading ? "⏳ Loading..." : "🚀 Mulai Kuis"}
        </button>
      </div>
    </div>
  );
};

export default QuizSetup;
