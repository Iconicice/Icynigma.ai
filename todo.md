# Icynigma Project TODO

## Initial Website Features
- [x] Basic homepage layout with ethereal minimalism design
- [x] Navigation and hero section
- [x] About section with glass-morphism card
- [x] Features showcase section
- [x] Call-to-action section
- [x] Footer

## Full-Stack Upgrade
- [x] Upgrade from static to full-stack (database, server, user auth)
- [x] Set up tRPC procedures and database schema
- [x] Configure Manus OAuth authentication

## ChatGPT Integration
- [x] Set up OpenAI API integration through Manus LLM helper
- [x] Create chat interface component (AIChatBox)
- [x] Build backend tRPC procedure for chat completions
- [x] Add chat widget to home page
- [x] Store chat history in database
- [ ] Test chat functionality end-to-end

## UI/UX Enhancements
- [ ] Add sticky navigation header
- [ ] Implement hover animations on cards and buttons
- [ ] Add contact/newsletter form section
- [ ] Ensure responsive design on mobile devices

## Testing & Deployment
- [ ] Write vitest tests for chat API endpoint
- [ ] Test authentication flow
- [ ] Verify all pages render correctly
- [ ] Performance optimization


## LLM Integration (Manus Built-in)
- [x] Configure Manus LLM for philosophical AI
- [x] Update chat router to use Manus LLM
- [x] Implement error handling for LLM requests
- [x] Test LLM integration
- [x] Verify all tests passing


## Text-to-Speech Feature
- [x] Create TTS service using Web Speech API
- [x] Build TTS API endpoint in backend
- [x] Create TTS UI component with playback controls
- [x] Add voice selection dropdown
- [x] Implement speed adjustment slider
- [x] Integrate TTS into chat messages
- [x] Add pause/resume functionality
- [x] Test TTS across browsers
- [x] Optimize audio performance


## Free TTS Integration (Piper + Web Speech API Fallback)
- [x] Create unified TTS service with Piper support
- [x] Implement Web Speech API fallback
- [x] Add Piper voice selection
- [x] Configure Piper endpoint
- [x] Test across all browsers
- [x] Optimize TTS performance


## UI Cleanup & Voice Expansion
- [ ] Expand voice library with diverse options (male, female, accents)
- [ ] Redesign TTSPlayer component UI
- [ ] Clean up chat interface layout
- [ ] Improve message styling and spacing
- [ ] Add voice preview functionality
- [ ] Optimize responsive design


## Custom Notification System
- [x] Create notification context and provider
- [x] Build toast notification component
- [x] Add notification hooks for easy usage
- [x] Integrate with chat messages
- [x] Add success, error, and info notifications
- [x] Test notification system
