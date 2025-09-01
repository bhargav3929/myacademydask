# **App Name**: CourtCommand

## Core Features:

- User Authentication: Secure user authentication using Firebase Authentication with email/password and Google provider.
- Dashboard (Owner Portal): Display key metrics and data visualizations using Recharts, fetched from Firestore in real-time.
- Stadium Management (Owner Portal): Create, read, update, and delete stadiums via an elegant table interface. Data is stored in the 'stadiums' collection in Firestore.
- Coach Portal: Primary interface for coaches, displaying students assigned to their stadium. Data fetched from Firestore.
- Attendance Tracking: Coaches can mark student attendance ('present' or 'absent'), adding documents to the 'attendance' collection in Firestore.
- Firestore Security Rules: Comprehensive security rules to protect user data, ensuring data access aligns with user roles (owner, coach) and stadium assignments, tool prevents unauthorized data modification.
- Realtime Data Updates: Utilize Firebase onSnapshot listeners for real-time updates on key metrics and data, providing a live and responsive user experience.

## Style Guidelines:

- Primary background: Deep slate gray (#101418) to focus user attention on content.
- Primary text: Soft, off-white (#F7F9FA) for clear readability.
- Accent color: Refined deep Indigo (#4C63F7) for primary actions and brand recognition.
- Font: 'Inter' (sans-serif) for clarity and modern aesthetics; chosen by user request. Note: currently only Google Fonts are supported.
- Spacing: 8px grid system for consistent spacing throughout the application.
- Subtle rounding with 6px radius for smaller elements (buttons, inputs) and 12px radius for larger elements (cards, modals).
- Fluid page transitions, list staggering, and subtle hover/active states for an engaging user experience using Framer Motion.