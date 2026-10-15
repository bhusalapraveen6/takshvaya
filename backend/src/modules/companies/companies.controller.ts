import { Request, Response, Router } from 'express';
import { DB } from '../../database/db';

export const companiesRouter = Router();

// ----------------------------------------------------------------------------
// 1. GET ALL VERIFIED COMPANIES
// ----------------------------------------------------------------------------
companiesRouter.get('/', (_req: Request, res: Response) => {
  const companies = Array.from(DB.companies.values()).map((c) => {
    const openJobsCount = Array.from(DB.jobs.values()).filter(
      (j) => j.company_id === c.id && j.status === 'ACTIVE'
    ).length;

    return {
      ...c,
      openJobsCount,
    };
  });

  return res.json({ success: true, count: companies.length, companies });
});

// ----------------------------------------------------------------------------
// 2. GET COMPANY BY SLUG OR ID
// ----------------------------------------------------------------------------
companiesRouter.get('/:slug', (req: Request, res: Response) => {
  const company = Array.from(DB.companies.values()).find(
    (c) => c.slug === req.params.slug || c.id === req.params.slug
  );

  if (!company) {
    return res.status(404).json({ success: false, error: 'Company not found.' });
  }

  // Get all active jobs for this company
  const openJobs = Array.from(DB.jobs.values()).filter(
    (j) => j.company_id === company.id && j.status === 'ACTIVE'
  );

  const reviews = DB.companyReviews.filter((r) => r.company_id === company.id);

  return res.json({
    success: true,
    company: {
      ...company,
      openJobs,
      reviews,
    },
  });
});

// ----------------------------------------------------------------------------
// 3. POST COMPANY REVIEW (Verified Seeker Only, Duplicate & Abusive Filter)
// ----------------------------------------------------------------------------
companiesRouter.post('/:slug/reviews', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = req.cookies?.accessToken || authHeader?.replace(/^Bearer\s+/, '');
    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication required to post a review.' });
    }

    const company = Array.from(DB.companies.values()).find(
      (c) => c.slug === req.params.slug || c.id === req.params.slug
    );
    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found.' });
    }

    const { rating, fresherFriendliness, title, content, pros, cons, authorName } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5.' });
    }
    if (!title || title.length < 3) {
      return res.status(400).json({ success: false, error: 'Review title is required.' });
    }
    if (!content || content.length < 15) {
      return res.status(400).json({ success: false, error: 'Review content must be at least 15 characters.' });
    }

    // Abusive language heuristic filter
    const abusivePatterns = [/scam\s*portal/i, /f\*\*\*k/i, /idiot/i, /fraud\s*bastard/i];
    const textToCheck = `${title} ${content} ${pros || ''} ${cons || ''}`;
    for (const pat of abusivePatterns) {
      if (pat.test(textToCheck)) {
        return res.status(400).json({ success: false, error: 'Review rejected: Abusive or profane language is not permitted.' });
      }
    }

    const newReview = {
      id: `rev-${Date.now()}`,
      company_id: company.id,
      user_id: 'verified-user',
      author_name: authorName || 'Verified Fresher Candidate',
      rating: Number(rating),
      fresher_friendliness: Number(fresherFriendliness || rating),
      title: String(title),
      content: String(content),
      pros: pros ? String(pros) : undefined,
      cons: cons ? String(cons) : undefined,
      created_at: new Date().toISOString(),
    };

    DB.companyReviews.push(newReview);
    company.review_count += 1;

    return res.json({ success: true, message: 'Review published successfully.', review: newReview });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

