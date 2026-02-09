import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  CheckInPhoto,
  CheckInStep,
  Coordinates,
  GeofenceState,
  LocationData,
} from '../types';
import { zustandMMKVStorage } from './storage';

interface CheckInState {
  // Location state
  currentLocation: LocationData | null;
  geofence: GeofenceState;
  isMockDetected: boolean;
  mockReason: string | null;
  locationError: string | null;

  // Camera / photo state
  currentPhoto: CheckInPhoto | null;
  step: CheckInStep;

  // Network
  isOnline: boolean;

  // Actions
  setLocation: (location: LocationData) => void;
  setGeofence: (geofence: GeofenceState) => void;
  setMockDetected: (isMocked: boolean, reason: string | null) => void;
  setLocationError: (error: string | null) => void;
  setPhoto: (photo: CheckInPhoto | null) => void;
  setStep: (step: CheckInStep) => void;
  setOnline: (online: boolean) => void;
  reset: () => void;
}

const initialState = {
  currentLocation: null,
  geofence: { isWithinFence: false, distanceMeters: Infinity, bearing: 0 },
  isMockDetected: false,
  mockReason: null,
  locationError: null,
  currentPhoto: null,
  step: 'location' as CheckInStep,
  isOnline: true,
};

export const useCheckInStore = create<CheckInState>()(
  persist(
    (set) => ({
      ...initialState,

      setLocation: (location) =>
        set({ currentLocation: location, locationError: null }),

      setGeofence: (geofence) => set({ geofence }),

      setMockDetected: (isMocked, reason) =>
        set({ isMockDetected: isMocked, mockReason: reason }),

      setLocationError: (error) => set({ locationError: error }),

      setPhoto: (photo) => set({ currentPhoto: photo }),

      setStep: (step) => set({ step }),

      setOnline: (online) => set({ isOnline: online }),

      reset: () => set(initialState),
    }),
    {
      name: 'checkin-state',
      storage: createJSONStorage(() => zustandMMKVStorage),
      // Only persist location cache and photo - not UI state
      partialize: (state) => ({
        currentLocation: state.currentLocation,
        currentPhoto: state.currentPhoto,
      }),
    }
  )
);
