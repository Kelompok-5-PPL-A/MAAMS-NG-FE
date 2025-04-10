import * as React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import App from '@/pages/_app'
import { useRouter } from 'next/router'
import type { AppProps } from 'next/app'

jest.mock('@/pages/login', () => () => <div>Masuk ke Akun</div>)

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}))

const mockPageProps = {
  session: null,
}

const MockComponent = () => <div>Mock Component</div>

const createMockRouter = (pathname: string = '/'): any => ({
  pathname,
  asPath: pathname,
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
})

// Helper to render <App /> and provide required props
const renderApp = (pathname = '/') => {
  const mockRouter = createMockRouter(pathname)
  ;(useRouter as jest.Mock).mockReturnValue(mockRouter)

  const appProps: AppProps = {
    Component: MockComponent,
    pageProps: mockPageProps,
    router: mockRouter,
  }

  return render(<App {...appProps} />)
}

describe('App', () => {
  it('renders login page when pathname is /login', async () => {
    renderApp('/login')
    await waitFor(() => {
      expect(screen.getByText('Masuk ke Akun')).toBeInTheDocument()
    })
  })

  it('renders the main component when not on /login', () => {
    renderApp('/dashboard')
    expect(screen.getByText('Mock Component')).toBeInTheDocument()
  })

  it('renders fallback loading in Suspense then the lazy component', async () => {
    const LazyComponent = React.lazy(() =>
      new Promise<{ default: React.FC }>((resolve) =>
        setTimeout(() => resolve({ default: () => <div>Lazy Component</div> }), 100)
      )
    )

    const mockRouter = createMockRouter('/')
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)

    const lazyAppProps: AppProps = {
      Component: LazyComponent,
      pageProps: mockPageProps,
      router: mockRouter,
    }

    render(<App {...lazyAppProps} />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Lazy Component')).toBeInTheDocument()
    })
  })
})
