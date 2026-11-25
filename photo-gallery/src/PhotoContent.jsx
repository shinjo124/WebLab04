export default function PhotoContent({ photo }) {
  return <img src={photo.src} alt={photo.title} width="800" height="600" />
}
