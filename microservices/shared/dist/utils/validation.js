"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonSchemas = exports.validateRequest = void 0;
const zod_1 = require("zod");
const errors_1 = require("../errors");
const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            if (schema.body) {
                req.body = schema.body.parse(req.body);
            }
            if (schema.query) {
                req.query = schema.query.parse(req.query);
            }
            if (schema.params) {
                req.params = schema.params.parse(req.params);
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const validationErrors = error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                }));
                throw new errors_1.ValidationError('Validation failed', validationErrors);
            }
            throw error;
        }
    };
};
exports.validateRequest = validateRequest;
// Common validation schemas
exports.commonSchemas = {
    id: zod_1.z.string().cuid(),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).max(100),
    pagination: zod_1.z.object({
        page: zod_1.z.string().transform(val => parseInt(val, 10)).pipe(zod_1.z.number().int().min(1)).optional().default('1'),
        limit: zod_1.z.string().transform(val => parseInt(val, 10)).pipe(zod_1.z.number().int().min(1).max(100)).optional().default('10'),
        sortBy: zod_1.z.string().optional(),
        sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc')
    }),
    search: zod_1.z.object({
        q: zod_1.z.string().optional(),
        filters: zod_1.z.record(zod_1.z.any()).optional()
    })
};
//# sourceMappingURL=validation.js.map