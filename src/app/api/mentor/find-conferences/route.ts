/**
 * Find Conferences API
 * POST /api/mentor/find-conferences - Find relevant conferences for a student's research topic
 *
 * This endpoint searches for academic conferences with upcoming submission deadlines
 * that match the student's research topic.
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Curated list of major AI/ML conferences with typical deadlines
const MAJOR_CONFERENCES = [
  {
    name: 'NeurIPS',
    fullName: 'Conference on Neural Information Processing Systems',
    type: 'Main Conference',
    venue: 'Annual - December',
    topics: ['machine learning', 'deep learning', 'neural networks', 'AI', 'optimization', 'reinforcement learning'],
    url: 'https://neurips.cc',
  },
  {
    name: 'ICML',
    fullName: 'International Conference on Machine Learning',
    type: 'Main Conference',
    venue: 'Annual - July',
    topics: ['machine learning', 'deep learning', 'representation learning', 'optimization'],
    url: 'https://icml.cc',
  },
  {
    name: 'ICLR',
    fullName: 'International Conference on Learning Representations',
    type: 'Main Conference',
    venue: 'Annual - May',
    topics: ['deep learning', 'representation learning', 'neural networks', 'generative models'],
    url: 'https://iclr.cc',
  },
  {
    name: 'ACL',
    fullName: 'Annual Meeting of the Association for Computational Linguistics',
    type: 'Main Conference',
    venue: 'Annual - July',
    topics: ['NLP', 'natural language processing', 'language models', 'LLM', 'text generation', 'transformers'],
    url: 'https://www.aclweb.org/portal/',
  },
  {
    name: 'EMNLP',
    fullName: 'Conference on Empirical Methods in Natural Language Processing',
    type: 'Main Conference',
    venue: 'Annual - December',
    topics: ['NLP', 'natural language processing', 'text mining', 'language understanding'],
    url: 'https://aclanthology.org/venues/emnlp/',
  },
  {
    name: 'NAACL',
    fullName: 'North American Chapter of the ACL',
    type: 'Main Conference',
    venue: 'Annual - June',
    topics: ['NLP', 'natural language processing', 'dialogue systems', 'question answering'],
    url: 'https://naacl.org/',
  },
  {
    name: 'CVPR',
    fullName: 'IEEE/CVF Conference on Reinforcement Learning and Pattern Recognition',
    type: 'Main Conference',
    venue: 'Annual - June',
    topics: ['computer vision', 'image processing', 'visual recognition', 'multimodal', 'vision transformers'],
    url: 'https://cvpr.thecvf.com/',
  },
  {
    name: 'ICCV',
    fullName: 'IEEE/CVF International Conference on Reinforcement Learning',
    type: 'Main Conference',
    venue: 'Biennial - October',
    topics: ['computer vision', '3D vision', 'video understanding', 'visual learning'],
    url: 'https://iccv2023.thecvf.com/',
  },
  {
    name: 'ECCV',
    fullName: 'European Conference on Reinforcement Learning',
    type: 'Main Conference',
    venue: 'Biennial - October',
    topics: ['computer vision', 'image analysis', 'scene understanding'],
    url: 'https://eccv.ecva.net/',
  },
  {
    name: 'AAAI',
    fullName: 'AAAI Conference on Artificial Intelligence',
    type: 'Main Conference',
    venue: 'Annual - February',
    topics: ['artificial intelligence', 'machine learning', 'reasoning', 'planning', 'knowledge representation'],
    url: 'https://aaai.org/conference/aaai/',
  },
  {
    name: 'IJCAI',
    fullName: 'International Joint Conference on Artificial Intelligence',
    type: 'Main Conference',
    venue: 'Annual - August',
    topics: ['artificial intelligence', 'multi-agent systems', 'knowledge reasoning'],
    url: 'https://ijcai.org/',
  },
  {
    name: 'SIGIR',
    fullName: 'ACM SIGIR Conference on Research and Development in Information Retrieval',
    type: 'Main Conference',
    venue: 'Annual - July',
    topics: ['information retrieval', 'search', 'recommendation systems', 'RAG', 'semantic search'],
    url: 'https://sigir.org/',
  },
  {
    name: 'KDD',
    fullName: 'ACM SIGKDD Conference on Knowledge Discovery and Data Mining',
    type: 'Main Conference',
    venue: 'Annual - August',
    topics: ['data mining', 'knowledge discovery', 'machine learning applications'],
    url: 'https://kdd.org/',
  },
  {
    name: 'WWW',
    fullName: 'The Web Conference',
    type: 'Main Conference',
    venue: 'Annual - April',
    topics: ['web mining', 'social networks', 'web search', 'knowledge graphs'],
    url: 'https://www2024.thewebconf.org/',
  },
  {
    name: 'COLING',
    fullName: 'International Conference on Computational Linguistics',
    type: 'Main Conference',
    venue: 'Biennial',
    topics: ['NLP', 'computational linguistics', 'language resources'],
    url: 'https://coling2024.org/',
  },
];

// Workshop tracks that are more accessible for students
const WORKSHOP_TRACKS = [
  {
    name: 'NeurIPS Workshops',
    description: 'Various workshops at NeurIPS covering specialized topics',
    type: 'Workshop',
    topics: ['machine learning', 'deep learning', 'AI safety', 'AI for science'],
    url: 'https://neurips.cc/Conferences/2024/Workshops',
  },
  {
    name: 'ICML Workshops',
    description: 'Specialized workshops at ICML',
    type: 'Workshop',
    topics: ['machine learning', 'optimization', 'theory'],
    url: 'https://icml.cc/Conferences/2024/Workshops',
  },
  {
    name: 'ACL Student Research Workshop',
    description: 'Dedicated workshop for student researchers in NLP',
    type: 'Workshop',
    topics: ['NLP', 'student research', 'language models'],
    url: 'https://www.aclweb.org/',
  },
  {
    name: 'EMNLP Findings',
    description: 'Extended acceptance track for solid work',
    type: 'Findings Track',
    topics: ['NLP', 'language models', 'text processing'],
    url: 'https://aclanthology.org/',
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, researchTopic } = body;

    if (!studentId || !researchTopic) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: studentId and researchTopic' },
        { status: 400 }
      );
    }

    // Use OpenAI to analyze the research topic and find matching conferences
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 2000,
      messages: [
        {
          role: 'system',
          content: 'You are an expert in academic conference matching. Return only valid JSON arrays with no additional text.',
        },
        {
          role: 'user',
          content: `Given a research topic, identify the most relevant conferences and workshops for submission.

Research Topic: "${researchTopic}"

Available Conferences:
${JSON.stringify([...MAJOR_CONFERENCES, ...WORKSHOP_TRACKS], null, 2)}

Task:
1. Analyze the research topic to identify key themes (e.g., NLP, computer vision, reinforcement learning, etc.)
2. Match the topic to the most relevant conferences from the list
3. Rank them by relevance (most relevant first)
4. Include both main conferences AND workshops (workshops are often more accessible for student researchers)

Return a JSON array of the top 6-8 most relevant conferences/workshops with this structure:
[
  {
    "name": "Conference Name",
    "track": "Optional: Specific track or workshop name if applicable",
    "type": "Main Conference | Workshop | Findings Track",
    "venue": "When/Where",
    "deadline": "Estimated deadline period (e.g., 'January 2025', 'Usually September')",
    "daysUntilDeadline": null,
    "description": "1-2 sentences on why this is relevant for the research topic",
    "url": "Conference URL",
    "relevanceScore": 1-10
  }
]

Important:
- Prioritize conferences where the research topic is a STRONG match
- Include at least 2 workshop options (often easier to get published)
- Be specific about why each conference matches the topic
- Return ONLY the JSON array, no other text`
        }
      ]
    });

    // Extract the JSON response
    const textContent = response.choices[0]?.message?.content;
    if (!textContent) {
      throw new Error('No text response from OpenAI');
    }

    let conferences;
    try {
      // Try to parse the response as JSON
      const jsonMatch = textContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        conferences = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not find JSON array in response');
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      console.error('Raw response:', textContent);

      // Fallback: Return a filtered list based on simple keyword matching
      const topicLower = researchTopic.toLowerCase();
      const matchingConferences = [...MAJOR_CONFERENCES, ...WORKSHOP_TRACKS]
        .filter(conf =>
          conf.topics.some(t => topicLower.includes(t) || t.includes(topicLower.split(' ')[0]))
        )
        .slice(0, 6)
        .map(conf => ({
          name: conf.name,
          track: 'fullName' in conf ? conf.fullName : ('description' in conf ? conf.description : ''),
          type: conf.type,
          venue: 'venue' in conf ? conf.venue : 'Various dates',
          deadline: 'Check website for current deadlines',
          daysUntilDeadline: null,
          description: `Relevant for research in ${conf.topics.slice(0, 3).join(', ')}`,
          url: conf.url,
        }));

      conferences = matchingConferences;
    }

    // Sort by relevance score if available
    if (conferences[0]?.relevanceScore) {
      conferences.sort((a: any, b: any) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    }

    return NextResponse.json({
      success: true,
      data: {
        conferences,
        topic: researchTopic,
        searchedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Find conferences API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
