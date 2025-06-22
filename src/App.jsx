// App.js - Enhanced with IBM Granite - FIXED
import { useEffect, useState } from "react";
import QuizSetup from "./components/QuizSetup";
import AIQuizSetup from "./components/AIQuizSetup";
import QuizQuestion from "./components/QuizQuestion";
import ScoreSummary from "./components/ScoreSummary";
import AnswerFeedback from "./components/AnswerFeedback";
import {generateQuestionsWithRetry } from "./services/replicateAPI";
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

  // State untuk AI quiz
  const [useAI, setUseAI] = useState(false);
  const [aiConfig, setAiConfig] = useState({
    topic: '',
    difficulty: 'medium',
    questionCount: 5
  });

  // State untuk feedback
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

  // Regular quiz (OpenTDB)
  const fetchRegularQuestions = async () => {
    setLoading(true);
    try {
      const url = `https://opentdb.com/api.php?amount=${aiConfig.questionCount}&category=${category}&difficulty=${difficulty}&type=multiple`;
      const res = await fetch(url);
      const data = await res.json();

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
      alert("Gagal mengambil soal. Silakan coba lagi.");
    }
    setLoading(false);
  };

  // FIXED: Handler for AI Quiz - matches AIQuizSetup expectations
  const handleStartAIQuiz = (formattedQuestions, config) => {
    console.log('handleStartAIQuiz called with:', { formattedQuestions, config });
    
    if (!formattedQuestions || formattedQuestions.length === 0) {
      alert("Tidak ada soal yang berhasil dibuat");
      return;
    }

    // Set the questions and config
    setQuestions(formattedQuestions);
    setAiConfig(config);
    setQuizStarted(true);
  };

  const handleAnswer = (answer) => {
    const correct = questions[currentIndex].correct_answer;
    const isAnswerCorrect = answer === correct;
    
    setSelectedAnswer(answer);
    setCorrectAnswer(correct);
    setIsCorrect(isAnswerCorrect);
    setShowFeedback(true);

    if (isAnswerCorrect) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    const next = currentIndex + 1;
    
    setShowFeedback(false);
    setSelectedAnswer("");
    setCorrectAnswer("");
    
    if (next < questions.length) {
      setCurrentIndex(next);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setShowResult(false);
    setQuizStarted(false);
    setShowFeedback(false);
    setUseAI(false);
    setAiConfig({
      topic: '',
      difficulty: 'medium',
      questionCount: 5
    });
  };

  const handleBackToRegular = () => {
    setUseAI(false);
  };

  if (!quizStarted) {
    return useAI ? (
      <AIQuizSetup
        onStartAIQuiz={handleStartAIQuiz} // FIXED: Correct prop name and handler
        onBack={handleBackToRegular}     // FIXED: Added onBack prop
      />
    ) : (
      <QuizSetup
        category={category}
        setCategory={setCategory}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        questionCount={aiConfig.questionCount}
        setQuestionCount={(count) => setAiConfig({...aiConfig, questionCount: count})}
        onStart={fetchRegularQuestions}
        loading={loading}
        onUseAI={() => setUseAI(true)}
      />
    );
  }

  if (showResult) {
    return (
      <ScoreSummary 
        score={score} 
        total={questions.length} 
        onRestart={resetQuiz}
        isAIQuiz={useAI}
        topic={aiConfig.topic}
      />
    );
  }

  if (showFeedback) {
    return (
      <AnswerFeedback
        isCorrect={isCorrect}
        selectedAnswer={selectedAnswer}
        correctAnswer={correctAnswer}
        explanation={questions[currentIndex].explanation}
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
      isAIQuiz={useAI}
      topic={aiConfig.topic}
    />
  );
}

export default App;