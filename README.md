
# Roommate Finder Mobile App

A cross-platform mobile application built with React Native and Expo. This app allows users to create profiles, swipe to find compatible roommates, and chat in real-time.

## 📱 Tech Stack
- **Core:** React Native, Expo (SDK 50+)
- **Routing:** Expo Router (File-based routing)
- **Styling:** NativeWind (TailwindCSS for React Native)
- **State Management:** Zustand
- **Networking:** Axios

## ✨ Key Features
- **Smart Matching:** View potential roommates with a compatibility score (0-100%).
- **Real-time Chat:** Instant messaging interface with auto-refreshing inboxes.
- **Profile Management:** Edit preferences (cleanliness, habits) to improve match quality.
- **Room Listings:** Browse and post available rooms (In Progress).

## 🚀 Getting Started

### Prerequisites
- Node.js (LTS version)
- Expo Go app on your physical device (iOS/Android) or an Emulator.

### Installation
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd roommate-mobile
2. **Install dependencies:**

```bash

npm install
# or
yarn install
```

3. **Configure Environment: Create a .env file:**
```bash
EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:8000/api
```

**Note: If testing on a physical device, use your computer's local IP address (e.g., 192.168.x.x), not localhost.**

4. **Start the App:**

```bash

npx expo start
```
5. **Run on Device: Scan the QR code generated in the terminal using the Expo Go app.**
   

📂 Folder Structure
```bash
app/: Screens and navigation (Expo Router).

components/: Reusable UI elements (Cards, Input fields).

services/: API configuration and HTTP requests.

store/: Global state management (AuthStore, UserStore).

```


---

