import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { randomBytes } from 'crypto';

export interface GenerateAccessLinkDto {
  quizId: string;
  teacherId: string;
  expiresAt?: string;
  accessCode?: string;
  maxUses?: number;
  requiresAuth?: boolean;
}

export interface ValidateAccessDto {
  token: string;
  accessCode?: string;
  studentId?: string;
}

@Injectable()
export class AccessControlService {
  private readonly logger = new Logger(AccessControlService.name);
  private readonly TOKEN_LENGTH = 32;

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Generate an access link for a quiz
   */
  async generateAccessLink(dto: GenerateAccessLinkDto): Promise<{
    token: string;
    accessLink: string;
    qrCodeData: string;
    expiresAt?: string;
  }> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Verify quiz ownership
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('teacher_id, title, status')
        .eq('quiz_id', dto.quizId)
        .single();

      if (quizError || !quiz) {
        throw new NotFoundException('Quiz not found');
      }

      if (quiz.teacher_id !== dto.teacherId) {
        throw new ForbiddenException('You can only create access links for your own quizzes');
      }

      if (quiz.status !== 'published') {
        throw new BadRequestException('Quiz must be published to generate access links');
      }

      // Generate secure token
      const token = this.generateSecureToken();

      // Create access record
      const { data: accessRecord, error: accessError } = await supabase
        .from('quiz_access_links')
        .insert({
          quiz_id: dto.quizId,
          access_token: token,
          expires_at: dto.expiresAt,
          access_code: dto.accessCode,
          max_uses: dto.maxUses,
          requires_auth: dto.requiresAuth !== false, // Default true
          created_by: dto.teacherId,
        })
        .select()
        .single();

      if (accessError) {
        this.logger.error('Error creating access link:', accessError);
        throw new InternalServerErrorException('Failed to create access link');
      }

      // Generate access link (frontend URL)
      const accessLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/quiz/access/${token}`;

      // QR code data (just the access link for now)
      const qrCodeData = accessLink;

      this.logger.log(`Access link generated for quiz ${dto.quizId}`);

      return {
        token,
        accessLink,
        qrCodeData,
        expiresAt: dto.expiresAt,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Error generating access link:', error);
      throw new InternalServerErrorException('Failed to generate access link');
    }
  }

  /**
   * Validate access token and optionally access code
   */
  async validateAccess(dto: ValidateAccessDto): Promise<{
    isValid: boolean;
    quizId?: string;
    requiresAuth?: boolean;
    reason?: string;
  }> {
    try {
      const supabase = this.supabaseService.getClient();

      // Get access record
      const { data: accessRecord, error: accessError } = await supabase
        .from('quiz_access_links')
        .select('*')
        .eq('access_token', dto.token)
        .single();

      if (accessError || !accessRecord) {
        return {
          isValid: false,
          reason: 'Invalid access token',
        };
      }

      // Check if revoked
      if (accessRecord.is_revoked) {
        return {
          isValid: false,
          reason: 'Access link has been revoked',
        };
      }

      // Check expiration
      if (accessRecord.expires_at) {
        const expiresAt = new Date(accessRecord.expires_at);
        const now = new Date();
        if (now > expiresAt) {
          return {
            isValid: false,
            reason: 'Access link has expired',
          };
        }
      }

      // Check max uses
      if (accessRecord.max_uses && accessRecord.use_count >= accessRecord.max_uses) {
        return {
          isValid: false,
          reason: 'Access link usage limit reached',
        };
      }

      // Check access code if required
      if (accessRecord.access_code && accessRecord.access_code !== dto.accessCode) {
        return {
          isValid: false,
          reason: 'Invalid access code',
        };
      }

      // Check authentication requirement
      if (accessRecord.requires_auth && !dto.studentId) {
        return {
          isValid: false,
          reason: 'Authentication required',
          requiresAuth: true,
        };
      }

      // All checks passed
      return {
        isValid: true,
        quizId: accessRecord.quiz_id,
        requiresAuth: accessRecord.requires_auth,
      };
    } catch (error) {
      this.logger.error('Error validating access:', error);
      return {
        isValid: false,
        reason: 'Access validation failed',
      };
    }
  }

  /**
   * Record access link usage
   */
  async recordAccessUsage(
    token: string,
    studentId: string,
    metadata?: any,
  ): Promise<void> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Get access record
      const { data: accessRecord } = await supabase
        .from('quiz_access_links')
        .select('link_id, quiz_id')
        .eq('access_token', token)
        .single();

      if (!accessRecord) {
        return;
      }

      // Increment use count
      await supabase
        .from('quiz_access_links')
        .update({
          use_count: supabase.rpc('increment', { row_id: accessRecord.link_id }),
          last_used_at: new Date().toISOString(),
        })
        .eq('link_id', accessRecord.link_id);

      // Log access usage
      await supabase.from('quiz_access_logs').insert({
        link_id: accessRecord.link_id,
        quiz_id: accessRecord.quiz_id,
        student_id: studentId,
        accessed_at: new Date().toISOString(),
        metadata,
      });

      this.logger.log(`Access recorded for token ${token} by student ${studentId}`);
    } catch (error) {
      this.logger.error('Error recording access usage:', error);
      // Don't throw - this is logging only
    }
  }

  /**
   * Revoke an access link
   */
  async revokeAccessLink(token: string, teacherId: string): Promise<void> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Get access record and verify ownership
      const { data: accessRecord, error: fetchError } = await supabase
        .from('quiz_access_links')
        .select('link_id, created_by')
        .eq('access_token', token)
        .single();

      if (fetchError || !accessRecord) {
        throw new NotFoundException('Access link not found');
      }

      if (accessRecord.created_by !== teacherId) {
        throw new ForbiddenException('You can only revoke your own access links');
      }

      // Revoke the link
      const { error: revokeError } = await supabase
        .from('quiz_access_links')
        .update({
          is_revoked: true,
          revoked_at: new Date().toISOString(),
        })
        .eq('link_id', accessRecord.link_id);

      if (revokeError) {
        throw new InternalServerErrorException('Failed to revoke access link');
      }

      this.logger.log(`Access link ${token} revoked by teacher ${teacherId}`);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Error revoking access link:', error);
      throw new InternalServerErrorException('Failed to revoke access link');
    }
  }

  /**
   * Get all access links for a quiz
   */
  async getQuizAccessLinks(quizId: string, teacherId: string): Promise<any[]> {
    try {
      const supabase = this.supabaseService.getClient();

      // Verify quiz ownership
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('teacher_id')
        .eq('quiz_id', quizId)
        .single();

      if (quizError || !quiz) {
        throw new NotFoundException('Quiz not found');
      }

      if (quiz.teacher_id !== teacherId) {
        throw new ForbiddenException('You can only view access links for your own quizzes');
      }

      // Get all access links
      const { data: accessLinks, error: linksError } = await supabase
        .from('quiz_access_links')
        .select('*')
        .eq('quiz_id', quizId)
        .order('created_at', { ascending: false });

      if (linksError) {
        throw new InternalServerErrorException('Failed to fetch access links');
      }

      // Enhance with usage statistics
      const enrichedLinks = await Promise.all(
        (accessLinks || []).map(async (link) => {
          const { data: usageLogs } = await supabase
            .from('quiz_access_logs')
            .select('student_id')
            .eq('link_id', link.link_id);

          const uniqueUsers = new Set(usageLogs?.map(log => log.student_id)).size;

          return {
            ...link,
            uniqueUsers,
            accessLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/quiz/access/${link.access_token}`,
          };
        }),
      );

      return enrichedLinks;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Error fetching access links:', error);
      throw new InternalServerErrorException('Failed to fetch access links');
    }
  }

  /**
   * Generate secure random token
   */
  private generateSecureToken(): string {
    return randomBytes(this.TOKEN_LENGTH).toString('hex');
  }

  /**
   * Generate QR code data URL (base64 encoded image)
   */
  async generateQRCode(accessLink: string): Promise<string> {
    try {
      // Using a simple QR code generation approach
      // In production, you might want to use a library like 'qrcode' or similar
      // For now, we'll return the data that can be used by frontend QR libraries

      // Return a data structure that frontend can use to generate QR
      const qrData = {
        type: 'quiz_access',
        url: accessLink,
        format: 'url',
      };

      return JSON.stringify(qrData);
    } catch (error) {
      this.logger.error('Error generating QR code:', error);
      throw new InternalServerErrorException('Failed to generate QR code');
    }
  }
}
