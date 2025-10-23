"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var QuizCacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizCacheService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
let QuizCacheService = QuizCacheService_1 = class QuizCacheService {
    cacheManager;
    logger = new common_1.Logger(QuizCacheService_1.name);
    DEFAULT_TTL = 300;
    QUIZ_TTL = 600;
    QUESTIONS_TTL = 600;
    ANALYTICS_TTL = 60;
    STUDENT_QUIZZES_TTL = 180;
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
    }
    async getQuiz(quizId) {
        try {
            const key = this.getQuizKey(quizId);
            const cached = await this.cacheManager.get(key);
            if (cached) {
                this.logger.debug(`Cache HIT: ${key}`);
                return cached;
            }
            this.logger.debug(`Cache MISS: ${key}`);
            return null;
        }
        catch (error) {
            this.logger.error('Error getting cached quiz:', error);
            return null;
        }
    }
    async setQuiz(quizId, quiz) {
        try {
            const key = this.getQuizKey(quizId);
            await this.cacheManager.set(key, quiz, this.QUIZ_TTL * 1000);
            this.logger.debug(`Cache SET: ${key}`);
        }
        catch (error) {
            this.logger.error('Error setting quiz cache:', error);
        }
    }
    async getQuizQuestions(quizId) {
        try {
            const key = this.getQuestionsKey(quizId);
            const cached = await this.cacheManager.get(key);
            if (cached) {
                this.logger.debug(`Cache HIT: ${key}`);
                return cached;
            }
            this.logger.debug(`Cache MISS: ${key}`);
            return null;
        }
        catch (error) {
            this.logger.error('Error getting cached questions:', error);
            return null;
        }
    }
    async setQuizQuestions(quizId, questions) {
        try {
            const key = this.getQuestionsKey(quizId);
            await this.cacheManager.set(key, questions, this.QUESTIONS_TTL * 1000);
            this.logger.debug(`Cache SET: ${key}`);
        }
        catch (error) {
            this.logger.error('Error setting questions cache:', error);
        }
    }
    async getQuizSettings(quizId) {
        try {
            const key = this.getSettingsKey(quizId);
            return await this.cacheManager.get(key);
        }
        catch (error) {
            this.logger.error('Error getting cached settings:', error);
            return null;
        }
    }
    async setQuizSettings(quizId, settings) {
        try {
            const key = this.getSettingsKey(quizId);
            await this.cacheManager.set(key, settings, this.DEFAULT_TTL * 1000);
            this.logger.debug(`Cache SET: ${key}`);
        }
        catch (error) {
            this.logger.error('Error setting settings cache:', error);
        }
    }
    async getQuizSections(quizId) {
        try {
            const key = this.getSectionsKey(quizId);
            return await this.cacheManager.get(key);
        }
        catch (error) {
            this.logger.error('Error getting cached sections:', error);
            return null;
        }
    }
    async setQuizSections(quizId, sections) {
        try {
            const key = this.getSectionsKey(quizId);
            await this.cacheManager.set(key, sections, this.DEFAULT_TTL * 1000);
            this.logger.debug(`Cache SET: ${key}`);
        }
        catch (error) {
            this.logger.error('Error setting sections cache:', error);
        }
    }
    async getStudentQuizzes(studentId) {
        try {
            const key = this.getStudentQuizzesKey(studentId);
            const cached = await this.cacheManager.get(key);
            if (cached) {
                this.logger.debug(`Cache HIT: ${key}`);
                return cached;
            }
            this.logger.debug(`Cache MISS: ${key}`);
            return null;
        }
        catch (error) {
            this.logger.error('Error getting cached student quizzes:', error);
            return null;
        }
    }
    async setStudentQuizzes(studentId, quizzes) {
        try {
            const key = this.getStudentQuizzesKey(studentId);
            await this.cacheManager.set(key, quizzes, this.STUDENT_QUIZZES_TTL * 1000);
            this.logger.debug(`Cache SET: ${key}`);
        }
        catch (error) {
            this.logger.error('Error setting student quizzes cache:', error);
        }
    }
    async getAnalytics(quizId) {
        try {
            const key = this.getAnalyticsKey(quizId);
            return await this.cacheManager.get(key);
        }
        catch (error) {
            this.logger.error('Error getting cached analytics:', error);
            return null;
        }
    }
    async setAnalytics(quizId, analytics) {
        try {
            const key = this.getAnalyticsKey(quizId);
            await this.cacheManager.set(key, analytics, this.ANALYTICS_TTL * 1000);
            this.logger.debug(`Cache SET: ${key}`);
        }
        catch (error) {
            this.logger.error('Error setting analytics cache:', error);
        }
    }
    async invalidateQuiz(quizId) {
        try {
            await Promise.all([
                this.cacheManager.del(this.getQuizKey(quizId)),
                this.cacheManager.del(this.getQuestionsKey(quizId)),
                this.cacheManager.del(this.getSettingsKey(quizId)),
                this.cacheManager.del(this.getSectionsKey(quizId)),
                this.cacheManager.del(this.getAnalyticsKey(quizId)),
            ]);
            this.logger.log(`Quiz cache invalidated: ${quizId}`);
        }
        catch (error) {
            this.logger.error('Error invalidating quiz cache:', error);
        }
    }
    async invalidateStudentQuizzes(studentId) {
        try {
            await this.cacheManager.del(this.getStudentQuizzesKey(studentId));
            this.logger.log(`Student quizzes cache invalidated: ${studentId}`);
        }
        catch (error) {
            this.logger.error('Error invalidating student quizzes cache:', error);
        }
    }
    async invalidateAnalytics(quizId) {
        try {
            await this.cacheManager.del(this.getAnalyticsKey(quizId));
            this.logger.log(`Analytics cache invalidated: ${quizId}`);
        }
        catch (error) {
            this.logger.error('Error invalidating analytics cache:', error);
        }
    }
    async clearAll() {
        try {
            this.logger.log('Cache clear not supported in current version');
        }
        catch (error) {
            this.logger.error('Error clearing cache:', error);
        }
    }
    async getCacheStats() {
        try {
            return {
                keys: [],
                size: 0,
            };
        }
        catch (error) {
            this.logger.error('Error getting cache stats:', error);
            return {
                keys: [],
                size: 0,
            };
        }
    }
    getQuizKey(quizId) {
        return `quiz:${quizId}`;
    }
    getQuestionsKey(quizId) {
        return `quiz:${quizId}:questions`;
    }
    getSettingsKey(quizId) {
        return `quiz:${quizId}:settings`;
    }
    getSectionsKey(quizId) {
        return `quiz:${quizId}:sections`;
    }
    getStudentQuizzesKey(studentId) {
        return `student:${studentId}:quizzes`;
    }
    getAnalyticsKey(quizId) {
        return `analytics:${quizId}`;
    }
};
exports.QuizCacheService = QuizCacheService;
exports.QuizCacheService = QuizCacheService = QuizCacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object])
], QuizCacheService);
//# sourceMappingURL=quiz-cache.service.js.map