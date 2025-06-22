# Capstone
Quiz App Sederhana
Description
Aplikasi quiz interaktif berbasis web yang memungkinkan pengguna menjawab pertanyaan trivia dari berbagai kategori dengan tingkat kesulitan yang dapat dipilih. Aplikasi ini menggunakan Open Trivia Database API untuk mendapatkan pertanyaan-pertanyaan quiz yang beragam.
Technologies Used

React.js 18 - JavaScript library untuk membangun user interface
CSS3 - Styling dengan custom properties dan modern layout
Open Trivia Database API - External API untuk mendapatkan data pertanyaan quiz
Vercel - Platform deployment untuk hosting aplikasi

Features

Multiple Categories: Pilihan kategori seperti Science Computers, General Knowledge, History, Sports, dan Politics
3 Difficulty Levels: Easy, Medium, dan Hard untuk menyesuaikan tingkat tantangan
Interactive Feedback: Menampilkan feedback langsung setelah menjawab dengan indikator benar/salah
Score Tracking: Menghitung dan menampilkan skor akhir setelah quiz selesai
Responsive Design: Interface yang responsive dan mobile-friendly
Shuffled Answers: Jawaban diacak secara otomatis untuk setiap pertanyaan
Progress Indicator: Menampilkan progress quiz (soal ke-x dari total)

Setup Instructions
Prerequisites

Node.js (version 14 atau lebih baru)
npm atau yarn package manager

Installation

Clone the repository
bashgit clone https://github.com/yourusername/quiz-app.git
cd quiz-app

Install dependencies
bashnpm install

Create required files
Create public/index.html:
html<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Quiz App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
Create src/index.js:
javascriptimport React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

Start development server
bashnpm start
Application will run on http://localhost:3000
Build for production
bashnpm run build
