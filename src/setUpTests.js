// import '@testing-library/jest-dom';

// // Mock Next.js Image component
// jest.mock('next/image', () => ({
//   __esModule: true,
//   default: (props) => {
//     // eslint-disable-next-line jsx-a11y/alt-text
//     return <img {...props} />
//   },
// }));

// // Mock next/router
// jest.mock('next/router', () => ({
//   useRouter: jest.fn(() => ({
//     route: '/',
//     pathname: '',
//     query: {},
//     asPath: '',
//     push: jest.fn(),
//     replace: jest.fn(),
//     reload: jest.fn(),
//     back: jest.fn(),
//     prefetch: jest.fn(),
//     beforePopState: jest.fn(),
//     events: {
//       on: jest.fn(),
//       off: jest.fn(),
//       emit: jest.fn()
//     }
//   }))
// }));

// // Mock next-auth
// jest.mock('next-auth/react', () => ({
//   useSession: jest.fn(() => ({ 
//     data: { 
//       user: { name: 'Test User' }, 
//       accessToken: 'test-token' 
//     }, 
//     status: 'authenticated' 
//   })),
//   signIn: jest.fn(),
//   signOut: jest.fn(),
//   SessionProvider: ({ children }) => children,
// }));

// // Mock axios instance
// jest.mock('../services/axiosInstance', () => ({
//   get: jest.fn(),
//   post: jest.fn(),
//   patch: jest.fn(),
//   delete: jest.fn(),
// }));

// // Mock react-hot-toast
// jest.mock('react-hot-toast', () => ({
//   error: jest.fn(),
//   success: jest.fn(),
//   dismiss: jest.fn(),
//   loading: jest.fn(() => 'toast-id'),
// }));

// // Create mock for localStorage
// const localStorageMock = (() => {
//   let store = {};
//   return {
//     getItem: jest.fn(key => store[key] || null),
//     setItem: jest.fn((key, value) => {
//       store[key] = value.toString();
//     }),
//     removeItem: jest.fn(key => {
//       delete store[key];
//     }),
//     clear: jest.fn(() => {
//       store = {};
//     }),
//     length: 0,
//     key: jest.fn(index => null)
//   };
// })();

// Object.defineProperty(window, 'localStorage', {
//   value: localStorageMock
// });

// // Mock window.matchMedia
// Object.defineProperty(window, 'matchMedia', {
//   writable: true,
//   value: jest.fn().mockImplementation(query => ({
//     matches: false,
//     media: query,
//     onchange: null,
//     addListener: jest.fn(),
//     removeListener: jest.fn(),
//     addEventListener: jest.fn(),
//     removeEventListener: jest.fn(),
//     dispatchEvent: jest.fn(),
//   })),
// });

// // Mock console methods for debugging
// global.console = {
//   ...console,
//   // Keep native behavior for other methods, override only specific ones for debugging
//   log: jest.fn(),
//   error: jest.fn(),
//   warn: jest.fn(),
//   info: jest.fn(),
//   debug: jest.fn(),
// };

// // Mock window.scrollTo
// window.scrollTo = jest.fn();

// // Mock IntersectionObserver
// class MockIntersectionObserver {
//   constructor(callback) {
//     this.callback = callback;
//   }
//   observe() { return null; }
//   unobserve() { return null; }
//   disconnect() { return null; }
// }

// window.IntersectionObserver = MockIntersectionObserver;