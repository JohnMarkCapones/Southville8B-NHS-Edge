import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ChatModule } from "./chat/chat.module";
import { SupabaseModule } from "./common/supabase/supabase.module";
import supabaseConfig from "./config/supabase.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      load: [supabaseConfig],
    }),
    SupabaseModule,
    ChatModule,
  ],
})
export class AppModule {}
