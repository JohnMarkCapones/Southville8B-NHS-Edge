import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AcademicCalendar } from './academic-calendar.entity';
import { AcademicCalendarDay } from './academic-calendar-day.entity';

@Entity('academic_calendar_markers')
export class AcademicCalendarMarker {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'uuid' })
  academic_calendar_id: string;

  @Column({ type: 'bigint', nullable: true })
  academic_calendar_day_id: number;

  @Column({ type: 'varchar', length: 20 })
  color: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  label: string;

  @Column({ type: 'int', default: 0 })
  order_priority: number;

  @CreateDateColumn({
    type: 'timestamp with time zone',
  })
  created_at: Date;

  @ManyToOne(() => AcademicCalendar, (calendar) => calendar.markers)
  @JoinColumn({ name: 'academic_calendar_id' })
  academic_calendar: AcademicCalendar;

  @ManyToOne(() => AcademicCalendarDay, (day) => day.markers)
  @JoinColumn({ name: 'academic_calendar_day_id' })
  academic_calendar_day: AcademicCalendarDay;
}
