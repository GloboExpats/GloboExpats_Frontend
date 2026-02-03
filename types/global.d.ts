// Global type definitions for Matomo and other window extensions
declare global {
  interface Window {
    _paq?: any[]
    _mtm?: any[]
    _matomoInitialized?: boolean
  }
}

export {}
