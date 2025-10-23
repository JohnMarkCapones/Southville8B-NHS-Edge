import { GwaService, StudentGwaListResponse } from './gwa.service';
import { CreateGwaDto } from './dto/create-gwa.dto';
import { UpdateGwaDto } from './dto/update-gwa.dto';
export declare class GwaController {
    private readonly gwaService;
    private readonly logger;
    constructor(gwaService: GwaService);
    getAdvisoryStudentsWithGwa(user: any, gradingPeriod: string, schoolYear: string): Promise<StudentGwaListResponse>;
    createGwaEntry(user: any, createGwaDto: CreateGwaDto): Promise<any>;
    updateGwaEntry(user: any, id: string, updateGwaDto: UpdateGwaDto): Promise<any>;
    deleteGwaEntry(user: any, id: string): Promise<{
        message: string;
    }>;
}
