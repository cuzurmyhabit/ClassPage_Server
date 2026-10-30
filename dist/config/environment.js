"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireEnvironment = requireEnvironment;
exports.requireJwtSecret = requireJwtSecret;
function requireEnvironment(name, minimumLength = 1) {
    const value = process.env[name];
    if (!value || value.trim().length < minimumLength) {
        throw new Error(name + ' must be configured (minimum ' + minimumLength + ' characters).');
    }
    return value;
}
function requireJwtSecret() {
    const value = requireEnvironment('JWT_SECRET', 32);
    if (/change[-_ ]?(this|me)|replace[-_ ]?me|your[-_ ]?secret|<[^>]+>/i.test(value)) {
        throw new Error('JWT_SECRET must not be a published example or placeholder.');
    }
    return value;
}
//# sourceMappingURL=environment.js.map