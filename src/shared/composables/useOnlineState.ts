import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Tracks whether the browser has a network connection.
 */
export function useOnlineState() {
  const isOnline = ref(navigator.onLine)

  onMounted(() => {
    window.addEventListener('online', setOnlineState)
    window.addEventListener('offline', setOfflineState)
  })

  onUnmounted(() => {
    window.removeEventListener('online', setOnlineState)
    window.removeEventListener('offline', setOfflineState)
  })

  function setOnlineState() {
    isOnline.value = true
  }

  function setOfflineState() {
    isOnline.value = false
  }

  return { isOnline }
}
