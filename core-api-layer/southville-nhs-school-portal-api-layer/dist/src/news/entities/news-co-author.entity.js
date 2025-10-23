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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsCoAuthor = void 0;
const typeorm_1 = require("typeorm");
let NewsCoAuthor = class NewsCoAuthor {
    id;
    news_id;
    user_id;
    role;
    added_at;
    added_by;
    user;
    added_by_user;
};
exports.NewsCoAuthor = NewsCoAuthor;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], NewsCoAuthor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: false }),
    __metadata("design:type", String)
], NewsCoAuthor.prototype, "news_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: false }),
    __metadata("design:type", String)
], NewsCoAuthor.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 100,
        default: 'co-author',
        nullable: false,
    }),
    __metadata("design:type", String)
], NewsCoAuthor.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], NewsCoAuthor.prototype, "added_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], NewsCoAuthor.prototype, "added_by", void 0);
exports.NewsCoAuthor = NewsCoAuthor = __decorate([
    (0, typeorm_1.Entity)('news_co_authors')
], NewsCoAuthor);
//# sourceMappingURL=news-co-author.entity.js.map