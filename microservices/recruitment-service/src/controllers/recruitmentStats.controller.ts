import { Request, Response, NextFunction } from 'express';
import { RecruitmentStatsService } from '../services/recruitmentStats.service';
import { RecruitmentStatsQueryInput } from '../schemas/recruitment.schema';
import { ResponseHelper } from '@hrm/shared';

export class RecruitmentStatsController {
  private recruitmentStatsService: RecruitmentStatsService;

  constructor() {
    this.recruitmentStatsService = new RecruitmentStatsService();
  }

  async getRecruitmentStats(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as RecruitmentStatsQueryInput;
      const stats = await this.recruitmentStatsService.getRecruitmentStats(query);
      
      return ResponseHelper.success(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async getRecruitmentOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as RecruitmentStatsQueryInput;
      const stats = await this.recruitmentStatsService.getRecruitmentStats(query);
      return ResponseHelper.success(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async getFunnelStats(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as RecruitmentStatsQueryInput;
      const stats = await this.recruitmentStatsService.getRecruitmentStats(query);
      return ResponseHelper.success(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async getTimeToHireStats(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as RecruitmentStatsQueryInput;
      const stats = await this.recruitmentStatsService.getRecruitmentStats(query);
      return ResponseHelper.success(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async getSourceEffectiveness(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as RecruitmentStatsQueryInput;
      const stats = await this.recruitmentStatsService.getRecruitmentStats(query);
      return ResponseHelper.success(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentStats(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as RecruitmentStatsQueryInput;
      const stats = await this.recruitmentStatsService.getRecruitmentStats(query);
      return ResponseHelper.success(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async getRecruitmentTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as RecruitmentStatsQueryInput;
      const stats = await this.recruitmentStatsService.getRecruitmentStats(query);
      return ResponseHelper.success(res, stats);
    } catch (error) {
      next(error);
    }
  }
}
