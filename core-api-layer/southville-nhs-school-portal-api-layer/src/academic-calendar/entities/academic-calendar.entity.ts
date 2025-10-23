import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { AcademicCalendarDay } from './academic-calendar-day.entity';
import { AcademicCalendarMarker } from './academic-calendar-marker.entity';

@Entity('academic_calendar')
export class AcademicCalendar {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  year: string;

  @Column({ type: 'varchar', length: 50 })
  month_name: string;

  @Column({ type: 'varchar', length: 50 })
  term: string;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({ type: 'int' })
  total_days: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({
    type: 'timestamp with time zone',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
  })
  updated_at: Date;

  @OneToMany(() => AcademicCalendarDay, (day) => day.academic_calendar)
  days: AcademicCalendarDay[];

  @OneToMany(() => AcademicCalendarMarker, (marker) => marker.academic_calendar)
  markers: AcademicCalendarMarker[];
}
