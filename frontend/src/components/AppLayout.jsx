import { useState } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import FloatingChatButton from './FloatingChatButton'
import UploadModal from './UploadModal'
import FileViewer from './FileViewer'
import { useAuth } from '../context/AuthContext'

export default function AppLayout() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [showUpload, setShowUpload] = useState(false)
  const [activeFile, setActiveFile] = useState(null)

  const isAskPage = location.pathname.includes('/app/ask')

  if (loading) return <div className="loading-screen">...</div>
  if (!user) return <Navigate to="/auth" replace />

  // Called after a successful upload — broadcasts an event so any
  // page (Dashboard, Collections) can refresh its list automatically
  const handleUploadSuccess = () => {
    window.dispatchEvent(new Event('notemind_upload'))
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <TopBar onUpload={() => setShowUpload(true)} />

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

          {/* Main page content */}
          <main style={{
            flex: 1,
            overflowY: 'auto',
            transition: 'all 0.4s ease',
            marginRight: (isAskPage && activeFile) ? '45%' : '0%'
          }}>
            <Outlet context={{ openFile: setActiveFile }} />
          </main>

          {/* Side-by-side viewer (Ask page only) */}
          <AnimatePresence>
            {isAskPage && activeFile && (
              <div style={{
                position: 'absolute', right: 0, top: 0, bottom: 0, width: '45%',
                background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
                zIndex: 5, display: 'flex', flexDirection: 'column'
              }}>
                <FileViewer
                  file={activeFile}
                  onClose={() => setActiveFile(null)}
                  variant="sidebar"
                />
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal viewer (Dashboard / Collections) */}
      {!isAskPage && activeFile && (
        <FileViewer
          file={activeFile}
          onClose={() => setActiveFile(null)}
          variant="modal"
        />
      )}

      <FloatingChatButton />

      <AnimatePresence>
        {showUpload && (
          <UploadModal
            onClose={() => setShowUpload(false)}
            onSuccess={handleUploadSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  )
}