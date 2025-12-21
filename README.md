# Exercise - Social Fitness Platform

A modern, real-time social exercising platform built with React Native, Convex, and Clerk. Track workouts, build routines, and connect with a fitness community.

## Tech Stack

- **Frontend**: React Native (Expo) with React 19
- **Backend**: [Convex](https://convex.dev) - Real-time database and serverless functions
- **Authentication**: [Clerk](https://clerk.dev) - User authentication with social logins
- **Monorepo**: Turborepo for efficient development
- **Type Safety**: End-to-end TypeScript with shared types

## Current Features

### Authentication & User Management

- Secure user authentication via Clerk
- Social login support (Apple, Google)
- User profile management
- Session management

### Exercise Database

- **Comprehensive Exercise Library**: Thousands of exercises with detailed metadata
- **Advanced Filtering**: Filter by:
  - Primary/secondary muscle groups (abdominals, biceps, chest, etc.)
  - Equipment type (dumbbell, barbell, bodyweight, machine, etc.)
  - Exercise category (strength, cardio, stretching, powerlifting, etc.)
  - Difficulty level (beginner, intermediate, expert)
  - Exercise type (isolation, compound)
- **Search Functionality**: Real-time search across exercise names
- **Exercise Details**:
  - Instructions and form tips
  - Muscle group targeting
  - Equipment requirements
  - Exercise images
- **Local Caching**: Offline exercise database for fast access

### Workout Routines

- **Create Custom Routines**: Build personalized workout plans
- **Exercise Selection**: Add exercises with custom sets and reps
- **Routine Management**:
  - Edit existing routines
  - Delete routines
  - Add notes and descriptions
- **Quick Workouts**: Start impromptu workouts without a routine

### Workout Sessions

- **Active Workout Tracking**: Real-time workout session management
- **Set Tracking**: Log sets, reps, and weight for each exercise
- **Workout States**:
  - Active workouts with live progress
  - Completed workout history
  - Cancelled sessions
- **Progress Saving**: Auto-save workout progress during sessions
- **Workout Visibility**:
  - Private workouts (personal tracking)
  - Public workouts (shareable with community)
- **Workout History**: View past workout sessions with full details

### Progress & Analytics

- **Workout History**: Track all completed workouts
- **Session Details**: Review sets, reps, weights, and duration
- **Progress Tracking**: Monitor improvements over time

### User Experience

- **Native Mobile App**: Smooth iOS experience with Expo
- **Real-time Updates**: Live data synchronization via Convex
- **Offline Support**: Cached exercise database works offline
- **Intuitive Navigation**: Clean, modern UI with smooth animations

## Future Features

### Social Features

- **User Profiles**:
  - Public profile pages with workout stats
  - Profile pictures and bios
  - Fitness goals and achievements
  - Workout statistics dashboard

- **Social Feed**:
  - Discover public workouts from the community
  - Follow other users
  - Like and comment on workouts
  - Share workout achievements

- **Friends & Following**:
  - Follow system to connect with other users
  - Friend requests and connections
  - Activity feed of followed users
  - Mutual connections discovery

- **Workout Sharing**:
  - Share workout routines with the community
  - Copy and adapt others' routines
  - Rate and review shared routines
  - Workout templates marketplace

### Gamification & Motivation

- **Achievement System**:
  - Badges for milestones (100 workouts, PR achievements, etc.)
  - Streak tracking (daily workout streaks)
  - Level progression system
  - Unlockable achievements

- **Challenges**:
  - Create and join fitness challenges
  - Team challenges and competitions
  - Time-based challenges (30-day challenges)
  - Leaderboards for challenges

- **Leaderboards**:
  - Global and friend leaderboards
  - Category-specific rankings (strength, cardio, etc.)
  - Weekly/monthly competitions
  - Personal best tracking

### Advanced Analytics

- **Progress Visualization**:
  - Charts and graphs for strength progression
  - Volume tracking over time
  - Body part training frequency
  - Rest day analysis

- **Performance Metrics**:
  - One-rep max (1RM) calculator
  - Volume progression tracking
  - Training load analysis
  - Recovery time recommendations

- **Goal Tracking**:
  - Set and track fitness goals
  - Weight loss/gain tracking
  - Strength goals (bench press, squat, etc.)
  - Cardio goals (distance, time)

### Workout Intelligence

- **AI-Powered Recommendations**:
  - Personalized workout suggestions
  - Exercise recommendations based on goals
  - Rest day suggestions
  - Form tips and technique advice

- **Workout Templates**:
  - Pre-built workout programs (5x5, PPL, etc.)
  - Beginner to advanced programs
  - Sport-specific programs
  - Rehabilitation programs

- **Smart Scheduling**:
  - Auto-schedule workouts based on availability
  - Rest day recommendations
  - Training split suggestions
  - Calendar integration

### Enhanced Workout Features

- **Rest Timer**:
  - Built-in rest timer between sets
  - Customizable rest periods
  - Visual and audio notifications

- **Superset Tracking**:
  - Log supersets and circuits
  - Track paired exercises
  - Rest periods for supersets

- **Drop Sets & Advanced Techniques**:
  - Track drop sets, pyramid sets
  - Cluster sets and rest-pause
  - Time under tension tracking

- **Workout Notes**:
  - Per-exercise notes
  - Overall workout notes
  - Form cues and reminders
  - Pain/injury tracking

### Integration & Connectivity

- **Fitness Tracker Integration**:
  - Apple Health integration
  - Google Fit connectivity
  - Heart rate monitoring
  - Step counting integration

- **Wearable Support**:
  - Apple Watch app
  - Workout tracking on wearables
  - Heart rate zone tracking
  - Activity rings integration

- **Social Media Sharing**:
  - Share workouts to Instagram, Twitter
  - Workout achievement posts
  - Progress photo sharing

### Nutrition Integration

- **Meal Tracking**:
  - Log meals and calories
  - Macro tracking (protein, carbs, fats)
  - Meal planning
  - Recipe database

- **Nutrition Goals**:
  - Calorie targets
  - Macro targets
  - Meal timing
  - Hydration tracking

### Content & Education

- **Exercise Videos**:
  - Video demonstrations for exercises
  - Form check videos
  - Technique tutorials
  - Exercise alternatives

- **Educational Content**:
  - Training articles and guides
  - Nutrition information
  - Recovery tips
  - Injury prevention

### Community Features

- **Groups & Communities**:
  - Create and join fitness groups
  - Group challenges
  - Community discussions
  - Local meetup organization

- **Workout Plans Marketplace**:
  - Buy/sell workout programs
  - Trainer-created programs
  - Subscription-based plans
  - Program reviews and ratings

- **Coaching Features**:
  - Connect with personal trainers
  - Virtual coaching sessions
  - Program customization by trainers
  - Progress check-ins

### Notifications & Reminders

- **Workout Reminders**:
  - Scheduled workout notifications
  - Rest day reminders
  - Goal deadline alerts

- **Social Notifications**:
  - New follower alerts
  - Workout likes and comments
  - Challenge invitations
  - Achievement unlocks

### Platform Expansion

- **Web Application**:
  - Full-featured web app
  - Desktop workout planning
  - Advanced analytics dashboard

- **Multi-platform Support**:
  - Android app
  - Tablet optimization
  - Desktop apps

### Privacy & Security

- **Privacy Controls**:
  - Granular privacy settings
  - Block and report users
  - Data export functionality
  - Account deletion

- **Data Security**:
  - End-to-end encryption for sensitive data
  - GDPR compliance
  - Secure data backup
  - Two-factor authentication

## Development

### Prerequisites

- Node.js >= 20.19.4
- pnpm 10.19.0
- iOS Simulator (for native development)
- Convex account (free tier available)
- Clerk account (free tier available)

### Getting Started

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Set up Convex**:

   ```bash
   cd packages/backend
   pnpm run setup
   ```

   Follow the prompts to create a Convex project and configure environment variables.

3. **Configure Clerk**:
   - Create a Clerk account and project
   - Enable Google and Apple as social providers
   - Add `CLERK_ISSUER_URL` to Convex environment variables
   - Get your Clerk publishable and secret keys

4. **Configure the app**:
   - Create `.env.local` in `apps/native` using `.example.env` as template
   - Add your Convex URL and Clerk keys

5. **Run the app**:
   ```bash
   pnpm dev
   ```

### Project Structure

```
exercise/
├── apps/
│   └── native/          # React Native mobile app
├── packages/
│   └── backend/         # Convex backend (schema, queries, mutations)
└── tools/               # Shared tooling (ESLint, Prettier, TypeScript)
```

### Available Scripts

- `pnpm dev` - Start development servers
- `pnpm build` - Build all packages
- `pnpm lint` - Lint all packages
- `pnpm format` - Format code with Prettier
- `pnpm typecheck` - Type check all packages

## License

See [LICENSE](./LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.

---

**Built with React Native, Convex, and Clerk**
