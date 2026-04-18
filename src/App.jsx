import { useState, useRef } from 'react'
import Orb from './components/Orb'
import './App.css'

export default function App() {
  const [tab, setTab] = useState('image')
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()
  const resultRef = useRef()

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setResult(null)
    setLoading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      setResult(data)
      // Auto scroll to results
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (err) {
      setResult({ error: 'Could not connect to backend' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      {/* Page 1 — Hero */}
      <div className="hero-page">
        <div className="orb-bg">
          <Orb
            hoverIntensity={0.8}
            rotateOnHover
            hue={0}
            forceHoverState={false}
            backgroundColor="#0a0a0a"
          />
        </div>
        <div className="content">
          <h1>This AI is hiding<br />something, try uploading!</h1>
          <div className="toggle">
            <button className={tab === 'image' ? 'active' : ''} onClick={() => setTab('image')}>Image</button>
            <button className={tab === 'video' ? 'active' : ''} onClick={() => setTab('video')}>Video</button>
          </div>
          {tab === 'image' ? (
            <>
              <input type="file" accept="image/*" ref={fileRef} onChange={handleFile} style={{ display: 'none' }} />
              <button className="btn-primary" onClick={() => fileRef.current.click()}>
                {loading ? 'Analysing...' : 'Upload Image'}
              </button>
            </>
          ) : (
            <button className="btn-primary" disabled>Video — Coming Soon</button>
          )}
        </div>
      </div>

      {/* Page 2 — Results (shows after upload) */}
      {result && !result.error && (
        <div className="results-page" ref={resultRef}>
          <div className="results-inner">

            {/* Prediction badge */}
            <div className={`pred-badge ${result.label === 'REAL' ? 'real' : 'fake'}`}>
              {result.label === 'REAL' ? '✅ REAL IMAGE' : '🤖 AI GENERATED'}
              <span className="pred-conf">{result.confidence}% confidence</span>
            </div>

            {/* 3 panels */}
            <div className="panels">
              <div className="panel">
                <p className="panel-title">Original</p>
                <img src={`data:image/png;base64,${result.original}`} alt="original" />
              </div>
              <div className="panel">
                <p className="panel-title">Grad-CAM Heatmap</p>
                <img src={`data:image/png;base64,${result.heatmap}`} alt="heatmap" />
              </div>
              <div className="panel">
                <p className="panel-title">Overlay</p>
                <img src={`data:image/png;base64,${result.overlay}`} alt="overlay" />
              </div>
            </div>

            <button className="btn-secondary" onClick={() => { setPreview(null); setResult(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
              ← Try Another
            </button>
          </div>
        </div>
      )}

      {result?.error && (
        <div className="results-page" ref={resultRef}>
          <p className="result-label">❌ {result.error}</p>
          <button className="btn-secondary" onClick={() => { setPreview(null); setResult(null) }}>← Try Again</button>
        </div>
      )}
    </div>
  )
}