import { Route, Routes, useSearchParams } from 'react-router'

const photos = Array.from({ length: 12 }, (_, index) => ({
  id: String(index + 1),
  title: `Sample photo ${index + 1}`,
  category: ['nature', 'city', 'people'][Math.floor(index / 4)],
  src: `https://picsum.photos/id/${[10, 15, 16, 17, 24, 26, 28, 29, 64, 65, 91, 100][index]}/800/600`,
}))

function Gallery() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || ''
  const photoId = searchParams.get('photoId')
  const selectedPhoto = photos.find((photo) => photo.id === photoId)
  const visiblePhotos = category ? photos.filter((photo) => photo.category === category) : photos
  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }
  return (
    <main>
      <h1>Photo Gallery</h1>
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
        {visiblePhotos.map((photo) => (
          <li key={photo.id}>
            <button type="button" onClick={() => updateParam('photoId', photo.id)}>
              <img src={photo.src} alt="" width="800" height="600" loading="lazy" />
              <span>{photo.title}</span>
            </button>
          </li>
        ))}
      </ul>
      {selectedPhoto && <section aria-label={selectedPhoto.title}><button type="button" onClick={() => updateParam('photoId', null)}>Close photo</button><img src={selectedPhoto.src} alt={selectedPhoto.title} /></section>}
    </main>
  )
}

export default function App() {
  return <Routes><Route path="/" element={<Gallery />} /></Routes>
}
