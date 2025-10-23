import { ApiProperty } from '@nestjs/swagger';

export class QuizSettings {
  @ApiProperty({ description: 'Settings ID (UUID)' })
  id: string;

  @ApiProperty({ description: 'Quiz ID (UUID)' })
  quiz_id: string;

  @ApiProperty({
    description: 'Lockdown browser mode',
    default: false,
  })
  lockdown_browser: boolean;

  @ApiProperty({
    description: 'Anti-screenshot warning',
    default: false,
  })
  anti_screenshot: boolean;

  @ApiProperty({
    description: 'Disable copy-paste',
    default: false,
  })
  disable_copy_paste: boolean;

  @ApiProperty({
    description: 'Disable right-click',
    default: false,
  })
  disable_right_click: boolean;

  @ApiProperty({
    description: 'Require fullscreen mode',
    default: false,
  })
  require_fullscreen: boolean;

  @ApiProperty({
    description: 'Track tab switches',
    default: true,
  })
  track_tab_switches: boolean;

  @ApiProperty({
    description: 'Track device changes',
    default: true,
  })
  track_device_changes: boolean;

  @ApiProperty({
    description: 'Track IP changes',
    default: true,
  })
  track_ip_changes: boolean;

  @ApiProperty({
    description: 'Tab switch warning threshold',
    default: 3,
  })
  tab_switch_warning_threshold: number;

  @ApiProperty({ description: 'Created at timestamp' })
  created_at: string;
}
