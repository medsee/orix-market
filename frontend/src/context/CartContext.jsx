import { createContext, useContext, useReducer, useEffect } from 'react'

const CartContext = createContext(null)

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i._id === action.payload._id)
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i._id === action.payload._id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        }
      }
      return { ...state, items: [...state.items, { ...action.payload, quantity: 1 }] }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i._id !== action.payload) }
    case 'UPDATE_QTY': {
      if (action.payload.qty <= 0) {
        return { ...state, items: state.items.filter(i => i._id !== action.payload.id) }
      }
      return {
        ...state,
        items: state.items.map(i =>
          i._id === action.payload.id ? { ...i, quantity: action.payload.qty } : i
        )
      }
    }
    case 'CLEAR_CART':
      return { items: [] }
    default:
      return state
  }
}

const getInitial = () => {
  try {
    const saved = localStorage.getItem('orix_cart')
    return saved ? JSON.parse(saved) : { items: [] }
  } catch {
    return { items: [] }
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, getInitial())

  useEffect(() => {
    localStorage.setItem('orix_cart', JSON.stringify(state))
  }, [state])

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const addItem    = (product) => dispatch({ type: 'ADD_ITEM', payload: product })
  const removeItem = (id)      => dispatch({ type: 'REMOVE_ITEM', payload: id })
  const updateQty  = (id, qty) => dispatch({ type: 'UPDATE_QTY', payload: { id, qty } })
  const clearCart  = ()        => dispatch({ type: 'CLEAR_CART' })

  return (
    <CartContext.Provider value={{ ...state, totalItems, totalPrice, addItem, removeItem, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}
