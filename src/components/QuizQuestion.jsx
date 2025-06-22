// components/QuizQuestion.jsx
const QuizQuestion = ({ question, answers, onAnswer, current, total }) => {
  return (
    <div className="quiz-container">
      <div className="quiz-content">
        <h1>🎯 Trivia Kuis</h1>
        <h3 dangerouslySetInnerHTML={{ __html: question }} />

        <div>
          {answers.map((ans, idx) => (
            <button
              key={idx}
              className="quiz-answer-button"
              onClick={() => onAnswer(ans)}
              dangerouslySetInnerHTML={{ __html: ans }}
            />
          ))}
        </div>
      </div>
      
      <div className="progress-indicator">
        <p>📊 Soal {current + 1} dari {total}</p>
      </div>
    </div>
  );
};

export default QuizQuestion;