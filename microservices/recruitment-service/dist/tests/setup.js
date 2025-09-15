"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
process.env.NODE_ENV = 'test';
process.env.PORT = '3004';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_recruitment_db';
process.env.JWT_SECRET = 'test-jwt-secret';
globals_1.jest.setTimeout(30000);
global.console = {
    ...console,
    log: globals_1.jest.fn(),
    debug: globals_1.jest.fn(),
    info: globals_1.jest.fn(),
    warn: globals_1.jest.fn(),
    error: globals_1.jest.fn(),
};
global.fetch = globals_1.jest.fn(() => Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
}));
afterEach(() => {
    globals_1.jest.clearAllMocks();
});
//# sourceMappingURL=setup.js.map