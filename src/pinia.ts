import { createPinia } from 'pinia'

// Pinia instance exportée pour pouvoir utiliser les stores hors des composants (ex: router guards)
export const pinia = createPinia()
