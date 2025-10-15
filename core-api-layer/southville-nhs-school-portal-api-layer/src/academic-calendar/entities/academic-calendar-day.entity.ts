import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { AcademicCalendar } from './academic-calendar.entity';
import { AcademicCalendarMarker } from './academic-calendar-marker.entity';

@Entity('academic_calendar_days')
@Unique(['academic_calendar_id', 'date'])
export class AcademicCalendarDay {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'uuid' })
  academic_calendar_id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'varchar', length: 10 })
  day_of_week: string;

  @Column({ type: 'int' })
  week_number: number;

  @Column({ type: 'boolean', default: false })
  is_weekend: boolean;

  @Column({ type: 'boolean', default: false })
  is_holiday: boolean;

  @Column({ type: 'boolean', default: false })
  is_current_day: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  marker_icon: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  marker_color: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @CreateDateColumn({
    type: 'timestamp with time zone',
  })
  created_at: Date;

  @ManyToOne(() => AcademicCalendar, (calendar) => calendar.days)
  @JoinColumn({ name: 'academic_calendar_id' })
  academic_calendar: AcademicCalendar;

  @OneToMany(
    () => AcademicCalendarMarker,
    (marker) => marker.academic_calendar_day,
  )
  markers: AcademicCalendarMarker[];
}
