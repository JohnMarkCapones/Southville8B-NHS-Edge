# Southville Chat Service

Dedicated chat service for Southville NHS School Portal.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials.

3. Run database migration:
```bash
# Apply the migration in Supabase SQL Editor
# Copy contents from migrations/001_create_chat_tables.sql
```

4. Start the service:
```bash
npm run start:dev
```

The service runs on `http://localhost:3001/api`

## API Documentation

Swagger docs available at: `http://localhost:3001/api/docs`

## Endpoints

- `GET /api/v1/chat/conversations` - Get user conversations
- `POST /api/v1/chat/conversations` - Create conversation
- `POST /api/v1/chat/messages` - Send message
- `GET /api/v1/chat/conversations/:id/messages` - Get messages
- `POST /api/v1/chat/conversations/:id/read` - Mark as read
- `GET /api/v1/chat/unread-count` - Get unread count

## Realtime

Clients subscribe to Supabase Realtime directly (not via backend):

```typescript
supabase
  .channel(`messages:${conversationId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`
  }, (payload) => {
    // Handle new message
  })
  .subscribe();
```

