import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from '@/pages/_app';
import { useRouter } from 'next/router';
import type { AppProps } from 'next/app';

jest.mock('@/pages/login', () => () => <div>Masuk ke Akun</div>);

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const mockPageProps = {
  session: null,
};

const MockComponent = () => <div>Mock Component</div>;

const createMockRouter = (pathname: string = '/', asPath?: string): any => ({
  pathname,
  asPath: asPath || pathname,
  route: pathname,
  query: {},
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(),
  beforePopState: jest.fn(),
  events: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
  isFallback: false,
  basePath: '',
  isLocaleDomain: false,
  isReady: true,
});

describe('App', () => {
  const renderApp = (pathname = '/', asPath?: string) => {
    const mockRouter = createMockRouter(pathname, asPath);
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    const appProps: AppProps = {
      Component: MockComponent,
      pageProps: mockPageProps,
      router: mockRouter,
    };

    return render(<App {...appProps} />);
  };

  it('renders login page when pathname is /login', async () => {
    renderApp('/login');
    await waitFor(() => {
      expect(screen.getByText('Masuk ke Akun')).toBeInTheDocument();
    });
  });

  it('renders the main component when not on /login', () => {
    renderApp('/dashboard');
    expect(screen.getByText('Mock Component')).toBeInTheDocument();
  });

  it('renders fallback loading in Suspense then the lazy component', async () => {
    const LazyComponent = React.lazy(() =>
      Promise.resolve({ default: () => <div>Lazy Component</div> })
    );

    const mockRouter = createMockRouter('/');
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    const lazyAppProps: AppProps = {
      Component: LazyComponent,
      pageProps: mockPageProps,
      router: mockRouter,
    };

    render(<App {...lazyAppProps} />);

    // Initial loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // After lazy load completes
    await waitFor(() => {
      expect(screen.getByText('Lazy Component')).toBeInTheDocument();
    });
  });
});