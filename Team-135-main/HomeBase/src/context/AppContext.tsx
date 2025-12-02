// Application Context and State Management

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, AppAction } from '../types/state';
import { APP_CONFIG } from '../config/app.config';
import { createSession } from '../utils/sessionManager';

// Initial app state
const initialState: AppState = {
  mode: 'initial',
  sessionId: createSession(),
  transcript: [],
  resources: [],
  selectedResource: null,
  isRecording: false,
  error: null,
  userLocation: null,
  config: APP_CONFIG,
};

// State reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_MODE':
      return {
        ...state,
        mode: action.payload,
      };

    case 'UPDATE_TRANSCRIPT':
      return {
        ...state,
        transcript: action.payload,
      };

    case 'SET_RESOURCES':
      return {
        ...state,
        resources: action.payload,
        selectedResource: action.payload.length > 0 ? action.payload[0] : null,
      };

    case 'SELECT_RESOURCE':
      return {
        ...state,
        selectedResource: action.payload,
      };

    case 'SET_RECORDING':
      return {
        ...state,
        isRecording: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        mode: action.payload ? 'error' : state.mode,
      };

    case 'SET_LOCATION':
      return {
        ...state,
        userLocation: action.payload,
      };

    case 'RESET_SESSION':
      return {
        ...initialState,
        sessionId: action.payload,
        userLocation: state.userLocation, // Preserve location
        config: state.config, // Preserve config
      };

    default:
      return state;
  }
};

// Context type
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use app context
export const useAppState = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return context;
};
