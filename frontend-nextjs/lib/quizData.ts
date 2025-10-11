import type { Quiz } from "@/types/quiz"

// Sample quiz data for different subjects and topics
export const SAMPLE_QUIZZES: Quiz[] = [
  {
    id: "1",
    title: "Mathematics - Quadratic Equations",
    description:
      "A comprehensive mathematics quiz featuring all question types to test various skills including quadratic equations, algebra, and mathematical reasoning.",
    timeLimit: 2,
    allowRetake: true,
    showResults: true,
    deliveryMode: "sequential",
    validationSettings: {
      requireAnswerToProgress: true, // Must answer each question to proceed
      requireAllAnswersToSubmit: true, // Must answer all questions to submit
      allowQuestionSkipping: false, // Cannot skip questions
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    questions: [
      // Text-Based Questions Section
      {
        id: "text-1",
        type: "short-answer",
        title: "Solve the quadratic equation: x² - 5x + 6 = 0",
        description: "Enter your answer as two numbers separated by a comma (e.g., 2, 3)",
        required: true,
        placeholder: "Enter your answer...",
        maxLength: 50,
        category: "Algebra - Short Answer",
      },
      {
        id: "text-2",
        type: "paragraph",
        title: "Explain the relationship between the discriminant and the nature of roots in quadratic equations.",
        description:
          "Write a detailed explanation of how the discriminant (b² - 4ac) determines whether roots are real, equal, or complex.",
        required: true,
        placeholder: "Explain the discriminant and its relationship to roots...",
        maxLength: 500,
        category: "Mathematical Reasoning - Extended Response",
      },
      {
        id: "text-3",
        type: "fill-in-blank",
        title: "Complete the quadratic formula.",
        description: "Fill in the missing parts of the quadratic formula.",
        required: true,
        text: "x = {{blank}} ± √({{blank}} - 4ac) / {{blank}}",
        answers: ["-b", "b²", "2a"],
        category: "Formulas - Fill in the Blanks",
      },

      // Multiple Choice Section
      {
        id: "choice-1",
        type: "multiple-choice",
        title: "What is the standard form of a quadratic equation?",
        description: "Select the correct standard form from the options below.",
        required: true,
        options: ["ax + b = 0", "ax² + bx + c = 0", "ax³ + bx² + cx + d = 0", "ax + by = c"],
        correctAnswer: 1,
        category: "Fundamentals - Single Choice",
      },
      {
        id: "choice-2",
        type: "checkbox",
        title: "Which of the following are methods to solve quadratic equations?",
        description: "Select all correct methods.",
        required: true,
        options: [
          "Factoring",
          "Quadratic Formula",
          "Completing the Square",
          "Linear Substitution",
          "Graphing",
          "Cross Multiplication",
        ],
        correctAnswers: [0, 1, 2, 4],
        category: "Solution Methods - Multiple Selection",
      },
      {
        id: "choice-3",
        type: "dropdown",
        title: "If the discriminant is negative, what can we say about the roots?",
        description: "Choose the correct description from the dropdown.",
        required: true,
        options: [
          "Two real and equal roots",
          "Two real and distinct roots",
          "Two complex conjugate roots",
          "One real root",
        ],
        correctAnswer: 2,
        category: "Discriminant Analysis - Dropdown Selection",
      },

      // Scale and Boolean Questions
      {
        id: "scale-1",
        type: "linear-scale",
        title: "How confident are you in solving quadratic equations using the quadratic formula?",
        description: "Rate your confidence level from 1 (not confident) to 5 (very confident).",
        required: true,
        minValue: 1,
        maxValue: 5,
        minLabel: "Not Confident",
        maxLabel: "Very Confident",
        category: "Self-Assessment - Rating Scale",
      },
      {
        id: "bool-1",
        type: "true-false",
        title: "Every quadratic equation has exactly two solutions.",
        description: "Determine if this statement is true or false.",
        required: true,
        correctAnswer: false,
        category: "Mathematical Concepts - True/False",
      },

      // Interactive Question Types
      {
        id: "drag-1",
        type: "drag-and-drop",
        title: "Arrange the steps to solve x² - 4x + 3 = 0 by factoring:",
        description: "Drag and drop the steps in the correct order to solve the equation.",
        required: true,
        items: [
          "Factor: (x - 1)(x - 3) = 0",
          "Identify: x² - 4x + 3 = 0",
          "Set each factor to zero: x - 1 = 0, x - 3 = 0",
          "Find factors of 3 that add to -4",
          "Solutions: x = 1, x = 3",
        ],
        correctOrder: [1, 3, 0, 2, 4],
        category: "Problem Solving - Sequencing",
      },
      {
        id: "match-1",
        type: "matching-pair",
        title: "Match each quadratic equation with its factored form:",
        description: "Connect each equation to its correct factored form.",
        required: true,
        pairs: [
          { id: "eq1", left: "x² - 5x + 6 = 0", right: "(x - 2)(x - 3) = 0" },
          { id: "eq2", left: "x² - 4 = 0", right: "(x - 2)(x + 2) = 0" },
          { id: "eq3", left: "x² + 4x + 4 = 0", right: "(x + 2)² = 0" },
          { id: "eq4", left: "x² - 1 = 0", right: "(x - 1)(x + 1) = 0" },
        ],
        category: "Factoring - Matching",
      },
      {
        id: "order-1",
        type: "ordering",
        title: "Arrange these quadratic equations from simplest to most complex:",
        description: "Order these equations based on their complexity to solve.",
        required: true,
        items: ["x² = 16", "x² - 4x = 0", "x² - 5x + 6 = 0", "2x² - 3x - 5 = 0"],
        correctOrder: [0, 1, 2, 3],
        category: "Complexity Analysis - Ordering",
      },

      // Grid-Based Questions
      {
        id: "grid-1",
        type: "multiple-choice-grid",
        title: "For each quadratic equation, identify the number of real solutions:",
        description: "Select the correct number of real solutions for each equation.",
        required: true,
        rows: [
          { id: "eq1", label: "x² - 4x + 4 = 0" },
          { id: "eq2", label: "x² - 2x + 5 = 0" },
          { id: "eq3", label: "x² - 3x + 2 = 0" },
          { id: "eq4", label: "x² - 6x + 9 = 0" },
        ],
        columns: [
          { id: "zero", label: "0 real solutions" },
          { id: "one", label: "1 real solution" },
          { id: "two", label: "2 real solutions" },
        ],
        correctAnswers: {
          eq1: "one",
          eq2: "zero",
          eq3: "two",
          eq4: "one",
        },
        category: "Solution Analysis - Grid Matching",
      },
      {
        id: "grid-2",
        type: "checkbox-grid",
        title: "Which solution methods work best for each type of quadratic equation?",
        description: "Check all appropriate solution methods for each equation type.",
        required: true,
        rows: [
          { id: "perfect", label: "Perfect Square Trinomials" },
          { id: "factorable", label: "Easily Factorable" },
          { id: "complex", label: "Complex Coefficients" },
        ],
        columns: [
          { id: "factoring", label: "Factoring" },
          { id: "formula", label: "Quadratic Formula" },
          { id: "completing", label: "Completing Square" },
          { id: "graphing", label: "Graphing" },
        ],
        correctAnswers: {
          perfect: ["factoring", "formula", "completing"],
          factorable: ["factoring", "formula", "graphing"],
          complex: ["formula", "completing"],
        },
        category: "Method Selection - Multiple Grid Selection",
      },
    ],
  },
  {
    id: "2",
    title: "Mathematics - Quadratic Equations",
    description: "Test your understanding of quadratic equations, factoring, and solving methods.",
    timeLimit: 45,
    allowRetake: true,
    showResults: true,
    deliveryMode: "sequential",
    validationSettings: {
      requireAnswerToProgress: true, // Must answer each question to proceed
      requireAllAnswersToSubmit: false, // Can submit with some unanswered
      allowQuestionSkipping: false, // Cannot skip questions
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    questions: [
      {
        id: "q1",
        type: "multiple-choice",
        title: "What is the standard form of a quadratic equation?",
        description: "Choose the correct standard form.",
        required: true,
        options: ["ax + b = 0", "ax² + bx + c = 0", "ax³ + bx² + cx + d = 0", "ax + by = c"],
        correctAnswer: 1,
      },
      {
        id: "q2",
        type: "short-answer",
        title: "Solve: x² - 5x + 6 = 0",
        description: "Enter your answer as two numbers separated by a comma (e.g., 2, 3)",
        required: true,
        placeholder: "Enter your answer...",
        maxLength: 50,
      },
      {
        id: "q3",
        type: "true-false",
        title: "The discriminant determines the nature of roots in a quadratic equation.",
        description: "True or False?",
        required: true,
        correctAnswer: true,
      },
    ],
  },
  {
    id: "3",
    title: "Science - Photosynthesis Process",
    description: "Learn about the process of photosynthesis and its importance in plant life.",
    timeLimit: 30,
    allowRetake: true,
    showResults: true,
    deliveryMode: "form",
    validationSettings: {
      requireAnswerToProgress: false, // Not applicable for form mode
      requireAllAnswersToSubmit: true, // Must answer all questions to submit
      allowQuestionSkipping: true, // Can skip and return in form mode
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    questions: [
      {
        id: "q1",
        type: "fill-in-blank",
        title: "Complete the photosynthesis equation",
        description: "Fill in the missing components of the photosynthesis process.",
        required: true,
        text: "{{blank}} + {{blank}} + light energy → {{blank}} + oxygen",
        answers: ["carbon dioxide", "water", "glucose"],
      },
      {
        id: "q2",
        type: "multiple-choice",
        title: "Where does photosynthesis primarily occur in plants?",
        description: "Select the correct location.",
        required: true,
        options: ["Roots", "Stems", "Leaves", "Flowers"],
        correctAnswer: 2,
      },
      {
        id: "q3",
        type: "checkbox",
        title: "Which factors affect the rate of photosynthesis?",
        description: "Select all that apply.",
        required: true,
        options: ["Light intensity", "Temperature", "Carbon dioxide concentration", "Soil pH", "Water availability"],
        correctAnswers: [0, 1, 2, 4],
      },
    ],
  },
  {
    id: "4",
    title: "English - Grammar & Syntax",
    description: "Test your knowledge of English grammar rules and sentence structure.",
    timeLimit: 40,
    allowRetake: true,
    showResults: true,
    deliveryMode: "hybrid",
    validationSettings: {
      requireAnswerToProgress: false, // Flexible progression in hybrid mode
      requireAllAnswersToSubmit: true, // Must complete all questions
      allowQuestionSkipping: true, // Can skip and return
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    questions: [
      {
        id: "q1",
        type: "multiple-choice",
        title: "Identify the subject in this sentence: 'The quick brown fox jumps over the lazy dog.'",
        description: "Choose the correct subject.",
        required: true,
        options: ["quick", "fox", "jumps", "dog"],
        correctAnswer: 1,
      },
      {
        id: "q2",
        type: "drag-and-drop",
        title: "Arrange these words to form a grammatically correct sentence:",
        description: "Drag the words to create: 'She reads books every evening.'",
        required: true,
        items: ["evening", "She", "every", "books", "reads"],
        correctOrder: [1, 4, 3, 2, 0],
      },
      {
        id: "q3",
        type: "matching-pair",
        title: "Match each word with its part of speech:",
        description: "Connect each word to its grammatical category.",
        required: true,
        pairs: [
          { id: "run", left: "run", right: "verb" },
          { id: "beautiful", left: "beautiful", right: "adjective" },
          { id: "quickly", left: "quickly", right: "adverb" },
          { id: "house", left: "house", right: "noun" },
        ],
      },
    ],
  },
  {
    id: "5",
    title: "History - World War II",
    description: "Explore major events, figures, and outcomes of World War II.",
    timeLimit: 50,
    allowRetake: true,
    showResults: true,
    deliveryMode: "sequential",
    validationSettings: {
      requireAnswerToProgress: false, // Can proceed without answering
      requireAllAnswersToSubmit: false, // Can submit partial answers
      allowQuestionSkipping: true, // Can skip questions
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    questions: [
      {
        id: "q1",
        type: "ordering",
        title: "Arrange these WWII events in chronological order:",
        description: "Order from earliest to latest.",
        required: true,
        items: ["Pearl Harbor Attack", "Germany invades Poland", "D-Day Normandy Landing", "Atomic bomb on Hiroshima"],
        correctOrder: [1, 0, 2, 3],
      },
      {
        id: "q2",
        type: "multiple-choice-grid",
        title: "Match each leader with their country during WWII:",
        description: "Select the correct country for each leader.",
        required: true,
        rows: [
          { id: "churchill", label: "Winston Churchill" },
          { id: "hitler", label: "Adolf Hitler" },
          { id: "roosevelt", label: "Franklin D. Roosevelt" },
          { id: "stalin", label: "Joseph Stalin" },
        ],
        columns: [
          { id: "uk", label: "United Kingdom" },
          { id: "germany", label: "Germany" },
          { id: "usa", label: "United States" },
          { id: "ussr", label: "Soviet Union" },
        ],
        correctAnswers: {
          churchill: "uk",
          hitler: "germany",
          roosevelt: "usa",
          stalin: "ussr",
        },
      },
    ],
  },
  {
    id: "comprehensive-demo",
    title: "Comprehensive Quiz Demo - All Question Types",
    description: "This quiz demonstrates all available question types in the system.",
    timeLimit: 30,
    allowRetake: true,
    showResults: true,
    deliveryMode: "form",
    validationSettings: {
      requireAnswerToProgress: false, // Not applicable for form mode
      requireAllAnswersToSubmit: false, // Flexible submission for demo
      allowQuestionSkipping: true, // Can skip questions in demo
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    questions: [
      {
        id: "q1",
        type: "short-answer",
        title: "What is the capital of the Philippines?",
        description: "Enter the name of the capital city.",
        required: true,
        placeholder: "Enter city name...",
        maxLength: 50,
      },
      {
        id: "q2",
        type: "paragraph",
        title: "Describe your learning goals for this school year.",
        description: "Write a detailed response about what you hope to achieve.",
        required: true,
        placeholder: "Share your thoughts and aspirations...",
        maxLength: 500,
      },
      {
        id: "q3",
        type: "multiple-choice",
        title: "Which of the following is the largest planet in our solar system?",
        description: "Select the correct answer.",
        required: true,
        options: ["Earth", "Jupiter", "Saturn", "Neptune"],
        correctAnswer: 1,
      },
      {
        id: "q4",
        type: "checkbox",
        title: "Which of these are programming languages? (Select all that apply)",
        description: "Choose all correct options.",
        required: true,
        options: ["JavaScript", "HTML", "Python", "CSS", "Java", "Photoshop"],
        correctAnswers: [0, 2, 4],
      },
      {
        id: "q5",
        type: "dropdown",
        title: "What grade level are you currently in?",
        description: "Select your current grade.",
        required: true,
        options: ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
        correctAnswer: 2,
      },
      {
        id: "q6",
        type: "linear-scale",
        title: "How would you rate your understanding of mathematics?",
        description: "Rate from 1 (poor) to 5 (excellent).",
        required: true,
        minValue: 1,
        maxValue: 5,
        minLabel: "Poor",
        maxLabel: "Excellent",
      },
      {
        id: "q7",
        type: "true-false",
        title: "The Philippines is an archipelago.",
        description: "Choose true or false.",
        required: true,
        correctAnswer: true,
      },
      {
        id: "q8",
        type: "fill-in-blank",
        title: "Complete the sentence about photosynthesis.",
        description: "Fill in the missing words.",
        required: true,
        text: "Plants use {{blank}} and {{blank}} to produce {{blank}} through photosynthesis.",
        answers: ["sunlight", "carbon dioxide", "glucose"],
      },
    ],
  },
  {
    id: "history-wwii-advanced",
    title: "History - World War II",
    description:
      "Comprehensive quiz about World War II with mixed delivery modes: sequential questions, form section, and final sequential questions.",
    timeLimit: 60,
    allowRetake: true,
    showResults: true,
    deliveryMode: "hybrid",
    validationSettings: {
      requireAnswerToProgress: true, // Must answer each question in sequential sections
      requireAllAnswersToSubmit: true, // Must answer all questions to submit
      allowQuestionSkipping: false, // Cannot skip questions in sequential sections
    },
    sections: [
      {
        id: "section-1",
        title: "Early War Events",
        mode: "sequential",
        questionIds: ["wwii-1", "wwii-2", "wwii-3", "wwii-4", "wwii-5"],
      },
      {
        id: "section-2",
        title: "Key Figures and Battles",
        mode: "form",
        questionIds: ["wwii-6", "wwii-7", "wwii-8", "wwii-9", "wwii-10"],
      },
      {
        id: "section-3",
        title: "War's End and Aftermath",
        mode: "sequential",
        questionIds: ["wwii-11", "wwii-12", "wwii-13", "wwii-14", "wwii-15"],
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    questions: [
      // Section 1: Early War Events (Sequential)
      {
        id: "wwii-1",
        type: "ordering",
        title: "Arrange these early WWII events in chronological order:",
        description: "Order from earliest to latest event.",
        required: true,
        items: [
          "Germany invades Poland",
          "Britain and France declare war on Germany",
          "Germany invades Denmark and Norway",
          "Fall of France",
        ],
        correctOrder: [0, 1, 2, 3],
        category: "Early War Timeline",
      },
      {
        id: "wwii-2",
        type: "multiple-choice",
        title: "What event is considered the official start of World War II?",
        description: "Select the event that marked the beginning of WWII.",
        required: true,
        options: [
          "Attack on Pearl Harbor",
          "Germany's invasion of Poland",
          "Germany's invasion of France",
          "The Battle of Britain",
        ],
        correctAnswer: 1,
        category: "War Beginning",
      },
      {
        id: "wwii-3",
        type: "drag-and-drop",
        title: "Match these countries with their initial WWII stance:",
        description: "Drag each country to its correct initial position.",
        required: true,
        items: [
          "United States - Neutral",
          "Soviet Union - Non-aggression pact with Germany",
          "Britain - Declared war on Germany",
          "Italy - Initially neutral, later joined Axis",
        ],
        correctOrder: [0, 1, 2, 3],
        category: "Initial Alliances",
      },
      {
        id: "wwii-4",
        type: "true-false",
        title: "The Blitzkrieg strategy was characterized by slow, methodical advances.",
        description: "Determine if this statement about German military strategy is true or false.",
        required: true,
        correctAnswer: false,
        category: "Military Strategy",
      },
      {
        id: "wwii-5",
        type: "short-answer",
        title: "What does 'Blitzkrieg' mean in English?",
        description: "Provide the English translation of this German military term.",
        required: true,
        placeholder: "Enter the English meaning...",
        maxLength: 50,
        category: "Military Terminology",
      },

      // Section 2: Key Figures and Battles (Form)
      {
        id: "wwii-6",
        type: "multiple-choice-grid",
        title: "Match each leader with their country during WWII:",
        description: "Select the correct country for each wartime leader.",
        required: true,
        rows: [
          { id: "churchill", label: "Winston Churchill" },
          { id: "hitler", label: "Adolf Hitler" },
          { id: "roosevelt", label: "Franklin D. Roosevelt" },
          { id: "stalin", label: "Joseph Stalin" },
          { id: "mussolini", label: "Benito Mussolini" },
        ],
        columns: [
          { id: "uk", label: "United Kingdom" },
          { id: "germany", label: "Germany" },
          { id: "usa", label: "United States" },
          { id: "ussr", label: "Soviet Union" },
          { id: "italy", label: "Italy" },
        ],
        correctAnswers: {
          churchill: "uk",
          hitler: "germany",
          roosevelt: "usa",
          stalin: "ussr",
          mussolini: "italy",
        },
        category: "World Leaders",
      },
      {
        id: "wwii-7",
        type: "checkbox",
        title: "Which of these were major battles on the Eastern Front?",
        description: "Select all battles that occurred between Germany and the Soviet Union.",
        required: true,
        options: [
          "Battle of Stalingrad",
          "Battle of Normandy",
          "Battle of Kursk",
          "Battle of Leningrad",
          "Battle of Midway",
          "Battle of Moscow",
        ],
        correctAnswers: [0, 2, 3, 5],
        category: "Eastern Front Battles",
      },
      {
        id: "wwii-8",
        type: "matching-pair",
        title: "Match each battle with its significance:",
        description: "Connect each major battle to its historical importance.",
        required: true,
        pairs: [
          { id: "stalingrad", left: "Battle of Stalingrad", right: "Turning point on Eastern Front" },
          { id: "midway", left: "Battle of Midway", right: "Decisive Pacific naval victory" },
          { id: "dday", left: "D-Day Normandy", right: "Opening of Western Front in Europe" },
          { id: "britain", left: "Battle of Britain", right: "Prevented German invasion of Britain" },
        ],
        category: "Battle Significance",
      },
      {
        id: "wwii-9",
        type: "fill-in-blank",
        title: "Complete this statement about the Holocaust:",
        description: "Fill in the missing information about this tragic period.",
        required: true,
        text: "The Holocaust was the systematic persecution and murder of approximately {{blank}} million Jews and other minorities by {{blank}} Germany and its collaborators.",
        answers: ["6", "Nazi"],
        category: "Holocaust",
      },
      {
        id: "wwii-10",
        type: "linear-scale",
        title: "How significant was the Battle of Stalingrad in determining the outcome of WWII?",
        description: "Rate the significance from 1 (minor impact) to 5 (decisive turning point).",
        required: true,
        minValue: 1,
        maxValue: 5,
        minLabel: "Minor Impact",
        maxLabel: "Decisive Turning Point",
        category: "Battle Assessment",
      },

      // Section 3: War's End and Aftermath (Sequential)
      {
        id: "wwii-11",
        type: "multiple-choice",
        title: "What event brought the United States fully into World War II?",
        description: "Select the event that ended American neutrality.",
        required: true,
        options: [
          "Germany's invasion of Poland",
          "The Fall of France",
          "The Attack on Pearl Harbor",
          "The Battle of Britain",
        ],
        correctAnswer: 2,
        category: "US Entry",
      },
      {
        id: "wwii-12",
        type: "checkbox-grid",
        title: "Which outcomes resulted from these major conferences?",
        description: "Match each wartime conference with its key decisions.",
        required: true,
        rows: [
          { id: "yalta", label: "Yalta Conference" },
          { id: "potsdam", label: "Potsdam Conference" },
          { id: "tehran", label: "Tehran Conference" },
        ],
        columns: [
          { id: "dday", label: "Planned D-Day invasion" },
          { id: "germany", label: "Divided Germany" },
          { id: "un", label: "Established United Nations" },
          { id: "japan", label: "Demanded Japan's surrender" },
        ],
        correctAnswers: {
          yalta: ["germany", "un"],
          potsdam: ["japan"],
          tehran: ["dday"],
        },
        category: "Wartime Conferences",
      },
      {
        id: "wwii-13",
        type: "paragraph",
        title: "Explain the significance of the atomic bombs dropped on Japan.",
        description: "Discuss the impact of the atomic bombs on ending the war and their long-term consequences.",
        required: true,
        placeholder: "Discuss the military, political, and ethical implications...",
        maxLength: 300,
        category: "Atomic Weapons",
      },
      {
        id: "wwii-14",
        type: "dropdown",
        title: "Which city was NOT bombed with an atomic weapon during WWII?",
        description: "Select the city that was not targeted by atomic bombs.",
        required: true,
        options: ["Hiroshima", "Nagasaki", "Tokyo", "Kokura"],
        correctAnswer: 2,
        category: "Atomic Targets",
      },
      {
        id: "wwii-15",
        type: "ordering",
        title: "Arrange these end-of-war events in chronological order:",
        description: "Order these final events from earliest to latest.",
        required: true,
        items: [
          "Hitler's suicide",
          "Germany's unconditional surrender",
          "Atomic bomb on Hiroshima",
          "Japan's surrender",
        ],
        correctOrder: [0, 1, 2, 3],
        category: "War's End Timeline",
      },
    ],
  },
]

// Function to get quiz by ID
export function getQuizById(id: string): Quiz | undefined {
  return SAMPLE_QUIZZES.find((quiz) => quiz.id === id)
}

// Function to get all available quizzes
export function getAllQuizzes(): Quiz[] {
  return SAMPLE_QUIZZES
}

// Function to get quizzes by subject
export function getQuizzesBySubject(subject: string): Quiz[] {
  return SAMPLE_QUIZZES.filter((quiz) => quiz.title.toLowerCase().includes(subject.toLowerCase()))
}
