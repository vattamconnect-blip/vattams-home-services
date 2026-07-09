import { useState } from 'react'
import { supabase } from '../lib/supabase'

type Props = {
  role: 'customer' | 'technician'
  onSuccess: () => void
  onBack: () => void
}

export function PhoneOTPForm({ role, onSuccess, onBack }: Props) {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (!digits) return ''
    if (digits.length <= 3) return `+${digits}`
    if (digits.length <= 6) return `+${digits.slice(0, 3)} ${digits.slice(3)}`
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const rawPhone = phone.replace(/\s/g, '')

    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: rawPhone })
      if (error) throw error
      setStep('otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const rawPhone = phone.replace(/\s/g, '')

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: rawPhone,
        token: otp,
        type: 'sms',
      })

      if (error) throw error

      if (data.user) {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle()

        if (!existing) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            role,
            phone: rawPhone,
            is_approved: role === 'customer',
          })
        }
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  const color = role === 'customer' ? 'blue' : 'green'

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            color === 'blue' ? 'bg-blue-100' : 'bg-green-100'
          }`}>
            <svg className={`w-8 h-8 ${color === 'blue' ? 'text-blue-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {role === 'customer' ? 'Customer Login' : 'Technician Login'}
          </h2>
          <p className="text-gray-500 mt-2">
            {step === 'phone' ? 'Enter your phone number' : 'Enter the verification code'}
          </p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="+91 98765 43210"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                  color === 'blue' ? 'focus:ring-blue-500' : 'focus:ring-green-500'
                }`}
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || phone.length < 10}
              className={`w-full text-white py-3 rounded-lg font-medium transition-all disabled:opacity-50 ${
                color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>

            <button type="button" onClick={onBack} className="w-full text-gray-600 py-2 text-sm hover:text-gray-800">
              Back to role selection
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="w-full px-4 py-3 border rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={6}
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className={`w-full text-white py-3 rounded-lg font-medium transition-all disabled:opacity-50 ${
                color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>

            <button type="button" onClick={() => setStep('phone')} className="w-full text-gray-600 py-2 text-sm hover:text-gray-800">
              Change phone number
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
