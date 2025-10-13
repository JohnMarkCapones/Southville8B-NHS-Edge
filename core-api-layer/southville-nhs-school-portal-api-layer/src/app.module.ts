import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { ExamplesModule } from './examples/examples.module';
import { ClubsModule } from './clubs/clubs.module';
import { DomainsModule } from './domains/domains.module';
import { UsersModule } from './users/users.module';
import { SectionsModule } from './sections/sections.module';
import { BuildingsModule } from './buildings/buildings.module';
import { FloorsModule } from './floors/floors.module';
import { RoomsModule } from './rooms/rooms.module';
import supabaseConfig from './config/supabase.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [supabaseConfig],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute globally
      },
    ]),
    SupabaseModule,
    AuthModule,
    StudentsModule,
    ExamplesModule,
    ClubsModule,
    DomainsModule,
    UsersModule,
    SectionsModule,
    BuildingsModule,
    FloorsModule,
    RoomsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
