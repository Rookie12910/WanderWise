import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import Home from '../Home';
import AuthContext from '../../context/AuthContext';

// Mock all external dependencies to prevent hanging
vi.mock('../../api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }),
  },
  blogApi: {
    getAllBlogPosts: vi.fn().mockResolvedValue([]),
  },
  tripApi: {
    getAvailableGroupTrips: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

vi.mock('../../components/NotificationCenter', () => ({
  default: () => <div data-testid="notification-center">NotificationCenter</div>,
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Simple test to verify component renders without crashing
describe('Home Component - Simple Tests', () => {
  const renderHome = (user = null) => {
    const authContextValue = {
      currentUser: user,
      logout: vi.fn(),
    };

    return render(
      <BrowserRouter>
        <AuthContext.Provider value={authContextValue}>
          <Home />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  test('renders without crashing', () => {
    renderHome();
    expect(screen.getByText('WanderWise')).toBeInTheDocument();
  });

  test('shows login button for guest users', () => {
    renderHome(null);
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  test('shows user info for logged in users', () => {
    const mockUser = { id: 1, username: 'testuser' };
    renderHome(mockUser);
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });
});
