import crypto from 'crypto';

export interface ParsedResumeResult {
  detectedSkills: string[];
  degree?: string;
  branch?: string;
  graduationYear?: number;
  cgpaOrPercentage?: number;
  cleanTextPreview: string;
  securityStatus: {
    passedValidation: boolean;
    magicBytesValid: boolean;
    maliciousContentDetected: boolean;
    sanitizedFilename: string;
  };
}

const COMMON_SKILL_KEYWORDS = [
  'React', 'JavaScript', 'TypeScript', 'Node.js', 'Express', 'HTML', 'CSS', 'Tailwind CSS',
  'Next.js', 'Redux', 'Vue.js', 'Angular', 'Python', 'Django', 'Flask', 'FastAPI',
  'Java', 'Spring Boot', 'C', 'C++', 'C#', '.NET', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB',
  'Redis', 'Git', 'GitHub', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Linux',
  'Bash', 'CI/CD', 'Jest', 'Playwright', 'Figma', 'UI Design', 'Wireframing',
  'AutoCAD', 'SolidWorks', 'MATLAB', 'CATIA', 'Thermodynamics', 'Tableau', 'Power BI',
  'Excel', 'Pandas', 'NumPy', 'Machine Learning', 'Data Analysis', 'SEO', 'Content Writing',
  'Google Analytics', 'HR Fundamentals', 'Campus Recruitment', 'Clinical Data Management'
];

export class ResumeParserService {
  // 1. Magic byte inspection (Security defense against renamed executables)
  static verifyFileSafety(buffer: Buffer, originalFilename: string): { isValid: boolean; reason?: string } {
    // Check 5MB limit
    if (buffer.length > 5 * 1024 * 1024) {
      return { isValid: false, reason: 'File exceeds maximum allowed size of 5 MB.' };
    }

    if (buffer.length < 4) {
      return { isValid: false, reason: 'File is empty or corrupt.' };
    }

    const headerHex = buffer.subarray(0, 4).toString('hex');
    const headerAscii = buffer.subarray(0, 5).toString('ascii');

    // PDF magic bytes: %PDF- (25 50 44 46)
    const isPDF = headerAscii.startsWith('%PDF-');
    // DOCX / ZIP magic bytes: PK\x03\x04 (50 4b 03 04)
    const isDOCX = headerHex === '504b0304';

    if (!isPDF && !isDOCX) {
      return {
        isValid: false,
        reason: 'Invalid file format. Uploaded file magic bytes do not match a legitimate PDF or DOCX document.',
      };
    }

    // Heuristic scan for embedded executable payloads
    const asciiContent = buffer.subarray(0, Math.min(buffer.length, 65536)).toString('ascii');
    if (
      asciiContent.includes('/Launch') || // PDF Launch actions (common exploit)
      asciiContent.includes('/EmbeddedFiles') ||
      asciiContent.includes('cmd.exe') ||
      asciiContent.includes('/bin/sh')
    ) {
      return {
        isValid: false,
        reason: 'Security threat detected: File contains disallowed embedded scripts or launch actions.',
      };
    }

    return { isValid: true };
  }

  // 2. Parse text content from buffer or mock text
  static parseResumeContent(text: string, originalFilename: string): ParsedResumeResult {
    const detectedSkills: string[] = [];
    const lowerText = text.toLowerCase();

    for (const skill of COMMON_SKILL_KEYWORDS) {
      const escaped = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(lowerText)) {
        detectedSkills.push(skill);
      }
    }

    // Detect Degree
    let detectedDegree: string | undefined;
    if (/\b(b\.?tech|bachelor of technology)\b/i.test(text)) detectedDegree = 'B.Tech';
    else if (/\b(b\.?e|bachelor of engineering)\b/i.test(text)) detectedDegree = 'B.E';
    else if (/\b(bca|bachelor of computer applications)\b/i.test(text)) detectedDegree = 'BCA';
    else if (/\b(mca|master of computer applications)\b/i.test(text)) detectedDegree = 'MCA';
    else if (/\b(b\.?sc|bachelor of science)\b/i.test(text)) detectedDegree = 'B.Sc';
    else if (/\b(b\.?com|bachelor of commerce)\b/i.test(text)) detectedDegree = 'B.Com';
    else if (/\b(bba|bachelor of business administration)\b/i.test(text)) detectedDegree = 'BBA';
    else if (/\b(b\.?des|bachelor of design)\b/i.test(text)) detectedDegree = 'B.Des';

    // Detect Graduation Year (looking for 2018 - 2027)
    let graduationYear: number | undefined;
    const yearMatch = text.match(/\b(201[8-9]|202[0-7])\b/);
    if (yearMatch) {
      graduationYear = parseInt(yearMatch[0], 10);
    }

    // Detect CGPA / Percentage
    let cgpaOrPercentage: number | undefined;
    const cgpaMatch = text.match(/(?:cgpa|gpa|score)[:\s]*([0-9]\.[0-9]{1,2})/i);
    if (cgpaMatch) {
      cgpaOrPercentage = parseFloat(cgpaMatch[1]);
    } else {
      const percentMatch = text.match(/([5-9][0-9](?:\.[0-9]+)?)\s*%/);
      if (percentMatch) {
        cgpaOrPercentage = parseFloat(percentMatch[1]);
      }
    }

    // Detect Branch
    let branch: string | undefined;
    if (/computer\s*science|cse|information\s*technology|it\b/i.test(text)) {
      branch = 'Computer Science';
    } else if (/mechanical|automobile/i.test(text)) {
      branch = 'Mechanical';
    } else if (/electronics|ece|electrical/i.test(text)) {
      branch = 'Electronics';
    } else if (/finance|commerce|accounting/i.test(text)) {
      branch = 'Finance';
    } else if (/design|fine arts/i.test(text)) {
      branch = 'Design';
    }

    const sanitizedFilename = `resumes/${crypto.randomUUID()}-${originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    return {
      detectedSkills,
      degree: detectedDegree,
      branch,
      graduationYear,
      cgpaOrPercentage,
      cleanTextPreview: text.slice(0, 300).trim(),
      securityStatus: {
        passedValidation: true,
        magicBytesValid: true,
        maliciousContentDetected: false,
        sanitizedFilename,
      },
    };
  }
}
