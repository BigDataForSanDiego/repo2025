import { useState } from 'react'
import ImageAnalysis from './ImageAnalysis'
import EligibilityForm from './EligibilityForm'
import CashForCans from './CashForCans'
import MapSection from './MapSection'
import { HomeIcon, SearchIcon, CheckIcon, CameraIcon, MenuIcon, RecycleIcon, MapIcon } from './Icons'
import './universal.css'

/**
 * Streamlined homepage with big action buttons
 */
function HomePage({ onNavigate }) {
  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '3rem 2rem',
      textAlign: 'center'
    }}>
      {/* Hero Section */}
      <div style={{ marginBottom: '4rem' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          marginBottom: '1rem',
          color: '#6c8fff',
          fontWeight: '300',
          textShadow: '0 2px 8px rgba(108, 143, 255, 0.3)'
        }}>
          Resourcify
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#9ca3af',
          lineHeight: '1.5'
        }}>
          Smart help for your stuff
        </p>
      </div>

      {/* Big Action Buttons */}
      <div className="homepage-buttons" style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        <button 
          onClick={() => onNavigate('imageAnalysis')}
          className="home-action-btn home-action-btn-rationer"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <SearchIcon size={40} color="#6c8fff" />
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#6c8fff', fontSize: '1.3rem' }}>
                Rationer
              </h3>
              <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.95rem' }}>
                Take a pic and get help rationing your resources
              </p>
            </div>
          </div>
        </button>

        <button 
          onClick={() => onNavigate('eligibilityForm')}
          className="home-action-btn home-action-btn-benefits"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <CheckIcon size={40} color="#8b5cf6" />
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#8b5cf6', fontSize: '1.3rem' }}>
                Benefits Check
              </h3>
              <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.95rem' }}>
                Get the benefits you deserve - quick & easy check
              </p>
            </div>
          </div>
        </button>

        <button 
          onClick={() => onNavigate('cashForCans')}
          className="home-action-btn home-action-btn-recycle"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <RecycleIcon size={40} color="#10b981" />
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#10b981', fontSize: '1.3rem' }}>
                Cash for Cans
              </h3>
              <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.95rem' }}>
                Find the best recycling centers near you & get cash
              </p>
            </div>
          </div>
        </button>

        <button 
          onClick={() => onNavigate('mapSection')}
          className="home-action-btn home-action-btn-map"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <MapIcon size={32} color="#e74c3c" />
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#e74c3c', fontSize: '1.3rem' }}>
                Community Map
              </h3>
              <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.95rem' }}>
                Emergency reporting, safe locations, and local services
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}

/**
 * Main application component that manages view switching
 * @component
 * @returns {JSX.Element} The main application interface with navigation
 */
function App() {
  const [currentView, setCurrentView] = useState('home') // 'home', 'imageAnalysis', 'eligibilityForm', 'cashForCans', or 'mapSection'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Global analysis state for background processing
  const [globalAnalysisState, setGlobalAnalysisState] = useState({
    isAnalyzing: false,
    results: null,
    error: null,
    progress: 'idle' // 'idle', 'uploading', 'analyzing', 'complete'
  })

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Bar */}
      <nav>
        <div 
          onClick={() => setCurrentView('home')}
        >
          Resourcify
        </div>

        {/* Desktop Navigation */}
        <div className="desktop-nav">
          <button
            onClick={() => setCurrentView('home')}
            className={currentView === 'home' ? 'btn btn-primary' : 'btn btn-secondary'}
          >
            <HomeIcon size={16} /> Home
          </button>
          <button
            onClick={() => setCurrentView('imageAnalysis')}
            className={currentView === 'imageAnalysis' ? 'btn btn-primary' : 'btn btn-secondary'}
          >
            <SearchIcon size={16} /> Analysis
            {globalAnalysisState.isAnalyzing && (
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                animation: 'pulse 2s infinite',
                position: 'absolute',
                top: '4px',
                right: '4px'
              }} />
            )}
          </button>
          <button
            onClick={() => setCurrentView('eligibilityForm')}
            className={currentView === 'eligibilityForm' ? 'btn btn-primary' : 'btn btn-secondary'}
          >
            <CheckIcon size={16} /> Programs
          </button>
          <button
            onClick={() => setCurrentView('cashForCans')}
            className={currentView === 'cashForCans' ? 'btn btn-primary' : 'btn btn-secondary'}
          >
            <RecycleIcon size={16} /> Recycle
          </button>
          <button
            onClick={() => setCurrentView('mapSection')}
            className={currentView === 'mapSection' ? 'btn btn-primary' : 'btn btn-secondary'}
          >
            <MapIcon size={16} /> Map
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <MenuIcon size={24} />
        </button>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer">
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                onClick={() => { setCurrentView('home'); setMobileMenuOpen(false) }}
                className={currentView === 'home' ? 'btn btn-primary' : 'btn btn-secondary'}
              >
                <HomeIcon size={16} /> Home
              </button>
              <button
                onClick={() => { setCurrentView('imageAnalysis'); setMobileMenuOpen(false) }}
                className={currentView === 'imageAnalysis' ? 'btn btn-primary' : 'btn btn-secondary'}
              >
                <SearchIcon size={16} /> Analysis
              </button>
              <button
                onClick={() => { setCurrentView('eligibilityForm'); setMobileMenuOpen(false) }}
                className={currentView === 'eligibilityForm' ? 'btn btn-primary' : 'btn btn-secondary'}
              >
                <CheckIcon size={16} /> Programs
              </button>
              <button
                onClick={() => { setCurrentView('cashForCans'); setMobileMenuOpen(false) }}
                className={currentView === 'cashForCans' ? 'btn btn-primary' : 'btn btn-secondary'}
              >
                <RecycleIcon size={16} /> Recycle
              </button>
              <button
                onClick={() => { setCurrentView('mapSection'); setMobileMenuOpen(false) }}
                className={currentView === 'mapSection' ? 'btn btn-primary' : 'btn btn-secondary'}
              >
                <MapIcon size={20} /> Community Map
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {currentView === 'home' && <HomePage onNavigate={setCurrentView} />}
        {currentView === 'imageAnalysis' && (
          <ImageAnalysis 
            globalAnalysisState={globalAnalysisState}
            setGlobalAnalysisState={setGlobalAnalysisState}
          />
        )}
        {currentView === 'eligibilityForm' && <EligibilityForm />}
        {currentView === 'cashForCans' && <CashForCans />}
        {currentView === 'mapSection' && <MapSection />}
      </main>
      
      {/* Global Analysis Status */}
      {((globalAnalysisState.isAnalyzing && globalAnalysisState.progress !== 'complete') || 
        (globalAnalysisState.progress === 'complete' && currentView !== 'imageAnalysis')) && 
       currentView !== 'imageAnalysis' && (
        <div 
          className={`analysis-status-notification ${globalAnalysisState.progress === 'complete' ? 'complete' : ''}`}
          onClick={() => {
            if (globalAnalysisState.progress === 'complete') {
              setCurrentView('imageAnalysis')
              // Clear the notification after user navigates
              setTimeout(() => {
                setGlobalAnalysisState(prev => ({
                  ...prev,
                  progress: 'idle'
                }))
              }, 1000)
            }
          }}
        >
          <div className="status-content">
            {globalAnalysisState.progress === 'complete' ? (
              <>
                <div className="status-icon complete">
                  <CheckIcon size={10} color="white" />
                </div>
                <span className="status-text complete">
                  Analysis complete
                </span>
              </>
            ) : (
              <>
                <div className="status-icon loading"></div>
                <span className="status-text loading">
                  Analysis running...
                </span>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* Footer */}
      <footer>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          © 2025 Resourcify - Quick & Easy Resource Management
        </p>
      </footer>
    </div>
  )
}

export default App
