# Southville NHS School Portal API Layer

A NestJS-based API layer for the Southville NHS School Portal, integrated with Supabase for authentication, database, and real-time features.

## 🚀 Features

- **NestJS Framework** with Fastify adapter for optimal performance
- **Supabase Integration** for authentication, database, and real-time features
- **Security Hardening** with Helmet, CORS, and input validation
- **Environment Configuration** with proper secret management
- **Health Check Endpoint** for monitoring Supabase connectivity

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase project (get your credentials from [supabase.com](https://supabase.com))

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your Supabase credentials:

```bash
cp env.example .env
```

Edit `.env` with your Supabase project details:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application Configuration
PORT=3004
NODE_ENV=development
```

### 3. Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Run the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

The API will be available at `http://localhost:3004`

## 🔍 API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check with Supabase connectivity status
- `GET /api/docs` - Swagger API documentation

## 🏗️ Project Structure

```
src/
├── config/           # Configuration files
│   └── supabase.config.ts
├── supabase/         # Supabase integration
│   ├── supabase.module.ts
│   └── supabase.service.ts
├── app.controller.ts # Main application controller
├── app.module.ts     # Root application module
├── app.service.ts    # Application service
└── main.ts          # Application bootstrap
```

## 🔧 Usage Examples

### Using Supabase Service in Your Controllers

```typescript
import { Controller, Get } from '@nestjs/common';
import { SupabaseService } from './supabase/supabase.service';

@Controller('users')
export class UsersController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get()
  async getUsers() {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.from('users').select('*');

    if (error) throw error;
    return data;
  }
}
```

### Using Service Role for Admin Operations

```typescript
async createUser(userData: any) {
  const supabase = this.supabaseService.getServiceClient();
  const { data, error } = await supabase
    .from('users')
    .insert(userData);

  if (error) throw error;
  return data;
}
```

## 🛡️ Security Features

- **Helmet** for security headers
- **CORS** configuration
- **Input validation** with ValidationPipe
- **Environment variable** protection
- **Service role** separation for admin operations

## 📚 Next Steps

1. **Create your database schema** in Supabase
2. **Set up Row Level Security (RLS)** policies
3. **Implement authentication** endpoints
4. **Add your business logic** modules
5. **Set up CI/CD** pipeline

## 🤝 Contributing

Follow the architectural rules defined in the workspace for consistent development practices.

## 📄 License

This project is private and proprietary to Southville NHS School Portal.

## 📖 Additional Documentation

See the `docs/` directory for comprehensive documentation including:
- `CLAUDE.md` - Development guidelines and architecture
- `DEPLOYMENT.md` - Render deployment guide
- `api-layer/` - Authentication and authorization documentation
- Various system documentation files

