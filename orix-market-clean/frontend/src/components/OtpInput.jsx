import { useState, useRef, useEffect } from 'react'

export default function OtpInput({ length = 6, value = '', onChange, disabled = false }) {
  const [digits, setDigits] = useState(Array(length).fill(''))
  const inputs = useRef([])

  useEffect(() => {
    if (value === '') setDigits(Array(length).fill(''))
  }, [value, length])

  const handleChange = (index, val) => {
    // Faqat raqam
    const digit = val.replace(/\D/g, '').slice(-1)
    const next  = [...digits]
    next[index] = digit
    setDigits(next)
    onChange?.(next.join(''))

    // Keyingi katakka o'tish
    if (digit && index < length - 1) {
      inputs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft'  && index > 0)          inputs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < length - 1) inputs.current[index + 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    const next = [...Array(length).fill('')]
    pasted.split('').forEach((ch, i) => { next[i] = ch })
    setDigits(next)
    onChange?.(next.join(''))
    const focusIdx = Math.min(pasted.length, length - 1)
    inputs.current[focusIdx]?.focus()
  }

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          disabled={disabled}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={e => e.target.select()}
          className={`
            w-11 h-12 text-center text-lg font-bold border-2 rounded-xl
            focus:outline-none transition-all duration-150
            ${d
              ? 'border-brand-green bg-brand-light text-brand-dark'
              : 'border-gray-200 bg-gray-50 text-gray-900'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'focus:border-brand-green focus:bg-white'}
          `}
        />
      ))}
    </div>
  )
}
