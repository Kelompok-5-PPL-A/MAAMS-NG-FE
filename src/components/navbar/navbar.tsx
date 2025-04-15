import React, { useState, useEffect } from 'react';
import { UserDataProps } from '../types/userData';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUserData] = useState<UserDataProps | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      setUserData(session.user as UserDataProps);
    }
  }, [session?.accessToken]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const logoutUser = async () => {
    try {
      // Check if SSO user before signing out
      const isSsoUser = localStorage.getItem('loginMethod') === 'sso'
      
      localStorage.clear()
      
      // Sign out from NextAuth
      await signOut({ redirect: false });
      
      // If SSO user, redirect to SSO logout
      if (isSsoUser) {
        const casLogoutURL = `https://sso.ui.ac.id/cas2/logout?service=${process.env.NEXT_PUBLIC_NEXTAUTH_URL}`;
        window.location.href = casLogoutURL;
      } else {
        // For other users, redirect to home
        router.push('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/');
    }
  };

  // Check if user is authenticated
  const isAuthenticated = status === 'authenticated' && !!session;

  return (
    <nav className="bg-[#FBC707] border-b-2 border-gray-200">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img src="/icons/maams.svg" className="h-8" alt="MAAMS Logo" />
        </a>

        {isAuthenticated ? (
          <>
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              aria-controls="navbar-dropdown"
              aria-expanded={isMenuOpen ? 'true' : 'false'}
            >
              <svg
                className={`w-5 h-5 ${isDropdownOpen ? 'transform rotate-180' : ''}`}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 1h15M1 7h15M1 13h15"
                />
              </svg>
            </button>
            <div className={`w-full md:flex md:w-auto ${isMenuOpen ? 'block' : 'hidden'}`} id="navbar-dropdown">
              <ul className="flex flex-col font-bold md:items-center md:justify-center p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-white md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-[#FBC707]">
                <li>
                  <a
                    href="/history"
                    className="block py-2 text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:p-0"
                  >
                    Riwayat
                  </a>
                </li>
                {userData?.role && (
                  <li>
                    <a
                      href="/analisisPublik"
                      className="block py-2 text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:p-0"
                    >
                      Analisis Publik
                    </a>
                  </li>
                )}
                <li className="relative">
                  <button
                    onClick={toggleDropdown}
                    id="dropdownNavbarLink"
                    className="flex md:items-center justify-between w-full py-2 md:px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:p-0 md:w-auto "
                  >
                    {userData?.username || 'User'}
                    <svg
                      className="w-2.5 h-2.5 ms-2.5"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 10 6"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 4 4 4-4"
                      />
                    </svg>
                  </button>
                  {isDropdownOpen && (
                    <div
                      id="dropdownNavbar"
                      className="absolute left-0 z-10 mt-2 w-44 font-semibold bg-white divide-y divide-gray-100 rounded-lg shadow "
                    >
                      <ul className="py-2 text-sm text-black">
                        {/* Dropdown menu */}
                      </ul>
                      <div className='py-1'>
                        <button
                          onClick={logoutUser}
                          className='block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left'
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </li>
                <li>
                  <a
                    href="/validator"
                    className="md:flex md:gap-2 md:items-center md:justify-center block py-2 bg-white text-gray-900 md:hover:bg-gray-100 md:border-0 md:p-2 md:rounded-xl"
                  >
                    Tambahkan Analisis
                    <div className="hidden md:flex bg-[#FBC707] rounded-full px-2">+</div>
                  </a>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              aria-controls="navbar-dropdown"
              aria-expanded={isMenuOpen ? 'true' : 'false'}
            >
              <svg
                className={`w-5 h-5 ${isDropdownOpen ? 'transform rotate-180' : ''}`}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 1h15M1 7h15M1 13h15"
                />
              </svg>
            </button>
            <div className={`w-full md:flex md:w-auto ${isMenuOpen ? 'block' : 'hidden'}`} id='navbar-dropdown'>
              <ul className='flex flex-col font-bold md:items-center md:justify-center p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-white md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-[#FBC707]'>
                <li>
                  <a
                    href='/validator'
                    className='md:flex md:gap-2 md:items-center md:justify-center block py-2 bg-white text-gray-900 md:hover:bg-gray-100 md:border-0 md:p-2 md:rounded-xl'
                  >
                    Tambahkan Analisis
                    <div className='hidden md:flex bg-[#FBC707] rounded-full px-2'>+</div>
                  </a>
                </li>
                <li className='w-full md:flex md:w-auto md:items-center md:justify-end'>
                  <a
                    href='/login'
                    className='md:flex md:gap-2 md:items-center md:justify-center block py-2 bg-white text-gray-900 md:hover:bg-gray-100 md:border-0 md:px-12 md:py-2 md:rounded-xl'
                  >
                    Login
                  </a>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;