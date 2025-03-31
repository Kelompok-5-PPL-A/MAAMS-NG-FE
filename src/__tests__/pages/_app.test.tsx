import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '@/pages/_app';
import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';

import { useRouter } from 'next/router';

// Mock the Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
  }),
}));
// Mock the Component and pageProps
const MockComponent = () => <div>Mock Component</div>;
const mockPageProps = {
  session: null // Add a mock session if needed
};

// Mock global fetch if not available
if (typeof globalThis.fetch === 'undefined') {
  globalThis.fetch = jest.fn(() => 
    Promise.resolve({
      json: () => Promise.resolve({}),
      ok: true,
      status: 200
    })
  ) as jest.Mock;
}

describe('App', () => {
  it('renders the component wrapped in providers', () => {
    render(
      <ChakraProvider>
        <SessionProvider session={mockPageProps.session}>
          <App 
            Component={MockComponent} 
            pageProps={mockPageProps} 
            router={{} as any}
          />
        </SessionProvider>
      </ChakraProvider>
    );
    
    // Check if the MockComponent is rendered
    expect(screen.getByText('Mock Component')).toBeInTheDocument();
  });
});