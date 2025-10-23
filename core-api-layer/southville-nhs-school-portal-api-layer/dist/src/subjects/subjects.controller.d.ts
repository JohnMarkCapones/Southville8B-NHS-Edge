import { SubjectsService } from './subjects.service';
import { SubjectQueryDto } from './dto/subject-query.dto';
import { Subject } from './entities/subject.entity';
interface PaginatedResult {
    data: Subject[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class SubjectsController {
    private readonly subjectsService;
    constructor(subjectsService: SubjectsService);
    findAll(query: SubjectQueryDto): Promise<PaginatedResult>;
    findOne(id: string): Promise<Subject>;
}
export {};
