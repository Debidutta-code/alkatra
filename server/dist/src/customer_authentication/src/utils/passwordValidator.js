"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidPassword = void 0;
const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};
exports.isValidPassword = isValidPassword;
//# sourceMappingURL=passwordValidator.js.map