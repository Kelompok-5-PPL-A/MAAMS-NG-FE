import { formatTimestamp } from '../../utils/dateFormatter'

describe('formatTimestamp function', () => {
  it('should format timestamp correctly', () => {
    const timestamp = '2024-04-01T08:30:00.000Z'
    const formattedTimestamp = formatTimestamp(timestamp)
    expect(formattedTimestamp).toBe('08:30 01/04/2024')
  })

  describe('formatting components', () => {
    it('should format hours correctly', () => {
      const timestamp = '2024-04-01T08:30:00.000Z'
      const formattedHours = formatHours(timestamp)
      expect(formattedHours).toBe('08')
    })

    it('should format minutes correctly', () => {
      const timestamp = '2024-04-01T08:30:00.000Z'
      const formattedMinutes = formatMinutes(timestamp)
      expect(formattedMinutes).toBe('30')
    })

    it('should format day correctly', () => {
      const timestamp = '2024-04-01T08:30:00.000Z'
      const formattedDay = formatDay(timestamp)
      expect(formattedDay).toBe('01')
    })

    it('should format month correctly', () => {
      const timestamp = '2024-04-01T08:30:00.000Z'
      const formattedMonth = formatMonth(timestamp)
      expect(formattedMonth).toBe('04')
    })
  })
})

function formatHours(timestamp: string): string {
  const date = new Date(timestamp)
  const hours = date.getUTCHours()
  return hours < 10 ? '0' + hours : hours.toString()
}

function formatMinutes(timestamp: string): string {
  const date = new Date(timestamp)
  const minutes = date.getUTCMinutes()
  return minutes < 10 ? '0' + minutes : minutes.toString()
}

function formatDay(timestamp: string): string {
  const date = new Date(timestamp)
  const day = date.getUTCDate()
  return day < 10 ? '0' + day : day.toString()
}

function formatMonth(timestamp: string): string {
  const date = new Date(timestamp)
  const month = date.getUTCMonth() + 1
  return month < 10 ? '0' + month : month.toString()
}
