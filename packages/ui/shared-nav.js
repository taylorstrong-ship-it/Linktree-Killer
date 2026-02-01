/**
 * Shared Navigation Component
 * Taylored Solutions - Consistent branding across all apps
 */

/**
 * Create navigation bar HTML
 * @param {string} currentApp - Current app identifier ('bio' | 'post-generator')
 * @param {Object|null} user - Current user object
 * @returns {string} Navigation HTML
 */
export function createNav(currentApp, user = null) {
    const navLinks = [
        { id: 'bio', label: 'BioLinker', href: '/builder' },
        { id: 'post-generator', label: 'PostGenerator', href: '/apps/post-generator' },
    ]

    return `
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <a href="/" class="flex items-center space-x-2">
              <svg class="w-8 h-8 text-brand-primary-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              </svg>
              <span class="font-bold text-xl text-gray-900">Taylored Solutions</span>
            </a>
          </div>

          <!-- Navigation Links -->
          <div class="hidden md:flex space-x-8">
            ${navLinks.map(link => `
              <a 
                href="${link.href}" 
                class="inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200
                  ${currentApp === link.id
            ? 'text-brand-primary-600 border-b-2 border-brand-primary-500'
            : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
        }"
              >
                ${link.label}
              </a>
            `).join('')}
          </div>

          <!-- User Section -->
          <div id="nav-user-section">
            ${user ? createUserMenu(user) : createAuthButtons()}
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div id="mobile-menu" class="hidden md:hidden border-t border-gray-200">
        <div class="pt-2 pb-3 space-y-1">
          ${navLinks.map(link => `
            <a 
              href="${link.href}"
              class="block pl-3 pr-4 py-2 text-base font-medium transition-colors
                ${currentApp === link.id
                ? 'bg-brand-primary-50 border-l-4 border-brand-primary-500 text-brand-primary-700'
                : 'border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            }"
            >
              ${link.label}
            </a>
          `).join('')}
        </div>
      </div>
    </nav>
  `
}

/**
 * Create user menu dropdown
 * @param {Object} user - User object
 * @returns {string} User menu HTML
 */
function createUserMenu(user) {
    const email = user.email || 'User'
    const initials = email.substring(0, 2).toUpperCase()

    return `
    <div class="relative">
      <button 
        id="user-menu-button"
        class="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-brand-primary-500 rounded-lg p-2 transition-colors hover:bg-gray-100"
        aria-expanded="false"
      >
        <div class="w-8 h-8 rounded-full bg-brand-primary-500 flex items-center justify-center text-white font-medium text-sm">
          ${initials}
        </div>
        <span class="hidden md:block text-sm font-medium text-gray-700">${email}</span>
        <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
      </button>

      <!-- Dropdown Menu -->
      <div 
        id="user-menu-dropdown"
        class="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
      >
        <a href="/builder" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Dashboard</a>
        <a href="/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
        <hr class="my-1 border-gray-200">
        <button 
          id="sign-out-button"
          class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          Sign Out
        </button>
      </div>
    </div>
  `
}

/**
 * Create auth buttons for non-authenticated users
 * @returns {string} Auth buttons HTML
 */
function createAuthButtons() {
    return `
    <div class="flex items-center space-x-4">
      <a 
        href="/login"
        class="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
      >
        Sign In
      </a>
      <a 
        href="/login?signup=true"
        class="px-4 py-2 text-sm font-medium text-white bg-brand-primary-600 hover:bg-brand-primary-700 rounded-lg transition-colors"
      >
        Get Started
      </a>
    </div>
  `
}

/**
 * Initialize navigation interactivity
 * @param {Function} onSignOut - Callback for sign out action
 */
export function initializeNav(onSignOut) {
    // Toggle user menu dropdown
    const menuButton = document.getElementById('user-menu-button')
    const menuDropdown = document.getElementById('user-menu-dropdown')

    if (menuButton && menuDropdown) {
        menuButton.addEventListener('click', () => {
            const isHidden = menuDropdown.classList.contains('hidden')
            menuDropdown.classList.toggle('hidden', !isHidden)
            menuButton.setAttribute('aria-expanded', isHidden)
        })

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!menuButton.contains(e.target) && !menuDropdown.contains(e.target)) {
                menuDropdown.classList.add('hidden')
                menuButton.setAttribute('aria-expanded', 'false')
            }
        })
    }

    // Sign out button
    const signOutButton = document.getElementById('sign-out-button')
    if (signOutButton && onSignOut) {
        signOutButton.addEventListener('click', onSignOut)
    }

    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button')
    const mobileMenu = document.getElementById('mobile-menu')

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden')
        })
    }
}
