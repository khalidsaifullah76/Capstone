// components/QuizSetup.jsx - Enhanced dengan AI option
const QuizSetup = ({ 
  category, 
  setCategory, 
  difficulty, 
  setDifficulty, 
  questionCount, 
  setQuestionCount, 
  onStart, 
  loading, 
  onUseAI 
}) => {
  return (
    <div className="quiz-container">
      <div className="quiz-content">
        <h1>🎯 Setup Quiz</h1>
        
        {/* AI Quiz Promotion */}
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
          padding: '20px',
          borderRadius: 'var(--border-radius)',
          marginBottom: '24px',
          border: '2px dashed var(--primary-color)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🤖</div>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--primary-color)' }}>
            Coba Quiz AI Generator!
          </h3>
          <p style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)' }}>
            Buat soal custom sesuai topik yang kamu mau dengan IBM Granite AI
          </p>
          <button 
            onClick={onUseAI}
            style={{
              background: 'linear-gradient(135deg, var(--secondary-color), var(--primary-color))',
              padding: '12px 24px',
              fontSize: '14px'
            }}
          >
            🚀 Coba AI Quiz
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: 'var(--text-secondary)', fontSize: '18px', margin: 0 }}>
            Atau pilih quiz reguler dari database
          </h2>
        </div>

        <label>
          🎯 Kategori:
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="18">💻 Science: Computers</option>
            <option value="9">🧠 General Knowledge</option>
            <option value="23">📚 History</option>
            <option value="21">⚽ Sports</option>
            <option value="24">🏛️ Politics</option>
            <option value="22">🌍 Geography</option>
            <option value="17">🔬 Science & Nature</option>
            <option value="25">🎨 Art</option>
            <option value="26">🏆 Celebrities</option>
            <option value="11">🎬 Entertainment: Film</option>
            <option value="12">🎵 Entertainment: Music</option>
            <option value="15">🎮 Entertainment: Video Games</option>
          </select>
        </label>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          marginBottom: '24px'
        }}>
          <label>
            📊 Jumlah Soal:
            <select value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))}>
              <option value={5}>5 Soal</option>
              <option value={10}>10 Soal</option>
              <option value={15}>15 Soal</option>
              <option value={20}>20 Soal</option>
            </select>
          </label>

          <label>
            🎚️ Tingkat Kesulitan:
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="easy">😊 Mudah</option>
              <option value="medium">😐 Sedang</option>
              <option value="hard">😤 Sulit</option>
            </select>
          </label>
        </div>

        <button 
          onClick={onStart} 
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '18px',
            fontWeight: 'bold',
            background: loading ? 'var(--text-secondary)' : 'var(--primary-color)',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '⏳ Memuat soal...' : '🚀 Mulai Quiz!'}
        </button>

        {/* Quiz Preview Info */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'var(--background-secondary)',
          borderRadius: 'var(--border-radius)',
          border: '1px solid var(--border-color)'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
            📋 Preview Quiz:
          </h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '8px',
            fontSize: '14px',
            color: 'var(--text-secondary)'
          }}>
            <div>📚 Kategori: <strong>{getCategoryName(category)}</strong></div>
            <div>📊 Jumlah: <strong>{questionCount} soal</strong></div>
            <div>🎚️ Level: <strong>{getDifficultyName(difficulty)}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getCategoryName = (categoryId) => {
  const categories = {
    '18': 'Science: Computers',
    '9': 'General Knowledge',
    '23': 'History',
    '21': 'Sports',
    '24': 'Politics',
    '22': 'Geography',
    '17': 'Science & Nature',
    '25': 'Art',
    '26': 'Celebrities',
    '11': 'Entertainment: Film',
    '12': 'Entertainment: Music',
    '15': 'Entertainment: Video Games'
  };
  return categories[categoryId] || 'Unknown';
};

const getDifficultyName = (difficulty) => {
  const difficulties = {
    'easy': 'Mudah',
    'medium': 'Sedang',
    'hard': 'Sulit'
  };
  return difficulties[difficulty] || 'Unknown';
};

export default QuizSetup;