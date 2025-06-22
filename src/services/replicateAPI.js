// replicateAPI.js - Fixed version with better error handling

const REPLICATE_API_TOKEN = import.meta.env.VITE_REPLICATE_API_TOKEN || '';
console.log('Environment variables:', import.meta.env);
console.log('REPLICATE_API_TOKEN:', REPLICATE_API_TOKEN);
console.log('Token length:', REPLICATE_API_TOKEN.length);
console.log('Token format:', REPLICATE_API_TOKEN);
console.log('Token starts with r8_:', REPLICATE_API_TOKEN.startsWith('r8_'));
// Gunakan /api/replicate yang akan di-proxy ke https://api.replicate.com
const API_BASE_URL = 'https://api.replicate.com';

const createPrediction = async (input, model) => {
  try {
    console.log(`Making request to: ${API_BASE_URL}/v1/predictions`);
    console.log('API Token present:', !!REPLICATE_API_TOKEN);
    
    const response = await fetch(`${API_BASE_URL}/v1/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: model,
        input: input
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const prediction = await response.json();
    console.log('Prediction created:', prediction.id);
    return prediction;
  } catch (error) {
    console.error('Error creating prediction:', error);
    throw error;
  }
};

const getPrediction = async (predictionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/predictions/${predictionId}`, {
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const prediction = await response.json();
    return prediction;
  } catch (error) {
    console.error('Error getting prediction:', error);
    throw error;
  }
};

const generateGraniteQuestions = async (topic, difficulty, questionCount) => {
  try {
    // Check if API token is available
    if (!REPLICATE_API_TOKEN || REPLICATE_API_TOKEN === '') {
      throw new Error('API token not found');
    }

    const prompt = `Generate ${questionCount} multiple choice questions about ${topic} with ${difficulty} difficulty. Return only valid JSON in this exact format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0
    }
  ]
}`;

    const model = "ibm-granite/granite-3.0-8b-instruct";
    
    const prediction = await createPrediction({
      prompt: prompt,
      max_tokens: 2000,
      temperature: 0.7
    }, model);

    // Poll for completion
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 30; // 30 detik timeout
    
    while ((result.status === 'starting' || result.status === 'processing') && attempts < maxAttempts) {
      console.log(`Polling attempt ${attempts + 1}, status: ${result.status}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      result = await getPrediction(prediction.id);
      attempts++;
    }

    if (result.status === 'succeeded') {
      const outputText = Array.isArray(result.output) ? result.output.join('') : result.output;
      console.log('Raw output:', outputText);
      
      const jsonMatch = outputText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const questionsData = JSON.parse(jsonMatch[0]);
        const questions = questionsData.questions || [];
        console.log('Parsed questions:', questions);
        return questions;
      } else {
        throw new Error('No valid JSON found in response');
      }
    } else if (result.status === 'failed') {
      throw new Error(`Prediction failed: ${result.error || 'Unknown error'}`);
    } else {
      throw new Error(`Prediction timeout or incomplete status: ${result.status}`);
    }
  } catch (error) {
    console.error('Error generating questions with Replicate Granite:', error);
    throw error; // Throw original error, don't wrap it
  }
};

const getFallbackQuestions = (topic, difficulty, questionCount) => {
  console.log(`Using fallback questions for "${topic}" (${difficulty} difficulty, ${questionCount} questions)`);
  
  // Fallback questions berdasarkan topic
  const allFallbackQuestions = {
    'JavaScript Programming': [
      {
        question: "Apa cara yang benar untuk mendeklarasikan variabel di JavaScript ES6?",
        options: ["var myVar;", "let myVar;", "variable myVar;", "declare myVar;"],
        correct: 1
      },
      {
        question: "Method mana yang digunakan untuk menambahkan elemen ke akhir array?",
        options: ["append()", "push()", "add()", "insert()"],
        correct: 1
      },
      {
        question: "Apa yang dilakukan operator '===' di JavaScript?",
        options: ["Assign nilai", "Compare nilai saja", "Compare nilai dan tipe", "Buat variabel baru"],
        correct: 2
      },
      {
        question: "Bagaimana cara membuat arrow function di JavaScript?",
        options: ["function() => {}", "() => {}", "=> function() {}", "arrow() => {}"],
        correct: 1
      },
      {
        question: "Apa output dari typeof null di JavaScript?",
        options: ["null", "undefined", "object", "boolean"],
        correct: 2
      },
      {
        question: "Method mana yang digunakan untuk mengiterasi array di JavaScript?",
        options: ["for()", "forEach()", "iterate()", "loop()"],
        correct: 1
      },
      {
        question: "Bagaimana cara mengakses property object di JavaScript?",
        options: ["obj->property", "obj.property", "obj::property", "obj#property"],
        correct: 1
      },
      {
        question: "Apa perbedaan antara let dan const di JavaScript?",
        options: ["Tidak ada perbedaan", "let bisa direassign, const tidak", "const bisa direassign, let tidak", "Keduanya sama"],
        correct: 1
      }
    ],
    'Python Programming': [
      {
        question: "Bagaimana cara mendeklarasikan list di Python?",
        options: ["list = []", "list = {}", "list = ()", "list = <>"],
        correct: 0
      },
      {
        question: "Method mana yang digunakan untuk menambahkan elemen ke list?",
        options: ["add()", "append()", "push()", "insert()"],
        correct: 1
      }
    ],
    'default': [
      {
        question: "Pertanyaan umum untuk topik ini?",
        options: ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
        correct: 0
      },
      {
        question: "Pertanyaan kedua untuk topik ini?",
        options: ["Pilihan 1", "Pilihan 2", "Pilihan 3", "Pilihan 4"],
        correct: 1
      },
      {
        question: "Pertanyaan ketiga untuk topik ini?",
        options: ["Jawaban A", "Jawaban B", "Jawaban C", "Jawaban D"],
        correct: 2
      }
    ]
  };

  // Get questions for the topic, or use default
  const topicQuestions = allFallbackQuestions[topic] || allFallbackQuestions['default'];
  
  // Return the requested number of questions
  const selectedQuestions = topicQuestions.slice(0, questionCount);
  
  // If we need more questions than available, repeat some
  while (selectedQuestions.length < questionCount && topicQuestions.length > 0) {
    const remainingNeeded = questionCount - selectedQuestions.length;
    const additionalQuestions = topicQuestions.slice(0, remainingNeeded);
    selectedQuestions.push(...additionalQuestions);
  }

  console.log(`Returning ${selectedQuestions.length} fallback questions`);
  return selectedQuestions;
};

const generateQuestionsWithRetry = async (topic, difficulty, questionCount, maxAttempts = 2) => {
  console.log(`Starting question generation for: ${topic}, ${difficulty}, ${questionCount} questions`);
  
  // Always try fallback first if no API token
  if (!REPLICATE_API_TOKEN || REPLICATE_API_TOKEN === '') {
    console.warn('No API token found, using fallback questions immediately');
    return getFallbackQuestions(topic, difficulty, questionCount);
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Attempt ${attempt} to generate questions via API...`);
      const questions = await generateGraniteQuestions(topic, difficulty, questionCount);
      
      if (questions && Array.isArray(questions) && questions.length > 0) {
        console.log(`Successfully generated ${questions.length} questions via API`);
        return questions;
      } else {
        throw new Error('No valid questions returned from API');
      }
    } catch (error) {
      console.log(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxAttempts) {
        console.log('All API attempts failed, using fallback questions');
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // If all attempts failed, use fallback
  const fallbackQuestions = getFallbackQuestions(topic, difficulty, questionCount);
  
  if (!fallbackQuestions || fallbackQuestions.length === 0) {
    throw new Error('Failed to generate questions and no fallback available');
  }
  
  return fallbackQuestions;
};

export {
  generateQuestionsWithRetry,
  generateGraniteQuestions,
  createPrediction,
  getPrediction,
  getFallbackQuestions
};