import { useState } from 'react'

/**
 * Agar mahsulotda haqiqiy rasm bo'lsa uni ko'rsatadi,
 * bo'lmasa emoji fallback ishlatadi.
 */
export default function ProductImage({
  src,
  emoji = '📦',
  alt   = 'Mahsulot',
  className = '',
  imgClassName = '',
}) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    // Emoji fallback
    return (
      <div className={`flex items-center justify-center bg-gray-50 ${className}`}>
        <span className="text-4xl select-none">{emoji}</span>
      </div>
    )
  }

  return (
    <div className={`overflow-hidden bg-gray-50 ${className}`}>
      <img
        src={src}
        alt={alt}
        onError={() => setFailed(true)}
        className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${imgClassName}`}
        loading="lazy"
      />
    </div>
  )
}
