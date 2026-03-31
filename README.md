# Omnis UI

This project provides a UI for interacting with the Omnis AI system through the API Gateway.

## Features

- Natural language interface to the Omnis system
- Chat interface with typing animations
- Visual workflow representation (DAG view)
- Responsive design

## Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- Omnis API Gateway running (typically on http://localhost:8080)

### Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```
# API Gateway URL for backend communication
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the values with your actual configuration.

### Installing Dependencies

```bash
# Install dependencies
npm install
# or
yarn install

# Start the development server
npm run dev
# or
yarn dev
```

## Architecture

The application uses a layered architecture:

1. **UI Layer**: React components & Next.js pages
2. **State Management**: Context providers for chat and authentication
3. **API Layer**: API client for communicating with the Omnis backend

The chat functionality uses the API Gateway to process natural language queries and display the results with a typing animation for a more natural feel.

## Usage

1. Visit http://localhost:3000 to access the UI
2. Enter a prompt on the initial page
3. The system will process your prompt and transition to the chat interface
4. Continue the conversation or explore the workflow graph in the DAG tab

## Development

### Key Files

- `lib/api.ts`: API client for communicating with the Omnis backend
- `lib/chat-provider.tsx`: Main provider for chat state management
- `app/prompt/page.tsx`: Initial prompt entry page
- `app/chat/page.tsx`: Main chat interface

### Architecture

The application uses:

- Next.js for the frontend framework
- React for the component model
- Supabase for authentication
- API Gateway for communicating with the Omnis backend
- React Flow for workflow visualization

## Troubleshooting

- If the UI can't connect to the backend, check that the API Gateway is running and accessible at the URL specified in `.env.local`
- For authentication issues, check the Supabase configuration and ensure the user is properly authenticated
