import { z, ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';
export declare const validateRequest: (schema: {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}) => (req: Request, res: Response, next: NextFunction) => void;
export declare const commonSchemas: {
    id: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    pagination: z.ZodObject<{
        page: z.ZodDefault<z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>>;
        limit: z.ZodDefault<z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>>;
        sortBy: z.ZodOptional<z.ZodString>;
        sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        sortOrder: "asc" | "desc";
        sortBy?: string | undefined;
    }, {
        page?: string | undefined;
        limit?: string | undefined;
        sortBy?: string | undefined;
        sortOrder?: "asc" | "desc" | undefined;
    }>;
    search: z.ZodObject<{
        q: z.ZodOptional<z.ZodString>;
        filters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        q?: string | undefined;
        filters?: Record<string, any> | undefined;
    }, {
        q?: string | undefined;
        filters?: Record<string, any> | undefined;
    }>;
};
//# sourceMappingURL=validation.d.ts.map