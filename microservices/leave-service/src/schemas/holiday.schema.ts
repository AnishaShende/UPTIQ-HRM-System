import { z } from 'zod';
import { HolidayType } from '@prisma/client';

// Holiday creation schema
export const createHolidaySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  date: z.string().transform((str) => new Date(str)),
  description: z.string().optional(),
  type: z.nativeEnum(HolidayType).default('PUBLIC'),
  isRecurring: z.boolean().default(false),
  locations: z.array(z.string()).default([])
});

// Holiday update schema
export const updateHolidaySchema = createHolidaySchema.partial();

// Holiday query schema
export const holidayQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  search: z.string().optional(),
  type: z.nativeEnum(HolidayType).optional(),
  year: z.string().transform(Number).optional(),
  month: z.string().transform(Number).optional(),
  location: z.string().optional(),
  isActive: z.string().transform((str) => str === 'true').optional()
});

export type CreateHolidayInput = z.infer<typeof createHolidaySchema>;
export type UpdateHolidayInput = z.infer<typeof updateHolidaySchema>;
export type HolidayQueryInput = z.infer<typeof holidayQuerySchema>;
