import * as React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import App from '@/pages/_app'
import { useRouter } from 'next/router'

// Mock dynamic import for login page
jest.mock('@/pages/login', () => () => <div>Masuk ke Akun</div>)

// Mock the router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}))

const mockPageProps = {
  session: null,
}

const MockComponent = () => <div>Mock Component</div>

// Helper to create mock NextRouter
const createMockRouter = (pathname: string = '/'): any => ({
  pathname,
  route: pathname,
  query: {},
  asPath: pathname,
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

// Helper to render <App />
const renderApp = (pathname = '/') => {
  ;(useRouter as jest.Mock).mockReturnValue({ pathname })
  const mockRouter = createMockRouter(pathname)

  return render(
    <App
      Component={MockComponent}
      pageProps={mockPageProps}
      router={mockRouter}
    />
  )
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

  it('renders fallback loading in Suspense if needed', async () => {
    const SuspenseApp = React.lazy(() => Promise.resolve({ default: () => <div>Lazy Component</div> }))

    const FallbackTestApp = () => (
      <App
        Component={SuspenseApp}
        pageProps={mockPageProps}
        router={createMockRouter('/')}
      />
    )

    render(<FallbackTestApp />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
