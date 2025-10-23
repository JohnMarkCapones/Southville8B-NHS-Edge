import { NewsCategoriesService } from '../services/news-categories.service';
import { CreateNewsCategoryDto } from '../dto';
export declare class NewsCategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: NewsCategoriesService);
    findAllPublic(): Promise<import("../entities").NewsCategory[]>;
    findBySlugPublic(slug: string): Promise<import("../entities").NewsCategory>;
    findOnePublic(id: string): Promise<import("../entities").NewsCategory>;
    create(createDto: CreateNewsCategoryDto): Promise<import("../entities").NewsCategory>;
    findAll(): Promise<import("../entities").NewsCategory[]>;
    findOne(id: string): Promise<import("../entities").NewsCategory>;
    update(id: string, updateDto: Partial<CreateNewsCategoryDto>): Promise<import("../entities").NewsCategory>;
    remove(id: string): Promise<void>;
}
