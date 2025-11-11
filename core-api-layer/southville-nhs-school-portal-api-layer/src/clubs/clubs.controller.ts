import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { Policies } from '../auth/decorators/policies.decorator';
import { AuthUser } from '../auth/auth-user.decorator';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';
import { ClubsService } from './clubs.service';
import { ClubFormResponsesService } from './services/club-form-responses.service';
import { ClubBenefitsService } from './services/club-benefits.service';
import { ClubFaqsService } from './services/club-faqs.service';
import { R2StorageService } from '../storage/r2-storage/r2-storage.service';
import { CloudflareImagesService } from '../gallery/services/cloudflare-images.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { CreateClubBenefitDto } from './dto/create-club-benefit.dto';
import { UpdateClubBenefitDto } from './dto/update-club-benefit.dto';
import { CreateClubFaqDto } from './dto/create-club-faq.dto';
import { UpdateClubFaqDto } from './dto/update-club-faq.dto';

@ApiTags('clubs')
@Controller('clubs')
export class ClubsController {
  constructor(
    private readonly clubsService: ClubsService,
    private readonly clubFormResponsesService: ClubFormResponsesService,
    private readonly clubBenefitsService: ClubBenefitsService,
    private readonly clubFaqsService: ClubFaqsService,
    private readonly r2StorageService: R2StorageService,
    private readonly cloudflareImagesService: CloudflareImagesService,
  ) {}

  @Post()
  @UseGuards(SupabaseAuthGuard, PoliciesGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new club' })
  @ApiResponse({ status: 201, description: 'Club created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createClubDto: CreateClubDto) {
    return this.clubsService.create(createClubDto);
  }

  @Get('positions')
  @ApiOperation({ summary: 'Get all club positions' })
  @ApiResponse({ status: 200, description: 'Positions retrieved successfully' })
  async getPositions() {
    return this.clubsService.getPositions();
  }

  @Get()
  @ApiOperation({ summary: 'Get all clubs' })
  @ApiResponse({ status: 200, description: 'Clubs retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll() {
    return this.clubsService.findAll();
  }

  @Get('my-applications')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: "Get current user's form responses (their applications)",
  })
  @ApiResponse({
    status: 200,
    description: 'User responses retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyApplications(@AuthUser('id') userId: string) {
    return this.clubFormResponsesService.findUserResponses(userId);
  }

  @Patch('my-applications/:responseId/withdraw')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Withdraw a club application' })
  @ApiResponse({
    status: 200,
    description: 'Application withdrawn successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - application cannot be withdrawn',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async withdrawApplication(
    @Param('responseId') responseId: string,
    @AuthUser('id') userId: string,
  ) {
    return this.clubFormResponsesService.withdrawResponse(responseId, userId);
  }

  @Get(':clubId')
  @ApiOperation({ summary: 'Get club by ID' })
  @ApiResponse({ status: 200, description: 'Club retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Club not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOne(@Param('clubId') clubId: string) {
    return this.clubsService.findOne(clubId);
  }

  @Patch(':clubId')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update club' })
  @ApiResponse({ status: 200, description: 'Club updated successfully' })
  @ApiResponse({ status: 404, description: 'Club not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(
    @Param('clubId') clubId: string,
    @Body() updateClubDto: UpdateClubDto,
  ) {
    return this.clubsService.update(clubId, updateClubDto);
  }

  @Delete(':clubId')
  @UseGuards(SupabaseAuthGuard, PoliciesGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Policies('clubId', 'club.delete')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete club' })
  @ApiResponse({ status: 204, description: 'Club deleted successfully' })
  @ApiResponse({ status: 404, description: 'Club not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(@Param('clubId') clubId: string) {
    await this.clubsService.remove(clubId);
  }

  // Club Management endpoints with PBAC

  @Get(':clubId/members')
  @ApiOperation({ summary: 'Get club members' })
  @ApiResponse({
    status: 200,
    description: 'Club members retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getMembers(@Param('clubId') clubId: string) {
    return this.clubsService.getMembers(clubId);
  }

  @Post(':clubId/members')
  @UseGuards(SupabaseAuthGuard, PoliciesGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Policies('clubId', 'club.manage_members')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add member to club' })
  @ApiResponse({ status: 201, description: 'Member added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async addMember(@Param('clubId') clubId: string, @Body() memberData: any) {
    return this.clubsService.addMember(clubId, memberData);
  }

  @Patch(':clubId/finances')
  @UseGuards(SupabaseAuthGuard, PoliciesGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Policies('clubId', 'club.manage_finances')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update club finances' })
  @ApiResponse({ status: 200, description: 'Finances updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateFinances(
    @Param('clubId') clubId: string,
    @Body() financesData: any,
  ) {
    return this.clubsService.updateFinances(clubId, financesData);
  }

  @Post(':clubId/join')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Join a club' })
  @ApiResponse({ status: 201, description: 'Successfully joined club' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Club not found' })
  async joinClub(
    @Param('clubId') clubId: string,
    @AuthUser() user: SupabaseUser,
  ) {
    return this.clubsService.joinClub(clubId, user);
  }

  // Club Benefits endpoints

  @Get(':clubId/benefits')
  @ApiOperation({ summary: 'Get all benefits for a club' })
  @ApiResponse({
    status: 200,
    description: 'Benefits retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Club not found' })
  async getBenefits(@Param('clubId') clubId: string) {
    return this.clubBenefitsService.findAll(clubId);
  }

  @Get(':clubId/benefits/:benefitId')
  @ApiOperation({ summary: 'Get a single benefit by ID' })
  @ApiResponse({
    status: 200,
    description: 'Benefit retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Benefit not found' })
  async getBenefit(
    @Param('clubId') clubId: string,
    @Param('benefitId') benefitId: string,
  ) {
    return this.clubBenefitsService.findOne(clubId, benefitId);
  }

  @Post(':clubId/benefits')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new benefit for a club' })
  @ApiResponse({ status: 201, description: 'Benefit created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Club not found' })
  async createBenefit(
    @Param('clubId') clubId: string,
    @Body() createBenefitDto: CreateClubBenefitDto,
  ) {
    return this.clubBenefitsService.create(clubId, createBenefitDto);
  }

  @Patch(':clubId/benefits/:benefitId')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a benefit' })
  @ApiResponse({ status: 200, description: 'Benefit updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Benefit not found' })
  async updateBenefit(
    @Param('clubId') clubId: string,
    @Param('benefitId') benefitId: string,
    @Body() updateBenefitDto: UpdateClubBenefitDto,
  ) {
    return this.clubBenefitsService.update(clubId, benefitId, updateBenefitDto);
  }

  @Delete(':clubId/benefits/:benefitId')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a benefit' })
  @ApiResponse({ status: 204, description: 'Benefit deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Benefit not found' })
  async removeBenefit(
    @Param('clubId') clubId: string,
    @Param('benefitId') benefitId: string,
  ) {
    await this.clubBenefitsService.remove(clubId, benefitId);
  }

  // Club FAQs endpoints

  @Get(':clubId/faqs')
  @ApiOperation({ summary: 'Get all FAQs for a club' })
  @ApiResponse({
    status: 200,
    description: 'FAQs retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Club not found' })
  async getFaqs(@Param('clubId') clubId: string) {
    return this.clubFaqsService.findAll(clubId);
  }

  @Get(':clubId/faqs/:faqId')
  @ApiOperation({ summary: 'Get a single FAQ by ID' })
  @ApiResponse({
    status: 200,
    description: 'FAQ retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'FAQ not found' })
  async getFaq(@Param('clubId') clubId: string, @Param('faqId') faqId: string) {
    return this.clubFaqsService.findOne(clubId, faqId);
  }

  @Post(':clubId/faqs')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new FAQ for a club' })
  @ApiResponse({ status: 201, description: 'FAQ created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Club not found' })
  async createFaq(
    @Param('clubId') clubId: string,
    @Body() createFaqDto: CreateClubFaqDto,
  ) {
    return this.clubFaqsService.create(clubId, createFaqDto);
  }

  @Patch(':clubId/faqs/:faqId')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a FAQ' })
  @ApiResponse({ status: 200, description: 'FAQ updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'FAQ not found' })
  async updateFaq(
    @Param('clubId') clubId: string,
    @Param('faqId') faqId: string,
    @Body() updateFaqDto: UpdateClubFaqDto,
  ) {
    return this.clubFaqsService.update(clubId, faqId, updateFaqDto);
  }

  @Delete(':clubId/faqs/:faqId')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a FAQ' })
  @ApiResponse({ status: 204, description: 'FAQ deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'FAQ not found' })
  async removeFaq(
    @Param('clubId') clubId: string,
    @Param('faqId') faqId: string,
  ) {
    await this.clubFaqsService.remove(clubId, faqId);
  }

  // Club Image Upload endpoint
  @Post('upload-image')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload club image to Cloudflare Images' })
  @ApiResponse({
    status: 200,
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example: 'https://imagedelivery.net/<account-hash>/<image-id>/public',
        },
        cf_image_id: { type: 'string', description: 'Cloudflare Images ID' },
        cf_image_url: { type: 'string' },
        fileName: { type: 'string' },
        fileSize: { type: 'number' },
        mimeType: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid image file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async uploadClubImage(@Req() request: any, @AuthUser('id') userId: string) {
    try {
      // Parse multipart data using Fastify
      const parts = request.parts();
      let imageBuffer: Buffer | null = null;
      let imageFilename: string = '';
      let imageMimeType: string = '';

      // Iterate through all parts to find the file
      for await (const part of parts) {
        if (part.type === 'file' && part.fieldname === 'image') {
          const chunks: Buffer[] = [];
          for await (const chunk of part.file) {
            chunks.push(chunk);
          }
          imageBuffer = Buffer.concat(chunks);
          imageFilename = part.filename;
          imageMimeType = part.mimetype;
        }
      }

      if (!imageBuffer || !imageFilename) {
        throw new BadRequestException('No image file provided');
      }

      // Create Express.Multer.File-like object for Cloudflare Images service
      const fileObject = {
        buffer: imageBuffer,
        originalname: imageFilename,
        mimetype: imageMimeType,
        size: imageBuffer.length,
        fieldname: 'image',
        encoding: '7bit',
        destination: '',
        filename: imageFilename,
        path: '',
      } as Express.Multer.File;

      // Upload to Cloudflare Images
      const uploadResult = await this.cloudflareImagesService.uploadImage(
        fileObject,
        {
          uploadedBy: userId,
          context: 'club',
        },
      );

      // Return Cloudflare Images URL and metadata
      return {
        url: uploadResult.cf_image_url,
        cf_image_id: uploadResult.cf_image_id,
        cf_image_url: uploadResult.cf_image_url,
        fileName: imageFilename,
        fileSize: uploadResult.file_size_bytes,
        mimeType: uploadResult.mime_type,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to upload club image: ${error.message || 'Unknown error'}`,
      );
    }
  }
}
