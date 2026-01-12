import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://10.10.100.110'
const base = API_BASE.replace(/\/$/, '')

export async function verifyAdminPassword(password) {
  const res = await axios.post(
    `${base}/api/admin/verify-password`,
    { password },
    { timeout: 10000 }
  )
  return Boolean(res.data?.valid)
}

export async function changeAdminPassword(oldPassword, newPassword) {
  const res = await axios.post(
    `${base}/api/admin/change-password`,
    { oldPassword, newPassword },
    { timeout: 10000 }
  )
  return Boolean(res.data?.success)
}
