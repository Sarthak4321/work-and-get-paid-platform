# Cehpoint - Project-Based Worker Portal

## Overview
A comprehensive platform connecting skilled project-based workers with Cehpoint IT company. Features include worker signup/login with AI knowledge verification, task management, payment tracking, admin dashboard, and policy compliance.

## Current State (November 9, 2024)
The portal is fully functional with local storage. All core features are working:
- Authentication with password validation
- Worker and admin dashboards
- Task management and broadcasting
- Payment and withdrawal system
- Demo task evaluation
- Policy pages

## Recent Changes
- **Authentication System**: Complete signup/login with knowledge checks using Gemini AI
- **Worker Dashboard**: Profile, tasks, payments, withdrawal features
- **Admin Dashboard**: Worker management, task broadcasting, approval system
- **Demo Task System**: Evaluation mechanism for new workers
- **Payment System**: Track earnings, process withdrawals
- **Policy Pages**: Terms, Privacy, Payment, Termination policies

## Demo Credentials

### Admin Account
- **Email**: admin@cehpoint.com
- **Password**: admin123
- **How to Create**: 
  1. Go to login page
  2. Click "Create Demo Admin Account" button
  3. Use the credentials above to login

**Important**: If you previously created a demo admin before the password feature was added, clear your browser's localStorage and create it again.

### Worker Accounts
- Create new worker accounts via the signup page at `/signup`
- Choose a password during signup
- Complete knowledge check (60% minimum score required)
- Complete demo task to qualify for regular projects

### Clearing Data (If Needed)
To reset the platform:
1. Open browser console (F12)
2. Run: `localStorage.clear(); sessionStorage.clear();`
3. Refresh the page

## Key Features

### For Workers
1. Sign up with skill verification
2. Complete demo task for qualification
3. Browse and accept weekly projects
4. Submit work and track progress
5. Earn money and withdraw anytime
6. View payment history

### For Admins
1. Manage worker accounts (approve, suspend, terminate)
2. Create and broadcast tasks
3. Review and approve submissions
4. Process payments automatically
5. View platform analytics

## Architecture

### Current Implementation (Local Storage)
- **Authentication**: Email/password stored in localStorage
- **Data Storage**: All user, task, and payment data in localStorage/sessionStorage
- **AI Integration**: Gemini Flash API for knowledge checks and task matching

### Firebase Migration Path
The codebase is structured for Firebase integration:

1. **Authentication**: Replace custom auth with Firebase Authentication
   - Update `pages/login.tsx` and `pages/signup.tsx` to use Firebase Auth
   - Remove password field from User interface (Firebase handles this)

2. **Database**: Replace localStorage with Firestore
   - Update `utils/storage.ts` to use Firestore async methods
   - Convert all `storage.getX()` calls to async/await
   - Add loading states to all components

3. **File Structure for Firebase**:
   ```
   utils/
     firebase.ts          # Firebase config and initialization
     auth.ts             # Auth service wrapper
     firestore.ts        # Firestore data operations
   ```

4. **Required Changes**:
   - Install Firebase SDK: `npm install firebase`
   - Create Firebase project and add config
   - Update all data fetching to async/await
   - Add error handling for network failures
   - Implement real-time listeners for live updates

## Technology Stack
- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI**: Google Gemini Flash (free tier)
- **State**: Local/Session Storage (Firebase-ready)
- **Date Handling**: date-fns

## Development

### Running Locally
```bash
npm run dev
```
Server runs on http://localhost:5000

### Environment Variables
For Gemini AI features, users can provide their API key during signup (optional):
- Get free API key from: https://ai.google.dev

## Security Notes
- Passwords stored in plain text for demo (use Firebase Auth in production)
- All data in browser storage (use Firestore in production)
- No server-side validation (implement with Firebase Cloud Functions)

## Future Enhancements
1. Real-time task notifications
2. Chat system for admin-worker communication
3. Advanced analytics and reporting
4. Mobile app version
5. Integration with payment gateways
6. Automated task matching using Gemini AI
7. Performance reviews and ratings
