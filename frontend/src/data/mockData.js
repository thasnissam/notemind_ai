export const mockNotes = [
  {
    id: 1,
    title: 'Deep Work: Rules for Focused Success',
    preview: 'The ability to perform deep work is becoming increasingly rare at exactly the same time it is becoming increasingly valuable in our economy.',
    tag: 'productivity',
    type: 'pdf',
    space: 'Reading',
    date: '2024-01-12',
    pages: 304,
  },
  {
    id: 2,
    title: 'Attention Mechanism in Transformers',
    preview: 'Self-attention allows the model to weigh the importance of different words in a sequence when making predictions, regardless of their distance.',
    tag: 'ai-research',
    type: 'url',
    space: 'Research',
    date: '2024-01-14',
    source: 'arxiv.org',
  },
  {
    id: 3,
    title: 'Second Brain methodology',
    preview: 'CODE: Capture, Organize, Distill, Express. A system for saving and systematically reminding us of the ideas, inspirations, insights.',
    tag: 'productivity',
    type: 'note',
    space: 'Personal',
    date: '2024-01-15',
  },
  {
    id: 4,
    title: 'The Lean Startup — Key Takeaways',
    preview: 'Build-Measure-Learn feedback loop is the core of the Lean Startup method. Validated learning through rapid experimentation.',
    tag: 'business',
    type: 'pdf',
    space: 'Reading',
    date: '2024-01-16',
    pages: 299,
  },
  {
    id: 5,
    title: 'Vector Databases: A Primer',
    preview: 'Vector databases store high-dimensional vectors enabling semantic search, recommendation engines, and AI-powered similarity queries.',
    tag: 'ai-research',
    type: 'url',
    space: 'Research',
    date: '2024-01-17',
    source: 'pinecone.io',
  },
  {
    id: 6,
    title: 'Morning Reflection — Jan 2024',
    preview: 'Consistency compounds. The small daily rituals create the most significant long-term outcomes. Focus on systems not goals.',
    tag: 'personal',
    type: 'note',
    space: 'Personal',
    date: '2024-01-18',
  },
  {
    id: 7,
    title: 'React Server Components Explained',
    preview: 'RSCs allow components to render on the server, reducing client bundle size and enabling direct database access without APIs.',
    tag: 'dev',
    type: 'url',
    space: 'Research',
    date: '2024-01-19',
    source: 'react.dev',
  },
  {
    id: 8,
    title: 'Thinking, Fast and Slow — Notes',
    preview: "System 1 operates automatically and quickly, with little or no effort. System 2 allocates attention to effortful mental activities.",
    tag: 'psychology',
    type: 'pdf',
    space: 'Reading',
    date: '2024-01-20',
    pages: 499,
  },
]

export const mockSpaces = ['All', 'Reading', 'Research', 'Personal']

export const mockTags = ['productivity', 'ai-research', 'business', 'personal', 'dev', 'psychology']

export const mockMessages = [
  {
    id: 1,
    role: 'user',
    content: 'Summarize my notes on Deep Work',
  },
  {
    id: 2,
    role: 'assistant',
    content: "Based on your saved notes on **Deep Work** by Cal Newport, here are the key insights:\n\n**Core concept**: Deep work is professional activity performed in a state of distraction-free concentration that pushes your cognitive capabilities to their limit.\n\n**The Two Types of Work:**\n- Deep Work — cognitively demanding, high-value tasks requiring full concentration\n- Shallow Work — logistical tasks, often performed while distracted\n\n**Key Rules Newport proposes:**\n1. Work deeply by scheduling uninterrupted blocks\n2. Embrace boredom — resist constant stimulation\n3. Quit social media (or use it with intention)\n4. Drain the shallows — minimize low-value tasks\n\nThe central argument is that in the knowledge economy, the ability to master hard things quickly and produce at an elite level is the competitive edge.",
    sources: ['Deep Work: Rules for Focused Success', 'Second Brain methodology'],
    insights: 'This connects with your Second Brain notes — both emphasize intentional information architecture.',
  },
]

export const mockSuggestedQuestions = [
  'Summarize my notes',
  'Show my saved research papers',
  'What are the key themes across my reading?',
  'Find notes about AI and machine learning',
  'What did I save last week?',
]
