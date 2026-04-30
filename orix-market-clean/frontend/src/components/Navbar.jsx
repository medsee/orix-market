import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { totalItems } = useCart()
  const { user, logout, isAdmin } = useAuth()
  const [search, setSearch]     = useState('')
  const [userMenu, setUserMenu] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) { navigate(`/products?search=${encodeURIComponent(search.trim())}`); setSearch('') }
  }

  const handleLogout = () => { logout(); setUserMenu(false); navigate('/') }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">

          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-brand-green flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="7" cy="6" r="2" fill="white"/>
                <circle cx="12" cy="12" r="2" fill="white"/>
                <circle cx="17" cy="18" r="2" fill="white"/>
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight">Orix<span className="text-brand-green"> Market</span></span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Mahsulot qidiring..." className="input-field pl-10 h-10"/>
            </div>
          </form>

          <nav className="hidden md:flex items-center gap-1">
            <Link to="/"         className="btn-ghost text-sm">Bosh sahifa</Link>
            <Link to="/products" className="btn-ghost text-sm">Katalog</Link>
            <Link to="/orders"   className="btn-ghost text-sm">Buyurtmalar</Link>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <Link to="/cart" className="relative flex items-center gap-2 bg-brand-green text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-brand-dark transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <span className="hidden sm:inline">Savat</span>
              {totalItems > 0 && (
                <span className="flex items-center justify-center bg-white text-brand-green text-xs font-bold rounded-full w-5 h-5">{totalItems}</span>
              )}
            </Link>

            {user ? (
              <div className="relative" ref={menuRef}>
                <button onClick={() => setUserMenu(p => !p)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm">
                  <div className="w-6 h-6 rounded-full bg-brand-light flex items-center justify-center text-xs font-bold text-brand-dark">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block font-medium text-gray-700 max-w-[80px] truncate">{user.name}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform ${userMenu ? 'rotate-180' : ''}`}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {userMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-gray-100 shadow-lg py-1 z-50 animate-fade-in">
                    <div className="px-3 py-2 border-b border-gray-50">
                      <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.phone}</p>
                    </div>
                    <Link to="/profile" onClick={() => setUserMenu(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">👤 Profilim</Link>
                    <Link to="/orders" onClick={() => setUserMenu(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">📦 Buyurtmalarim</Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserMenu(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">⚙️ Admin panel</Link>
                    )}
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50">🚪 Chiqish</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-secondary text-sm px-3 py-2">Kirish</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
