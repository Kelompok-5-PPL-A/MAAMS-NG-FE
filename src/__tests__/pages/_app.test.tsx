// App.test.tsx
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '@/pages/_app';
import { ChakraProvider } from '@chakra-ui/react';
import { useRouter } from 'next/router';

// Mock the Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
  }),
}));
// Mock the Component and pageProps
const MockComponent = () => <div>Mock Component</div>;
const mockPageProps = {};


describe('App', () => {
  it('renders the component wrapped in ChakraProvider', () => {
    render(
      <ChakraProvider>
            <App Component={MockComponent} pageProps={mockPageProps} router={{} as any}/>
      </ChakraProvider>
    );

    // Check if the MockComponent is rendered
    expect(screen.getByText('Mock Component')).toBeInTheDocument();
  });
});