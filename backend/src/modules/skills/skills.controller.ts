import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { SkillsService } from './skills.service';
import { ResumeParserService } from './resume-parser.service';
import { getRoadmapForSkill } from './roadmaps.data';
import { requireAuth, AuthenticatedRequest } from '../../security/middleware';

export const skillsRouter = Router();

// ----------------------------------------------------------------------------
// 1. MATCH SCORE & GAP ANALYSIS FOR A JOB
// ----------------------------------------------------------------------------
skillsRouter.get('/match/:jobId', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const analysis = SkillsService.analyzeCandidateForJob(req.user!.id, req.params.jobId);
    return res.json({ success: true, analysis });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 2. PARSE RESUME (PDF / DOCX With Magic Byte Validation)
// ----------------------------------------------------------------------------
const parseResumeTextSchema = z.object({
  resumeText: z.string().min(20),
  filename: z.string().default('resume.pdf'),
});

skillsRouter.post('/parse-resume', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const parseResult = parseResumeTextSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Resume text is required for parsing.',
        details: parseResult.error.flatten(),
      });
    }

    const { resumeText, filename } = parseResult.data;

    // Run Parser Engine
    const parsed = ResumeParserService.parseResumeContent(resumeText, filename);

    // Auto-update candidate profile with detected data
    const updates: any = {
      skills: Array.from(new Set(parsed.detectedSkills)),
      resume_storage_key: parsed.securityStatus.sanitizedFilename,
      resume_original_name: filename,
      resume_parsed_text: parsed.cleanTextPreview,
    };
    if (parsed.degree) updates.degree = parsed.degree;
    if (parsed.branch) updates.branch = parsed.branch;
    if (parsed.graduationYear) updates.graduation_year = parsed.graduationYear;
    if (parsed.cgpaOrPercentage) updates.cgpa_or_percentage = parsed.cgpaOrPercentage;

    const updatedProfile = SkillsService.updateCandidateProfile(req.user!.id, updates);

    return res.json({
      success: true,
      message: 'Resume parsed and candidate profile updated successfully.',
      parsed,
      updatedProfile,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 3. FETCH DETAILED ROADMAP FOR A SKILL
// ----------------------------------------------------------------------------
skillsRouter.get('/roadmaps/:skill', (req: Request, res: Response) => {
  const roadmap = getRoadmapForSkill(req.params.skill);
  return res.json({ success: true, roadmap });
});

// ----------------------------------------------------------------------------
// 4. UPDATE CANDIDATE PROFILE SKILLS & EDUCATION
// ----------------------------------------------------------------------------
const updateProfileSchema = z.object({
  headline: z.string().optional(),
  degree: z.string().optional(),
  branch: z.string().optional(),
  institution_name: z.string().optional(),
  graduation_year: z.number().int().min(2018).max(2030).optional(),
  cgpa_or_percentage: z.number().min(0).max(100).optional(),
  skills: z.array(z.string()).optional(),
  preferred_locations: z.array(z.string()).optional(),
  preferred_roles: z.array(z.string()).optional(),
  min_expected_salary: z.number().optional(),
});

skillsRouter.put('/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const parseResult = updateProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid profile data.',
        details: parseResult.error.flatten(),
      });
    }

    const updated = SkillsService.updateCandidateProfile(req.user!.id, parseResult.data as any);
    return res.json({ success: true, message: 'Profile updated successfully.', profile: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
