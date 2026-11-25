import { lazy, Suspense, useEffect, useRef } from 'react'
import { Route, Routes, useSearchParams } from 'react-router'

const PhotoContent = lazy(() => import('./PhotoContent.jsx'))

const photos = Array.from({ length: 12 }, (_, index) => ({
  id: String(index + 1),
  title: `Sample photo ${index + 1}`,
  category: ['nature', 'city', 'people'][Math.floor(index / 4)],
  src: `${import.meta.env.BASE_URL}photos/${[10, 15, 16, 17, 24, 26, 28, 29, 64, 65, 91, 100][index]}.jpg`,
  thumbnail: `${import.meta.env.BASE_URL}photos/${[10, 15, 16, 17, 24, 26, 28, 29, 64, 65, 91, 100][index]}-600.webp`,
}))

function PhotoDialog({ photo, onClose }) {
  const dialog = useRef(null)
  useEffect(() => { dialog.current.showModal() }, [])
  return (
    <dialog ref={dialog} aria-label={photo.title} onCancel={(event) => { event.preventDefault(); onClose() }}>
      <button type="button" onClick={onClose}>Close photo</button>
      <figure><div className="photo-frame"><Suspense fallback={<div className="photo-skeleton" role="status" aria-label="Loading photo" aria-busy="true" />}><PhotoContent photo={photo} /></Suspense></div><figcaption>{photo.title}</figcaption></figure>
    </dialog>
  )
}

function Gallery() {
  const [searchParams, setSearchParams] = useSearchParams()
  const opener = useRef(null)
  const heading = useRef(null)
  const wasOpen = useRef(false)
  const category = searchParams.get('category') || ''
  const photoId = searchParams.get('photoId')
  const selectedPhoto = photos.find((photo) => photo.id === photoId)
  const visiblePhotos = category ? photos.filter((photo) => photo.category === category) : photos
  useEffect(() => {
    if (wasOpen.current && !selectedPhoto) {
      const target = opener.current?.isConnected ? opener.current : heading.current
      target?.focus()
      opener.current = null
    }
    wasOpen.current = Boolean(selectedPhoto)
  }, [selectedPhoto])
  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }
  return (
    <main>
      <h1 ref={heading} tabIndex={-1}>Photo Gallery</h1>
      <label htmlFor="category">Category</label>{' '}
      <select id="category" value={category} onChange={(event) => updateParam('category', event.target.value)}>
        <option value="">All categories</option>
        <option value="nature">Nature</option>
        <option value="city">City</option>
        <option value="people">People</option>
      </select>
      {category && visiblePhotos.length === 0 && <p>No photos in this category.</p>}
      {photoId && !selectedPhoto && <p role="status">Photo not found.</p>}
      <ul aria-label="Photos">
        {visiblePhotos.map((photo, index) => (
          <li key={photo.id}>
            <button type="button" onClick={(event) => { opener.current = event.currentTarget; updateParam('photoId', photo.id) }}>
              <img src={photo.thumbnail} srcSet={`${photo.thumbnail} 600w, ${photo.src} 800w`} sizes="(max-width: 600px) calc(100vw - 5rem), (max-width: 900px) 50vw, 25vw" alt="" width="800" height="600" loading={index === 0 ? "eager" : "lazy"} fetchPriority={index === 0 ? "high" : "auto"} />
              <span>{photo.title}</span>
            </button>
          </li>
        ))}
      </ul>
      {selectedPhoto && <PhotoDialog photo={selectedPhoto} onClose={() => updateParam('photoId', null)} />}
    </main>
  )
}

export default function App() {
  return <Routes><Route path="/" element={<Gallery />} /></Routes>
}
