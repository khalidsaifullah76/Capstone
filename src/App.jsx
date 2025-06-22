import { useEffect, useState } from "react";
import QuizSetup from "./components/QuizSetup";
import QuizQuestion from "./components/QuizQuestion";
import ScoreSummary from "./components/ScoreSummary";
import AnswerFeedback from "./components/AnswerFeedback";
import './style.css';

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [quizStarted, setQuizStarted] = useState(false);
  const [category, setCategory] = useState("18");
  const [difficulty, setDifficulty] = useState("easy");

  // State baru untuk feedback
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");

  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length) {
      const currentQ = questions[currentIndex];
      const answers = [...currentQ.incorrect_answers, currentQ.correct_answer];
      setShuffledAnswers(shuffleArray(answers));
    }
  }, [questions, currentIndex]);

  const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const url = `https://opentdb.com/api.php?amount=5&category=${category}&difficulty=${difficulty}&type=multiple`;
      const res = await fetch(url);
      const data = await res.json();

      console.log("Hasil dari API:", data);

      if (data.results.length === 0) {
        alert("Soal tidak ditemukan untuk kombinasi kategori dan tingkat kesulitan ini.");
        setQuizStarted(false);
        setLoading(false);
        return;
      }

      setQuestions(data.results);
      setQuizStarted(true);
    } catch (err) {
      console.error("Gagal ambil soal", err);
    }
    setLoading(false);
  };

  const handleAnswer = (answer) => {
    const correct = questions[currentIndex].correct_answer;
    const isAnswerCorrect = answer === correct;
    
    // Set feedback state
    setSelectedAnswer(answer);
    setCorrectAnswer(correct);
    setIsCorrect(isAnswerCorrect);
    setShowFeedback(true);

    // Update score jika benar
    if (isAnswerCorrect) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    const next = currentIndex + 1;
    
    // Reset feedback state
    setShowFeedback(false);
    setSelectedAnswer("");
    setCorrectAnswer("");
    
    if (next < questions.length) {
      setCurrentIndex(next);
    } else {
      setShowResult(true);
    }
  };

  if (!quizStarted) {
    return (
      <QuizSetup
        category={category}
        setCategory={setCategory}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        onStart={fetchQuestions}
        loading={loading}
      />
    );
  }

  if (showResult) {
    return <ScoreSummary score={score} total={questions.length} />;
  }

  // Tampilkan feedback jika user sudah menjawab
  if (showFeedback) {
    return (
      <AnswerFeedback
        isCorrect={isCorrect}
        selectedAnswer={selectedAnswer}
        correctAnswer={correctAnswer}
        onNext={handleNextQuestion}
        current={currentIndex}
        total={questions.length}
        isLastQuestion={currentIndex === questions.length - 1}
      />
    );
  }

  return (
    <QuizQuestion
      question={questions[currentIndex].question}
      answers={shuffledAnswers}
      onAnswer={handleAnswer}
      current={currentIndex}
      total={questions.length}
    />
  );
}

export default App;