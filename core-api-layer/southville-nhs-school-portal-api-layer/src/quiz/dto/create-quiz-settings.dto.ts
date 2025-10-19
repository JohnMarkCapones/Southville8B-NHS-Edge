import { IsBoolean, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuizSettingsDto {
  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: false,
    description: 'Enable lockdown browser mode',
    default: false,
    required: false,
  })
  lockdownBrowser?: boolean;

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
  requireFullscreen?: boolean;

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
}
