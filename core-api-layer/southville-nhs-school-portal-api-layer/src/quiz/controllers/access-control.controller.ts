import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AccessControlService } from '../services/access-control.service';
import { GenerateAccessLinkDto, ValidateAccessLinkDto } from '../dto/generate-access-link.dto';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PoliciesGuard } from '../../auth/guards/policies.guard';
import { Roles, UserRole } from '../../auth/decorators/roles.decorator';
import { AuthUser } from '../../auth/auth-user.decorator';
import { SupabaseUser } from '../../auth/interfaces/supabase-user.interface';

@ApiTags('Quiz Access Control')
@ApiBearerAuth('JWT-auth')
@Controller('quiz-access')
@UseGuards(SupabaseAuthGuard, PoliciesGuard, RolesGuard)
export class AccessControlController {
  private readonly logger = new Logger(AccessControlController.name);

  constructor(private readonly accessControlService: AccessControlService) {}

  @Post('generate/:quizId')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Generate an access link for a quiz' })
  @ApiResponse({
    status: 201,
    description: 'Access link generated successfully',
    schema: {
      example: {
        token: 'a1b2c3d4e5f6...',
        accessLink: 'http://localhost:3000/quiz/access/a1b2c3d4e5f6...',
        qrCodeData: 'http://localhost:3000/quiz/access/a1b2c3d4e5f6...',
        expiresAt: '2025-01-20T23:59:59Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Teachers and Admins only' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @ApiResponse({ status: 400, description: 'Bad Request - Quiz must be published' })
  async generateAccessLink(
    @Param('quizId') quizId: string,
    @Body() generateDto: GenerateAccessLinkDto,
    @AuthUser() user: SupabaseUser,
  ) {
    this.logger.log(`Generating access link for quiz ${quizId}`);
    return this.accessControlService.generateAccessLink({
      quizId,
      teacherId: user.id,
      expiresAt: generateDto.expiresAt,
      accessCode: generateDto.accessCode,
      maxUses: generateDto.maxUses,
      requiresAuth: generateDto.requiresAuth,
    });
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate an access token (public endpoint)' })
  @ApiResponse({
    status: 200,
    description: 'Access validation result',
    schema: {
      example: {
        isValid: true,
        quizId: 'uuid',
        requiresAuth: true,
      },
    },
  })
  async validateAccess(
    @Body() validateDto: ValidateAccessLinkDto,
    @AuthUser() user?: SupabaseUser,
  ) {
    this.logger.log(`Validating access token`);
    return this.accessControlService.validateAccess({
      token: validateDto.token,
      accessCode: validateDto.accessCode,
      studentId: user?.id,
    });
  }

  @Get('quiz/:quizId/links')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all access links for a quiz' })
  @ApiResponse({
    status: 200,
    description: 'Access links retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Teachers and Admins only' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async getQuizAccessLinks(
    @Param('quizId') quizId: string,
    @AuthUser() user: SupabaseUser,
  ) {
    this.logger.log(`Fetching access links for quiz ${quizId}`);
    return this.accessControlService.getQuizAccessLinks(quizId, user.id);
  }

  @Delete('revoke/:token')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Revoke an access link' })
  @ApiResponse({
    status: 200,
    description: 'Access link revoked successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Teachers and Admins only' })
  @ApiResponse({ status: 404, description: 'Access link not found' })
  async revokeAccessLink(
    @Param('token') token: string,
    @AuthUser() user: SupabaseUser,
  ): Promise<{ message: string }> {
    this.logger.log(`Revoking access link ${token}`);
    await this.accessControlService.revokeAccessLink(token, user.id);
    return { message: 'Access link revoked successfully' };
  }

  @Get('qr/:token')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get QR code data for an access link' })
  @ApiResponse({
    status: 200,
    description: 'QR code data retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getQRCode(@Param('token') token: string) {
    this.logger.log(`Generating QR code for token ${token}`);
    const accessLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/quiz/access/${token}`;
    const qrCodeData = await this.accessControlService.generateQRCode(accessLink);
    return {
      qrCodeData,
      accessLink,
    };
  }
}
