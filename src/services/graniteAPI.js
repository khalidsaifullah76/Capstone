// services/replicateAPI.js - Replicate IBM Granite Integration

// Configuration
const REPLICATE_CONFIG = {
  BASE_URL: 'https://api.replicate.com/v1/predictions',
  // IBM Granite model on Replicate
  IBM_GRANITE_MODEL: 'ibm-granite/granite-7b-instruct:2ca4096bb690eddabc6b3bb8d36e64e82b1c73ee5b3db90f46c6d8e8d1e3b3e3'
};

// Get environment variable safely
const getEnvVar = (name) => {
  if (typeof window !== 'undefined' && window.env) {
    return window.env[name];
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[name];
  }
  return undefined;
};

// Create prediction with Replicate
const createPrediction = async (prompt) => {
  const apiToken = getEnvVar('REACT_APP_REPLICATE_API_TOKEN');
  
  if (!apiToken) {
    throw new Error('Replicate API token tidak ditemukan. Pastikan REACT_APP_REPLICATE_API_TOKEN sudah diset di file .env');
  }

  try {
    const response = await fetch(REPLICATE_CONFIG.BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: REPLICATE_CONFIG.IBM_GRANITE_MODEL,
        input: {
          prompt: prompt,
          max_new_tokens: 2500,
          temperature: 0.3,
          top_p: 0.9,
          top_k: 50,
          repetition_penalty: 1.1,
          stop_sequences: ["Human:", "Assistant:", "\n\n---"]
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Replicate API Error: ${data.detail || response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('Error creating prediction:', error);
    throw error;
  }
};

// Get prediction result
const getPredictionResult = async (predictionId) => {
  const apiToken = getEnvVar('REACT_APP_REPLICATE_API_TOKEN');
  
  try {
    const response = await fetch(`${REPLICATE_CONFIG.BASE_URL}/${predictionId}`, {
      headers: {
        'Authorization': `Token ${apiToken}`,
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Replicate Get Error: ${data.detail || response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('Error getting prediction result:', error);
    throw error;
  }
};

// Wait for prediction to complete with progress callback
const waitForPrediction = async (predictionId, onProgress = null, maxWaitTime = 90000) => {
  const startTime = Date.now();
  const pollInterval = 2000; // Check every 2 seconds

  while (Date.now() - startTime < maxWaitTime) {
    const prediction = await getPredictionResult(predictionId);
    
    // Call progress callback if provided
    if (onProgress) {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / maxWaitTime) * 100, 95);
      onProgress({
        status: prediction.status,
        progress: progress,
        elapsed: elapsed
      });
    }
    
    if (prediction.status === 'succeeded') {
      return prediction.output;
    } else if (prediction.status === 'failed') {
      throw new Error(`Prediction failed: ${prediction.error || 'Unknown error'}`);
    } else if (prediction.status === 'canceled') {
      throw new Error('Prediction was canceled');
    }
    
    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
  
  throw new Error('Prediction timed out. Coba lagi dengan topik yang lebih sederhana.');
};

// Generate questions using IBM Granite via Replicate
const generateGraniteQuestions = async (topic, difficulty, questionCount, onProgress = null) => {
  // Difficulty mapping
  const difficultyMapping = {
    easy: 'tingkat dasar/pemula',
    medium: 'tingkat menengah', 
    hard: 'tingkat lanjutan/expert'
  };

  const systemPrompt = `Kamu adalah seorang guru yang ahli dalam membuat soal kuis berkualitas tinggi.`;

  const prompt = `${systemPrompt}

Buatkan ${questionCount} soal pilihan ganda tentang "${topic}" dengan tingkat kesulitan ${difficultyMapping[difficulty]}.

KETENTUAN WAJIB:
1. Setiap soal harus memiliki tepat 4 pilihan jawaban (A, B, C, D)
2. Hanya ada 1 jawaban yang benar
3. Gunakan bahasa Indonesia yang baik dan benar
4. Soal harus akurat, edukatif, dan relevan dengan topik
5. Hindari soal yang terlalu mudah ditebak
6. Berikan penjelasan singkat untuk jawaban yang benar

FORMAT JSON YANG HARUS DIIKUTI PERSIS:
{
  "questions": [
    {
      "question": "Teks soal di sini?",
      "correct_answer": "Jawaban yang benar",
      "incorrect_answers": ["Jawaban salah 1", "Jawaban salah 2", "Jawaban salah 3"],
      "explanation": "Penjelasan mengapa jawaban ini benar"
    }
  ]
}

PENTING: 
- Response harus HANYA berupa JSON yang valid
- Jangan tambahkan teks apapun selain JSON
- Pastikan semua string dalam JSON menggunakan double quotes
- Jangan gunakan single quotes atau karakter khusus yang bisa merusak JSON

Topik: ${topic}
Kesulitan: ${difficultyMapping[difficulty]}
Jumlah soal: ${questionCount}`;

  try {
    // Create prediction
    if (onProgress) onProgress({ status: 'starting', progress: 5 });
    const prediction = await createPrediction(prompt);
    
    if (onProgress) onProgress({ status: 'processing', progress: 20 });
    
    // Wait for completion
    const output = await waitForPrediction(prediction.id, onProgress);
    
    if (onProgress) onProgress({ status: 'parsing', progress: 90 });

    // Process the output
    let generatedText;
    if (Array.isArray(output)) {
      generatedText = output.join('').trim();
    } else if (typeof output === 'string') {
      generatedText = output.trim();
    } else {
      throw new Error('Format output tidak dikenali dari Replicate');
    }

    console.log('Raw Granite response:', generatedText);

    // Parse JSON dari response
    let questionsData;
    try {
      // Coba parse langsung
      questionsData = JSON.parse(generatedText);
    } catch (parseError) {
      // Jika gagal, coba extract JSON dari dalam teks
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Tidak dapat menemukan JSON yang valid dalam response AI');
      }
      questionsData = JSON.parse(jsonMatch[0]);
    }

    // Validasi struktur response
    if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
      throw new Error('Format response AI tidak sesuai - missing questions array');
    }

    // Validasi dan bersihkan setiap soal
    const validatedQuestions = questionsData.questions.map((q, index) => {
      if (!q.question || !q.correct_answer || !q.incorrect_answers) {
        throw new Error(`Soal ${index + 1} tidak memiliki struktur yang lengkap`);
      }

      if (!Array.isArray(q.incorrect_answers) || q.incorrect_answers.length !== 3) {
        throw new Error(`Soal ${index + 1} harus memiliki tepat 3 jawaban salah`);
      }

      return {
        question: q.question.trim(),
        correct_answer: q.correct_answer.trim(),
        incorrect_answers: q.incorrect_answers.map(ans => ans.trim()),
        explanation: q.explanation ? q.explanation.trim() : `Jawaban yang benar adalah: ${q.correct_answer}`
      };
    });

    if (validatedQuestions.length === 0) {
      throw new Error('Tidak ada soal yang berhasil di-generate');
    }

    if (onProgress) onProgress({ status: 'completed', progress: 100 });
    
    console.log(`Successfully generated ${validatedQuestions.length} questions via Replicate`);
    return validatedQuestions;

  } catch (error) {
    console.error('Error generating questions with Replicate Granite:', error);
    
    // Enhanced error handling
    if (error.message.includes('API')) {
      throw new Error('Masalah koneksi dengan Replicate. Periksa API token dan koneksi internet.');
    } else if (error.message.includes('JSON')) {
      throw new Error('AI menghasilkan format response yang tidak valid. Coba topik yang lebih spesifik.');
    } else if (error.message.includes('token')) {
      throw new Error('API token Replicate tidak valid. Periksa REACT_APP_REPLICATE_API_TOKEN di file .env');
    } else if (error.message.includes('timed out')) {
      throw new Error('Request timeout. Coba lagi dengan topik yang lebih sederhana.');
    } else {
      throw new Error(`Gagal generate soal: ${error.message}`);
    }
  }
};

// Fallback questions jika AI gagal
const generateFallbackQuestions = (topic, difficulty, questionCount) => {
  const templates = [
    {
      question: `Apa yang dimaksud dengan ${topic}?`,
      correct_answer: `Konsep dasar dalam ${topic}`,
      incorrect_answers: [
        "Istilah yang tidak relevan",
        "Konsep dari bidang lain", 
        "Definisi yang salah"
      ],
      explanation: `${topic} adalah topik yang sedang dipelajari dalam quiz ini.`
    },
    {
      question: `Manakah yang termasuk komponen penting dalam ${topic}?`,
      correct_answer: `Elemen kunci ${topic}`,
      incorrect_answers: [
        "Komponen tidak terkait",
        "Bagian dari topik lain",
        "Elemen yang salah"
      ],
      explanation: `Ini adalah komponen penting yang berkaitan dengan ${topic}.`
    },
    {
      question: `Mengapa ${topic} penting untuk dipelajari?`,
      correct_answer: `Karena ${topic} memiliki aplikasi praktis`,
      incorrect_answers: [
        "Tidak memiliki manfaat",
        "Hanya untuk akademis saja",
        "Tidak relevan saat ini"
      ],
      explanation: `${topic} penting karena memiliki aplikasi praktis dalam kehidupan.`
    },
    {
      question: `Bagaimana cara terbaik mempelajari ${topic}?`,
      correct_answer: `Dengan praktek dan pemahaman konsep`,
      incorrect_answers: [
        "Hanya dengan menghafal",
        "Tidak perlu dipelajari",
        "Cukup teori saja"
      ],
      explanation: `Cara terbaik mempelajari ${topic} adalah kombinasi teori dan praktek.`
    }
  ];

  return templates.slice(0, questionCount).map((template, index) => ({
    ...template,
    question: template.question.replace(/\${topic}/g, topic),
    correct_answer: template.correct_answer.replace(/\${topic}/g, topic),
    explanation: template.explanation.replace(/\${topic}/g, topic)
  }));
};

// Main function with retry and fallback
const generateQuestionsWithRetry = async (topic, difficulty, questionCount, onProgress = null, maxRetries = 2) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (onProgress) {
        onProgress({ 
          status: `Percobaan ${attempt}`, 
          progress: (attempt - 1) * 10,
          message: `Menghubungi IBM Granite via Replicate...`
        });
      }
      
      return await generateGraniteQuestions(topic, difficulty, questionCount, onProgress);
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      lastError = error;
      
      if (attempt < maxRetries) {
        if (onProgress) {
          onProgress({ 
            status: 'retry', 
            progress: attempt * 30,
            message: `Percobaan ${attempt} gagal, mencoba lagi...`
          });
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  // Final fallback
  console.log('All attempts failed, using fallback questions...');
  if (onProgress) {
    onProgress({ 
      status: 'fallback', 
      progress: 95,
      message: 'Menggunakan soal backup...'
    });
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  return generateFallbackQuestions(topic, difficulty, questionCount);
};

export { 
  generateGraniteQuestions,
  generateFallbackQuestions,
  generateQuestionsWithRetry
};