const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCRIPT_URL = 'https://accounts.google.com/gsi/client'
let scriptPromise

function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = SCRIPT_URL
      script.async = true
      script.defer = true
      script.onload = resolve
      script.onerror = () => reject(new Error('Could not load Google sign-in.'))
      document.head.appendChild(script)
    })
  }
  return scriptPromise
}

export async function requestGoogleCredential() {
  if (!CLIENT_ID) throw new Error('Google sign-in is not configured. Ask an admin to set VITE_GOOGLE_CLIENT_ID.')

  await loadGoogleScript()
  return new Promise((resolve, reject) => {
    let settled = false
    const finish = (error, credential) => {
      if (settled) return
      settled = true
      if (error) reject(error)
      else resolve(credential)
    }

    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      auto_select: false,
      callback: (response) => {
        if (response?.credential) finish(null, response.credential)
        else finish(new Error('Google sign-in was cancelled.'))
      },
    })

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        finish(new Error('Google sign-in is unavailable in this browser or was skipped.'))
      }
    })
  })
}
