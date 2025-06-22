// components/AIQuizSetup.jsx - Setup for AI-generated quiz
import React, { useState } from 'react';
import { generateQuestionsWithRetry } from '../services/replicateAPI';
import './AIQuizSetup.css';

const AIQuizSetup = ({ onStartAIQuiz, onBack }) => {
  const [aiConfig, setAiConfig] = useState({
    topic: '',
    difficulty: 'medium',
    questionCount: 5
  });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ status: '', progress: 0, message: '' });
  const [error, setError] = useState('');

  // Validate props
  React.useEffect(() => {
    if (!onStartAIQuiz || typeof onStartAIQuiz !== 'function') {
      console.error('AIQuizSetup: onStartAIQuiz prop is missing or not a function');
      setError('Component tidak dikonfigurasi dengan benar. onStartAIQuiz prop diperlukan.');
    }
    if (!onBack || typeof onBack !== 'function') {
      console.error('AIQuizSetup: onBack prop is missing or not a function');
    }
  }, [onStartAIQuiz, onBack]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate props before proceeding
    if (!onStartAIQuiz || typeof onStartAIQuiz !== 'function') {
      setError('Component tidak dikonfigurasi dengan benar. Hubungi developer.');
      return;
    }
    
    if (!aiConfig.topic.trim()) {
      setError('Masukkan topik untuk soal quiz');
      return;
    }

    setLoading(true);

    try {
      console.log('Generating AI questions with config:', aiConfig);
      
      const questions = await generateQuestionsWithRetry(
        aiConfig.topic.trim(),
        aiConfig.difficulty,
        aiConfig.questionCount,
        (progressInfo) => {
          setProgress(progressInfo);
        }
      );

      if (!questions || questions.length === 0) {
        throw new Error('Tidak ada soal yang berhasil dibuat');
      }

const formattedQuestions = questions.map(q => {
  const correctAnswer = q.options[q.correct];
  const incorrectAnswers = q.options.filter((_, index) => index !== q.correct);
  
  return {
    question: q.question,
    correct_answer: correctAnswer,
    incorrect_answers: incorrectAnswers,
    explanation: q.explanation || '',
    all_answers: [...q.options].sort(() => Math.random() - 0.5)
  };
});

      console.log('Formatted questions:', formattedQuestions);
      console.log('Calling onStartAIQuiz with:', { formattedQuestions, aiConfig });

      // Call the parent handler
      onStartAIQuiz(formattedQuestions, aiConfig);
      
    } catch (error) {
      console.error('Error generating AI quiz:', error);
      setError(`Gagal membuat soal AI: ${error.message}. Coba gunakan quiz reguler.`);
    } finally {
      setLoading(false);
      setProgress({ status: '', progress: 0, message: '' });
    }
  };

  const handleBack = () => {
    if (onBack && typeof onBack === 'function') {
      onBack();
    } else {
      console.warn('onBack prop is not provided or not a function');
      // Fallback: try to go back in history
      if (window.history.length > 1) {
        window.history.back();
      }
    }
  };

  const topicSuggestions = [
    'JavaScript Programming',
    'React.js',
    'Machine Learning',
    'Data Science',
    'Python Programming',
  ];

  return (
    <div className="quiz-container">
      <div className="quiz-content">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <button 
            onClick={handleBack}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              marginRight: '12px',
              padding: '4px'
            }}
          >
            ←
          </button>
          <h1 style={{ margin: 0 }}>🤖 AI Quiz Generator</h1>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
          padding: '20px',
          borderRadius: 'var(--border-radius, 8px)',
          marginBottom: '24px',
          border: '1px solid var(--primary-color, #6366f1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '24px', marginRight: '8px' }}>✨</span>
            <h3 style={{ margin: 0, color: 'var(--primary-color, #6366f1)' }}>
              Powered by IBM Granite via Replicate
            </h3>
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary, #666)' }}>
            Buat soal quiz custom dengan IBM Granite AI melalui platform Replicate. Lebih stabil dan mudah digunakan!
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              📝 Topik Quiz:
            </label>
            <input
              type="text"
              value={aiConfig.topic}
              onChange={(e) => setAiConfig({...aiConfig, topic: e.target.value})}
              placeholder="Contoh: JavaScript, Machine Learning, Web Development..."
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid var(--border-color, #ddd)',
                borderRadius: 'var(--border-radius, 8px)',
                marginBottom: '12px',
                boxSizing: 'border-box'
              }}
            />
            
            {/* Topic Suggestions */}
            <div style={{ marginBottom: '16px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-secondary, #666)' }}>
                💡 Saran topik populer:
              </p>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '8px' 
              }}>
                {topicSuggestions.slice(0, 6).map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setAiConfig({...aiConfig, topic: suggestion})}
                    style={{
                      background: 'var(--background-secondary, #f8f9fa)',
                      border: '1px solid var(--border-color, #ddd)',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'var(--primary-color, #6366f1)';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'var(--background-secondary, #f8f9fa)';
                      e.target.style.color = 'var(--text-primary, #333)';
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px',
            marginBottom: '24px'
          }}>
            <label style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ marginBottom: '8px', fontWeight: 'bold' }}>📊 Jumlah Soal:</span>
              <select 
                value={aiConfig.questionCount} 
                onChange={(e) => setAiConfig({...aiConfig, questionCount: Number(e.target.value)})}
                style={{
                  padding: '8px',
                  border: '1px solid var(--border-color, #ddd)',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value={3}>3 Soal (Cepat)</option>
                <option value={5}>5 Soal (Standar)</option>
                <option value={8}>8 Soal (Menengah)</option>
                <option value={10}>10 Soal (Lengkap)</option>
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ marginBottom: '8px', fontWeight: 'bold' }}>🎚️ Tingkat Kesulitan:</span>
              <select 
                value={aiConfig.difficulty} 
                onChange={(e) => setAiConfig({...aiConfig, difficulty: e.target.value})}
                style={{
                  padding: '8px',
                  border: '1px solid var(--border-color, #ddd)',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="easy">😊 Pemula</option>
                <option value="medium">😐 Menengah</option>
                <option value="hard">😤 Lanjutan</option>
              </select>
            </label>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#dc2626',
              padding: '12px',
              borderRadius: 'var(--border-radius, 8px)',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              ⚠️ {error}
            </div>
          )}

          {loading && progress.progress > 0 && (
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              padding: '16px',
              borderRadius: 'var(--border-radius, 8px)',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-primary, #333)' }}>
                  🤖 {progress.status}
                </span>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary, #666)' }}>
                  {Math.round(progress.progress)}%
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                background: 'rgba(59, 130, 246, 0.2)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${progress.progress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--secondary-color, #8b5cf6), var(--primary-color, #6366f1))',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              {progress.message && (
                <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: 'var(--text-secondary, #666)' }}>
                  {progress.message}
                </p>
              )}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading || !aiConfig.topic.trim()}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '18px',
              fontWeight: 'bold',
              background: loading || !aiConfig.topic.trim() 
                ? 'var(--text-secondary, #999)' 
                : 'linear-gradient(135deg, var(--secondary-color, #8b5cf6), var(--primary-color, #6366f1))',
              cursor: loading || !aiConfig.topic.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !aiConfig.topic.trim() ? 0.6 : 1,
              border: 'none',
              borderRadius: 'var(--border-radius, 8px)',
              color: 'white',
              transition: 'all 0.3s'
            }}
          >
            {loading ? (
              <span>
                <span className="loading-spinner"></span>
                🤖 AI sedang membuat soal...
              </span>
            ) : (
              '🚀 Generate Quiz dengan AI!'
            )}
          </button>
        </form>

        {/* Info Box */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'var(--background-secondary, #f8f9fa)',
          borderRadius: 'var(--border-radius, 8px)',
          border: '1px solid var(--border-color, #ddd)'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary, #333)' }}>
            ℹ️ Tips untuk hasil terbaik:
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary, #666)', fontSize: '14px' }}>
            <li>Daftar di <a href="https://replicate.com" target="_blank" rel="noopener noreferrer">Replicate.com</a> untuk mendapatkan API token gratis</li>
            <li>Gunakan topik yang spesifik (contoh: "React Hooks" lebih baik dari "Programming")</li>
            <li>Gratis tier: 100 predictions per bulan</li>
            <li>Pastikan koneksi internet stabil saat generate (bisa memakan waktu 30-60 detik)</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default AIQuizSetup;