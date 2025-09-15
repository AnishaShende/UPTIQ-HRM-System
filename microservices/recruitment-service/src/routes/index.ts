import { Router } from 'express';
import jobPostingRoutes from './jobPosting.routes';
import applicantRoutes from './applicant.routes';
import applicationRoutes from './application.routes';
import recruitmentStatsRoutes from './recruitmentStats.routes';

const router = Router();

// Mount all recruitment routes
router.use('/job-postings', jobPostingRoutes);
router.use('/applicants', applicantRoutes);
router.use('/applications', applicationRoutes);
router.use('/stats', recruitmentStatsRoutes);

export default router;
