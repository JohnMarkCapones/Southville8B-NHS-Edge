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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
