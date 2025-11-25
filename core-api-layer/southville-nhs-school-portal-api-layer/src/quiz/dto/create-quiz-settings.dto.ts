import {
  IsBoolean,
  IsOptional,
  IsNumber,
  Min,
  IsString,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuizSettingsDto {
  // ================= Security features =================
  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Enable secured quiz mode',
    default: false,
    required: false,
  })
  securedQuiz?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: false,
    description: 'Enable lockdown browser mode',
    default: false,
    required: false,
  })
  quizLockdown?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: false,
    description: 'Enable anti-screenshot warning',
    default: false,
    required: false,
  })
  antiScreenshot?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: false,
    description: 'Disable copy-paste during quiz',
    default: false,
    required: false,
  })
  disableCopyPaste?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: false,
    description: 'Disable right-click during quiz',
    default: false,
    required: false,
  })
  disableRightClick?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: false,
    description: 'Require fullscreen mode during quiz',
    default: false,
    required: false,
  })
  lockdownUi?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: true,
    description: 'Track tab switches',
    default: true,
    required: false,
  })
  trackTabSwitches?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: true,
    description: 'Track device changes',
    default: true,
    required: false,
  })
  trackDeviceChanges?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: true,
    description: 'Track IP address changes',
    default: true,
    required: false,
  })
  trackIpChanges?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @ApiProperty({
    example: 3,
    description: 'Number of tab switches before warning',
    default: 3,
    required: false,
    minimum: 1,
  })
  tabSwitchWarningThreshold?: number;

  // ================= Question pool =================
  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Enable question pool',
    default: false,
    required: false,
  })
  questionPool?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Enable stratified sampling from pool',
    default: false,
    required: false,
  })
  stratifiedSampling?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @ApiProperty({
    description: 'Total questions in the quiz (when pooling)',
    required: false,
    minimum: 1,
  })
  totalQuestions?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @ApiProperty({
    description: 'Pool size (number of available questions)',
    required: false,
    minimum: 1,
  })
  poolSize?: number;

  // ================= Quiz behavior =================
  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Strictly enforce time limit',
    default: false,
    required: false,
  })
  strictTimeLimit?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Enable auto-save of answers',
    default: true,
    required: false,
  })
  autoSave?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Control backtracking behavior at settings level',
    default: false,
    required: false,
  })
  backtrackingControl?: boolean;

  // ================= Visibility =================
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: "Visibility scope: 'assigned'|'public'|'private'",
    default: 'assigned',
    required: false,
  })
  visibility?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Optional access code to join the quiz',
    required: false,
  })
  accessCode?: string;

  @IsOptional()
  @IsEnum(['immediate', 'scheduled'])
  @ApiProperty({
    description: "Publish mode: 'immediate'|'scheduled'",
    default: 'immediate',
    required: false,
  })
  publishMode?: 'immediate' | 'scheduled';
}
