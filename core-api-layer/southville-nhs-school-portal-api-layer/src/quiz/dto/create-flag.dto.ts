import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum FlagType {
  TAB_SWITCH = 'tab_switch',
  COPY_PASTE = 'copy_paste',
  FULLSCREEN_EXIT = 'fullscreen_exit',
  NETWORK_DISCONNECT = 'network_disconnect',
  BROWSER_BACK = 'browser_back',
  DEVICE_CHANGE = 'device_change',
  IP_CHANGE = 'ip_change',
  MULTIPLE_SESSIONS = 'multiple_sessions',
  SUSPICIOUS_TIMING = 'suspicious_timing',
  OTHER = 'other',
}

export class CreateFlagDto {
  @ApiProperty({
    description: 'Type of security flag',
    enum: FlagType,
    example: FlagType.TAB_SWITCH,
  })
  @IsEnum(FlagType)
  @IsNotEmpty()
  flagType: FlagType;

  @ApiPropertyOptional({
    description: 'Additional metadata about the flag',
    example: { tabSwitches: 3, timestamp: '2025-01-07T12:00:00Z' },
  })
  @IsOptional()
  metadata?: any;
}
