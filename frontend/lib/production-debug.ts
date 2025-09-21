// Production debugging utility for authentication issues

export const productionDebug = {
  // Debug authentication tokens
  debugTokens: () => {
    if (typeof window === 'undefined') return;
    
    console.log('=== TOKEN DEBUG ===');
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    console.log('Access token exists:', !!accessToken);
    console.log('Refresh token exists:', !!refreshToken);
    
    if (accessToken) {
      try {
        // Decode JWT token to check expiry
        const tokenParts = accessToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const now = Math.floor(Date.now() / 1000);
          console.log('Token payload:', payload);
          console.log('Token expires at:', new Date(payload.exp * 1000));
          console.log('Current time:', new Date());
          console.log('Token is expired:', payload.exp < now);
          console.log('User ID from token:', payload.user_id);
          console.log('User role from token:', payload.role);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
    console.log('==================');
  },

  // Debug API request
  debugApiRequest: (url: string, options: RequestInit, token?: string) => {
    console.log('=== API REQUEST DEBUG ===');
    console.log('URL:', url);
    console.log('Method:', options.method || 'GET');
    console.log('Headers:', options.headers);
    console.log('Body:', options.body);
    console.log('Token being sent:', token ? `${token.substring(0, 20)}...` : 'No token');
    console.log('========================');
  },

  // Debug API response
  debugApiResponse: (url: string, response: Response) => {
    console.log('=== API RESPONSE DEBUG ===');
    console.log('URL:', url);
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    console.log('=========================');
  },

  // Debug user state
  debugUserState: () => {
    if (typeof window === 'undefined') return;
    
    console.log('=== USER STATE DEBUG ===');
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        console.log('Stored user data:', userData);
        console.log('User role:', userData.role);
        console.log('User ID:', userData.id);
        console.log('User email:', userData.email);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else {
      console.log('No user data found in localStorage');
    }
    console.log('=======================');
  },

  // Debug environment
  debugEnvironment: () => {
    console.log('=== ENVIRONMENT DEBUG ===');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('Current origin:', typeof window !== 'undefined' ? window.location.origin : 'SSR');
    console.log('=========================');
  },

  // Complete debug suite
  debugAll: () => {
    console.log('🔍 PRODUCTION DEBUG STARTED');
    productionDebug.debugEnvironment();
    productionDebug.debugTokens();
    productionDebug.debugUserState();
    console.log('🔍 PRODUCTION DEBUG COMPLETED');
  }
};

// Auto-debug on page load in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    productionDebug.debugAll();
  });
}
