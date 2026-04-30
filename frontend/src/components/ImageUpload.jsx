import { useState, useRef, useCallback } from 'react'
import api from '../data/api'
import toast from 'react-hot-toast'

const MAX_MB = 5

export default function ImageUpload({
  productId,
  currentImage = '',
  onUploadSuccess,
  className = '',
}) {
  const [preview,    setPreview]    = useState(currentImage || '')
  const [dragging,   setDragging]   = useState(false)
  const [uploading,  setUploading]  = useState(false)
  const [progress,   setProgress]   = useState(0)
  const inputRef = useRef(null)

  // Fayl tekshirish
  const validate = (file) => {
    if (!file) return 'Fayl tanlanmadi'
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) return 'Faqat JPEG, PNG, WebP qabul qilinadi'
    if (file.size > MAX_MB * 1024 * 1024) return `Fayl ${MAX_MB}MB dan kichik bo'lishi kerak`
    return null
  }

  // Yuklab olish
  const doUpload = useCallback(async (file) => {
    const err = validate(file)
    if (err) { toast.error(err); return }

    // Local preview
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
    setUploading(true)
    setProgress(0)

    const formData = new FormData()
    formData.append('image', file)

    try {
      const endpoint = productId
        ? `/api/upload/product/${productId}`
        : '/api/upload/general'

      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / e.total)
          setProgress(pct)
        },
      })

      const cloudUrl = res.data.data.url
      setPreview(cloudUrl)
      URL.revokeObjectURL(localUrl)
      toast.success('Rasm muvaffaqiyatli yuklandi ✅')
      onUploadSuccess?.(res.data.data)
    } catch (err) {
      // Demo rejim: local preview saqlanadi
      toast('Demo: haqiqiy yuklanish uchun Cloudinary sozlang', { icon: '⚠️', duration: 3000 })
      onUploadSuccess?.({ url: localUrl, publicId: 'demo_' + Date.now() })
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }, [productId, onUploadSuccess])

  // Drag events
  const onDragOver  = (e) => { e.preventDefault(); setDragging(true)  }
  const onDragLeave = (e) => { e.preventDefault(); setDragging(false) }
  const onDrop      = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) doUpload(file)
  }
  const onFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) doUpload(file)
    e.target.value = ''
  }

  const removeImage = async () => {
    setPreview('')
    onUploadSuccess?.({ url: '', publicId: '' })
  }

  return (
    <div className={`w-full ${className}`}>
      {preview ? (
        /* Preview mode */
        <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <img
            src={preview}
            alt="Mahsulot rasmi"
            className="w-full h-48 object-cover"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 bg-white text-gray-800 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Almashtirish
            </button>
            <button
              onClick={removeImage}
              className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              </svg>
              O'chirish
            </button>
          </div>

          {/* Upload progress overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"/>
              <div className="w-32 bg-white/20 rounded-full h-1.5">
                <div className="bg-white h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }}/>
              </div>
              <span className="text-white text-xs font-medium">{progress}%</span>
            </div>
          )}
        </div>
      ) : (
        /* Drop zone */
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
            dragging
              ? 'border-brand-green bg-brand-light scale-[1.01]'
              : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full animate-spin"/>
              <div className="w-28 bg-gray-200 rounded-full h-1.5">
                <div className="bg-brand-green h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }}/>
              </div>
              <span className="text-sm text-gray-500">{progress}% yuklandi</span>
            </div>
          ) : (
            <>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${dragging ? 'bg-brand-green/20' : 'bg-gray-100'}`}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={dragging ? '#1D9E75' : '#9CA3AF'} strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div className="text-center">
                <p className={`text-sm font-medium ${dragging ? 'text-brand-green' : 'text-gray-600'}`}>
                  {dragging ? 'Rasm tushiring' : 'Rasm tanlang yoki sudrab tushiring'}
                </p>
                <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP · Max {MAX_MB}MB</p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onFileChange}
        className="hidden"
      />
    </div>
  )
}
