/**
 * Security Utilities
 * Centralized validation and sanitization functions for security-critical operations
 */

// Security Constants
export const SECURITY_LIMITS = {
    // Transaction limits
    MAX_TRANSACTION_AMOUNT: 1000000000, // R$ 1 bilhão
    MIN_TRANSACTION_AMOUNT: 0.01, // R$ 0,01
    MAX_DESCRIPTION_LENGTH: 500,
    MIN_DESCRIPTION_LENGTH: 1,

    // Category limits
    MAX_CATEGORY_NAME_LENGTH: 50,
    MIN_CATEGORY_NAME_LENGTH: 1,

    // Password requirements
    MIN_PASSWORD_LENGTH: 8,
    PASSWORD_REQUIRE_UPPERCASE: true,
    PASSWORD_REQUIRE_LOWERCASE: true,
    PASSWORD_REQUIRE_NUMBER: true,
    PASSWORD_REQUIRE_SPECIAL: true,

    // User limits
    MAX_NAME_LENGTH: 100,
    MIN_NAME_LENGTH: 2,
} as const;

// Common weak passwords to block
const COMMON_PASSWORDS = [
    'password', '123456', '12345678', 'qwerty', 'abc123',
    'monkey', '1234567', 'letmein', 'trustno1', 'dragon',
    'baseball', 'iloveyou', 'master', 'sunshine', 'ashley',
    'bailey', 'passw0rd', 'shadow', '123123', '654321',
    'superman', 'qazwsx', 'michael', 'football'
];

// Valid transaction types
const VALID_TRANSACTION_TYPES = ['income', 'expense'] as const;
export type TransactionType = typeof VALID_TRANSACTION_TYPES[number];

/**
 * Sanitize user input to prevent XSS and injection attacks
 */
export function sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';

    return input
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .substring(0, 1000); // Hard limit on length
}

/**
 * Validate transaction data before sending to Firestore
 */
export interface TransactionValidation {
    isValid: boolean;
    errors: string[];
}

export function validateTransaction(data: {
    amount: number;
    description: string;
    type: string;
    category: string;
    date: Date;
}): TransactionValidation {
    const errors: string[] = [];

    // Validate amount
    if (typeof data.amount !== 'number' || isNaN(data.amount)) {
        errors.push('Valor deve ser um número válido');
    } else if (data.amount < SECURITY_LIMITS.MIN_TRANSACTION_AMOUNT) {
        errors.push(`Valor mínimo é R$ ${SECURITY_LIMITS.MIN_TRANSACTION_AMOUNT.toFixed(2)}`);
    } else if (data.amount > SECURITY_LIMITS.MAX_TRANSACTION_AMOUNT) {
        errors.push(`Valor máximo é R$ ${SECURITY_LIMITS.MAX_TRANSACTION_AMOUNT.toLocaleString('pt-BR')}`);
    }

    // Validate description
    if (typeof data.description !== 'string' || !data.description.trim()) {
        errors.push('Descrição é obrigatória');
    } else if (data.description.length < SECURITY_LIMITS.MIN_DESCRIPTION_LENGTH) {
        errors.push('Descrição muito curta');
    } else if (data.description.length > SECURITY_LIMITS.MAX_DESCRIPTION_LENGTH) {
        errors.push(`Descrição muito longa (máximo ${SECURITY_LIMITS.MAX_DESCRIPTION_LENGTH} caracteres)`);
    }

    // Validate type
    if (!VALID_TRANSACTION_TYPES.includes(data.type as TransactionType)) {
        errors.push('Tipo de transação inválido');
    }

    // Validate category
    if (typeof data.category !== 'string' || !data.category.trim()) {
        errors.push('Categoria é obrigatória');
    }

    // Validate date
    if (!(data.date instanceof Date) || isNaN(data.date.getTime())) {
        errors.push('Data inválida');
    } else {
        const now = new Date();
        const maxFutureDate = new Date();
        maxFutureDate.setFullYear(now.getFullYear() + 10);

        const minPastDate = new Date();
        minPastDate.setFullYear(now.getFullYear() - 100);

        if (data.date > maxFutureDate) {
            errors.push('Data muito distante no futuro');
        } else if (data.date < minPastDate) {
            errors.push('Data muito distante no passado');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate category data
 */
export interface CategoryValidation {
    isValid: boolean;
    errors: string[];
}

export function validateCategory(data: {
    name: string;
    type: string;
}): CategoryValidation {
    const errors: string[] = [];

    // Validate name
    if (typeof data.name !== 'string' || !data.name.trim()) {
        errors.push('Nome da categoria é obrigatório');
    } else if (data.name.length < SECURITY_LIMITS.MIN_CATEGORY_NAME_LENGTH) {
        errors.push('Nome da categoria muito curto');
    } else if (data.name.length > SECURITY_LIMITS.MAX_CATEGORY_NAME_LENGTH) {
        errors.push(`Nome da categoria muito longo (máximo ${SECURITY_LIMITS.MAX_CATEGORY_NAME_LENGTH} caracteres)`);
    }

    // Validate type
    if (!VALID_TRANSACTION_TYPES.includes(data.type as TransactionType)) {
        errors.push('Tipo de categoria inválido');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate password strength
 */
export interface PasswordValidation {
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong' | 'very-strong';
    score: number; // 0-100
}

export function validatePassword(password: string): PasswordValidation {
    const errors: string[] = [];
    let score = 0;

    // Check minimum length
    if (password.length < SECURITY_LIMITS.MIN_PASSWORD_LENGTH) {
        errors.push(`Senha deve ter no mínimo ${SECURITY_LIMITS.MIN_PASSWORD_LENGTH} caracteres`);
    } else {
        score += 20;
    }

    // Check for uppercase
    if (SECURITY_LIMITS.PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
        errors.push('Senha deve conter pelo menos uma letra maiúscula');
    } else if (/[A-Z]/.test(password)) {
        score += 20;
    }

    // Check for lowercase
    if (SECURITY_LIMITS.PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
        errors.push('Senha deve conter pelo menos uma letra minúscula');
    } else if (/[a-z]/.test(password)) {
        score += 20;
    }

    // Check for number
    if (SECURITY_LIMITS.PASSWORD_REQUIRE_NUMBER && !/[0-9]/.test(password)) {
        errors.push('Senha deve conter pelo menos um número');
    } else if (/[0-9]/.test(password)) {
        score += 20;
    }

    // Check for special character
    if (SECURITY_LIMITS.PASSWORD_REQUIRE_SPECIAL && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Senha deve conter pelo menos um caractere especial (!@#$%^&*...)');
    } else if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        score += 20;
    }

    // Check for common passwords
    if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
        errors.push('Senha muito comum. Escolha uma senha mais segura');
        score = Math.min(score, 20);
    }

    // Bonus for length
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;

    // Determine strength
    let strength: PasswordValidation['strength'] = 'weak';
    if (score >= 80) strength = 'very-strong';
    else if (score >= 60) strength = 'strong';
    else if (score >= 40) strength = 'medium';

    return {
        isValid: errors.length === 0,
        errors,
        strength,
        score: Math.min(100, score)
    };
}

/**
 * Validate user name
 */
export function validateUserName(name: string): { isValid: boolean; error?: string } {
    if (typeof name !== 'string' || !name.trim()) {
        return { isValid: false, error: 'Nome é obrigatório' };
    }

    if (name.length < SECURITY_LIMITS.MIN_NAME_LENGTH) {
        return { isValid: false, error: 'Nome muito curto' };
    }

    if (name.length > SECURITY_LIMITS.MAX_NAME_LENGTH) {
        return { isValid: false, error: `Nome muito longo (máximo ${SECURITY_LIMITS.MAX_NAME_LENGTH} caracteres)` };
    }

    return { isValid: true };
}

/**
 * Parse amount string to number safely
 */
export function parseAmount(amountStr: string): number | null {
    if (typeof amountStr !== 'string') return null;

    // Support Brazilian format: "1.234,56" -> 1234.56
    const normalized = amountStr
        .replace(/\./g, '') // Remove thousand separators
        .replace(',', '.'); // Replace decimal comma with dot

    const parsed = parseFloat(normalized);

    if (isNaN(parsed)) return null;

    return parsed;
}

/**
 * Format error message for user display (hide technical details)
 */
export function formatUserError(error: unknown): string {
    // Never expose technical details to users
    if (error instanceof Error) {
        // Map Firebase error codes to user-friendly messages
        const message = error.message.toLowerCase();

        if (message.includes('auth/user-not-found') || message.includes('auth/wrong-password')) {
            return 'Email ou senha incorretos';
        }
        if (message.includes('auth/email-already-in-use')) {
            return 'Este email já está cadastrado';
        }
        if (message.includes('auth/weak-password')) {
            return 'Senha muito fraca. Use uma senha mais forte';
        }
        if (message.includes('auth/invalid-email')) {
            return 'Email inválido';
        }
        if (message.includes('auth/too-many-requests')) {
            return 'Muitas tentativas. Tente novamente mais tarde';
        }
        if (message.includes('permission-denied')) {
            return 'Você não tem permissão para realizar esta ação';
        }
        if (message.includes('network')) {
            return 'Erro de conexão. Verifique sua internet';
        }
    }

    // Generic error message
    return 'Ocorreu um erro. Tente novamente';
}
