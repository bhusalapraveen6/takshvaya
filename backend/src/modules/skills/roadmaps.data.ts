export interface SkillLearningResource {
  title: string;
  provider: string; // e.g., 'freeCodeCamp', 'MDN Web Docs', 'Harvard CS50', 'MIT OpenCourseWare'
  url: string;
  isFree: boolean;
  type: 'COURSE' | 'DOCUMENTATION' | 'PROJECT_TUTORIAL' | 'PRACTICE';
}

export interface SkillRoadmapItem {
  skillName: string;
  category: string;
  estimatedHours: number;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  overview: string;
  learningSteps: string[];
  freeResources: SkillLearningResource[];
  practiceProject: {
    title: string;
    description: string;
  };
}

export const SKILL_ROADMAPS: Record<string, SkillRoadmapItem> = {
  'react': {
    skillName: 'React',
    category: 'Frontend Development',
    estimatedHours: 25,
    difficulty: 'BEGINNER',
    overview: 'Learn modern React with Hooks, Component Lifecycle, State Management, and Virtual DOM fundamentals.',
    learningSteps: [
      'Understand JSX syntax, components, and props',
      'Master essential hooks: useState, useEffect, useMemo, useCallback',
      'Handle forms, controlled inputs, and custom hooks',
      'Integrate REST APIs and manage asynchronous loading/error states',
    ],
    freeResources: [
      {
        title: 'React Official Documentation (Learn React)',
        provider: 'React.dev',
        url: 'https://react.dev/learn',
        isFree: true,
        type: 'DOCUMENTATION',
      },
      {
        title: 'Full React Course 2024 for Beginners',
        provider: 'freeCodeCamp',
        url: 'https://www.freecodecamp.org/news/free-react-course-2024/',
        isFree: true,
        type: 'COURSE',
      },
    ],
    practiceProject: {
      title: 'Fresher Job Application Tracker',
      description: 'Build a Kanban-style job status board with localStorage persistence and filter tags.',
    },
  },
  'typescript': {
    skillName: 'TypeScript',
    category: 'Programming Languages',
    estimatedHours: 20,
    difficulty: 'INTERMEDIATE',
    overview: 'Master static typing, interfaces, generics, and strict compiler configs in modern JavaScript.',
    learningSteps: [
      'Basic types: primitives, unions, literal types, and type aliases',
      'Object interfaces, optional properties, and readonly modifiers',
      'Generics for reusable API clients and utility functions',
      'Strict tsconfig setup and React + TypeScript integration',
    ],
    freeResources: [
      {
        title: 'TypeScript for JavaScript Programmers',
        provider: 'TypeScript Official',
        url: 'https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html',
        isFree: true,
        type: 'DOCUMENTATION',
      },
      {
        title: 'Total TypeScript Beginners Tutorial',
        provider: 'Matt Pocock (Total TypeScript)',
        url: 'https://www.totaltypescript.com/tutorials/beginners-typescript',
        isFree: true,
        type: 'COURSE',
      },
    ],
    practiceProject: {
      title: 'Type-Safe REST API Wrapper',
      description: 'Create an SDK that validates network payloads with Zod and TypeScript interfaces.',
    },
  },
  'next.js': {
    skillName: 'Next.js',
    category: 'Fullstack Frameworks',
    estimatedHours: 20,
    difficulty: 'INTERMEDIATE',
    overview: 'Master Next.js App Router, Server Components (RSC), SSR/SSG, Server Actions, and SEO optimization.',
    learningSteps: [
      'App Router file conventions: page.tsx, layout.tsx, loading.tsx, error.tsx',
      'Client vs Server Components: when to use "use client"',
      'Data fetching with cache revalidation and Server Actions',
      'Metadata API for dynamic OpenGraph and SEO tags',
    ],
    freeResources: [
      {
        title: 'Next.js Official Interactive Learn Course',
        provider: 'Next.js / Vercel',
        url: 'https://nextjs.org/learn',
        isFree: true,
        type: 'COURSE',
      },
    ],
    practiceProject: {
      title: 'Server-Rendered Career Blog',
      description: 'A blog with markdown parsing, static generation, dynamic SEO tags, and fast page loads.',
    },
  },
  'jest': {
    skillName: 'Jest',
    category: 'Testing & QA',
    estimatedHours: 15,
    difficulty: 'BEGINNER',
    overview: 'Learn unit and integration testing with mocks, spies, and snapshot validation.',
    learningSteps: [
      'Test matchers: toBe, toEqual, toThrow, toHaveLength',
      'Asynchronous code testing with promises and async/await',
      'Mocking modules and HTTP requests with jest.mock',
      'React Testing Library integration for component DOM testing',
    ],
    freeResources: [
      {
        title: 'Jest Getting Started Guide',
        provider: 'Jest Docs',
        url: 'https://jestjs.io/docs/getting-started',
        isFree: true,
        type: 'DOCUMENTATION',
      },
    ],
    practiceProject: {
      title: 'Tested Calculator & Form Validator Library',
      description: 'Write a unit test suite reaching 100% branch and function coverage.',
    },
  },
  'sql': {
    skillName: 'SQL',
    category: 'Databases',
    estimatedHours: 25,
    difficulty: 'BEGINNER',
    overview: 'Master relational data querying, multi-table JOINs, subqueries, aggregations, and window functions.',
    learningSteps: [
      'SELECT, WHERE, ORDER BY, GROUP BY, and HAVING clauses',
      'INNER, LEFT, RIGHT, and FULL OUTER JOINs with constraints',
      'Subqueries, CTEs (WITH clause), and CASE statements',
      'Window functions: ROW_NUMBER, RANK, and running sums',
    ],
    freeResources: [
      {
        title: 'SQLBolt Interactive SQL Lessons',
        provider: 'SQLBolt',
        url: 'https://sqlbolt.com/',
        isFree: true,
        type: 'PRACTICE',
      },
      {
        title: 'Harvard CS50 SQL Database Track',
        provider: 'Harvard University',
        url: 'https://cs50.harvard.edu/sql/',
        isFree: true,
        type: 'COURSE',
      },
    ],
    practiceProject: {
      title: 'E-commerce Sales Analytics Queries',
      description: 'Write analytical SQL queries to calculate monthly recurring revenue, churn, and top customers.',
    },
  },
  'python': {
    skillName: 'Python',
    category: 'Programming & Data',
    estimatedHours: 30,
    difficulty: 'BEGINNER',
    overview: 'Learn Python data structures, list comprehensions, object-oriented concepts, and basic data analysis.',
    learningSteps: [
      'Syntax, lists, dictionaries, sets, and tuples',
      'Functions, decorators, and exception handling',
      'Working with files and JSON data',
      'Intro to Pandas and NumPy for tabular calculations',
    ],
    freeResources: [
      {
        title: 'Python for Everybody Specialization (Free Audit)',
        provider: 'University of Michigan / Coursera',
        url: 'https://www.py4e.com/',
        isFree: true,
        type: 'COURSE',
      },
    ],
    practiceProject: {
      title: 'Automated Job Feed Scraper & Formatter',
      description: 'Write a Python script that parses an RSS feed, cleans the text, and exports a CSV.',
    },
  },
  'docker': {
    skillName: 'Docker',
    category: 'DevOps & Infrastructure',
    estimatedHours: 18,
    difficulty: 'BEGINNER',
    overview: 'Containerize web applications with Dockerfiles, multi-stage builds, and Docker Compose.',
    learningSteps: [
      'Containers vs Virtual Machines',
      'Writing efficient multi-stage Dockerfiles for Node.js / Python',
      'Port forwarding, environment variables, and volume mapping',
      'Orchestrating multi-service stacks with docker-compose.yml',
    ],
    freeResources: [
      {
        title: 'Docker for Beginners Tutorial',
        provider: 'freeCodeCamp',
        url: 'https://www.freecodecamp.org/news/what-is-docker-used-for-a-docker-container-tutorial-for-beginners/',
        isFree: true,
        type: 'COURSE',
      },
    ],
    practiceProject: {
      title: 'Fullstack Containerized Stack',
      description: 'Containerize a React frontend, Node backend, and PostgreSQL DB with a single compose command.',
    },
  },
  'figma': {
    skillName: 'Figma',
    category: 'Design & UI/UX',
    estimatedHours: 20,
    difficulty: 'BEGINNER',
    overview: 'Master wireframing, Auto Layout, responsive constraints, and design system component variants.',
    learningSteps: [
      'Frames, vectors, typography, and color styles',
      'Auto Layout: padding, gap, alignment, and hugging vs filling',
      'Components and variants with interactive states (hover, pressed)',
      'High-fidelity prototyping with smart animations',
    ],
    freeResources: [
      {
        title: 'Figma for Beginners Official Video Series',
        provider: 'Figma YouTube',
        url: 'https://www.youtube.com/playlist?list=PLXDU_eVOJTx7QHLShNqIXL1Cgbxj7HlN4',
        isFree: true,
        type: 'COURSE',
      },
    ],
    practiceProject: {
      title: 'Mobile Job Seeker Dashboard',
      description: 'Design a clean 3-screen mobile application following modern Material 3 design guidelines.',
    },
  },
};

// Default fallback generator for uncatalogued skills
export function getRoadmapForSkill(skillName: string): SkillRoadmapItem {
  const normalized = skillName.toLowerCase().trim();
  if (SKILL_ROADMAPS[normalized]) {
    return SKILL_ROADMAPS[normalized];
  }

  return {
    skillName,
    category: 'General Professional Skill',
    estimatedHours: 15,
    difficulty: 'BEGINNER',
    overview: `Fundamental concepts and practical implementation guide for ${skillName}.`,
    learningSteps: [
      `Review ${skillName} official syntax, API, and core concepts`,
      `Complete standard introductory practice exercises`,
      `Implement a working mini-project incorporating ${skillName}`,
      `Review real-world production best practices and code patterns`,
    ],
    freeResources: [
      {
        title: `${skillName} Documentation & Tutorials`,
        provider: 'Developer Community',
        url: `https://www.google.com/search?q=${encodeURIComponent(skillName + ' tutorial free beginner')}`,
        isFree: true,
        type: 'DOCUMENTATION',
      },
    ],
    practiceProject: {
      title: `${skillName} Hands-on Mini Project`,
      description: `Build a small standalone project demonstrating proficient usage of ${skillName}.`,
    },
  };
}
