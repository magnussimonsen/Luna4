import { useSettingsStore } from '../stores/Luna4SettingsStore'

/**
 * Formats a date according to the  dateAndTimeFormat specified in the settings store or a provided  dateAndTimeFormat
 *
 * @param {Date} [date=new Date()] - The date to  dateAndTimeFormat (defaults to current date)
 * @param {string} [ dateAndTimeFormat='short'] - Format option ('useSettings', 'full', 'short', 'iso', or custom  dateAndTimeFormat string)
 * @returns {string} The  dateAndTimeFormatted date string
 */
export function formatDate({ date = new Date(), dateAndTimeFormat = 'short' } = {}) {
  const d = date instanceof Date ? date : new Date(date)

  // Return empty string if invalid date
  if (isNaN(d.getTime())) {
    return ''
  }

  // Use settings store  dateAndTimeFormat if requested
  if (dateAndTimeFormat === 'useSettings') {
    try {
      const settingsStore = useSettingsStore()
      const dateAndTimeFormat = settingsStore.selectedDateFormat || 'DD-MM-YYYY-hh-mm'

      return dateAndTimeFormat
        .replace('DD', String(d.getDate()).padStart(2, '0'))
        .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
        .replace('YYYY', d.getFullYear())
        .replace('hh', String(d.getHours()).padStart(2, '0'))
        .replace('mm', String(d.getMinutes()).padStart(2, '0'))
    } catch (error) {
      // Fall back to full  dateAndTimeFormat if settings store isn't available
      console.warn('Settings store not available, using default  dateAndTimeFormat', error)
      dateAndTimeFormat = 'short'
    }
  }

  if (dateAndTimeFormat === 'useSettingsFileSafe') {
    // Format for file names. For example: "2023-01-01_12-00-00"
    try {
      const settingsStore = useSettingsStore()
      const dateAndTimeFormat = settingsStore.selectedDateFormat || 'DD-MM-YYYY-hh-mm'

      let formattedDate = dateAndTimeFormat
        .replace('DD', String(d.getDate()).padStart(2, '0'))
        .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
        .replace('YYYY', d.getFullYear())
        .replace('hh', String(d.getHours()).padStart(2, '0'))
        .replace('mm', String(d.getMinutes()).padStart(2, '0'))

      // Make it file-safe by replacing problematic characters including periods and commas
      return formattedDate.replace(/[:/\s.,]/g, '-')
    } catch (error) {
      // Fall back to full  dateAndTimeFormat if settings store isn't available
      console.warn('Settings store not available, using default  dateAndTimeFormat', error)
      // Use a default file-safe format
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}-${String(d.getMinutes()).padStart(2, '0')}`
    }
  }

  if (dateAndTimeFormat === 'timeOnly') {
    // Returns time in 'hh:mm:ss' format (24-hour)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
  }

  // Handle other format types
  if (dateAndTimeFormat === 'full') {
    return d.toLocaleString()
  } else if (dateAndTimeFormat === 'short') {
    return d.toLocaleDateString()
  } else if (dateAndTimeFormat === 'iso') {
    return d.toISOString()
  } else {
    return ''
  }
}

/**
 * Gets the current date-time  dateAndTimeFormatted according to the specified  dateAndTimeFormat or settings
 * @param {string} [ dateAndTimeFormat='short'] - Format option ('useSettings', 'full', 'short', 'iso', or custom  dateAndTimeFormat string)
 * @returns {string} The  dateAndTimeFormatted current date-time
 */
export function getCurrentFormattedDate({ dateAndTimeFormat = 'full' } = {}) {
  return formatDate({ date: new Date(), dateAndTimeFormat })
}
