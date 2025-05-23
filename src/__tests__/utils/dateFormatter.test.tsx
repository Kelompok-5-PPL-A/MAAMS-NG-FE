import { formatTimestamp } from '../../utils/dateFormatter'

describe('formatTimestamp function', () => {
  it('should format timestamp correctly', () => {
    const timestamp = '2024-04-01T08:30:00.000Z'
    const formattedTimestamp = formatTimestamp(timestamp)
    expect(formattedTimestamp).toBe('08:30 01/04/2024')
  })

  test("formats timestamp correctly when minutes is less than 10", () => {
    const timestamp = "2025-03-25T12:05:00Z"; // 5 menit
    expect(formatTimestamp(timestamp)).toBe("12:05 25/03/2025");
  });

  test("formats timestamp correctly when minutes is 10 or more", () => {
    const timestamp = "2025-03-25T12:15:00Z";
    expect(formatTimestamp(timestamp)).toBe("12:15 25/03/2025");
  });

  test("formats timestamp correctly when hours is less than 10", () => {
    const timestamp = "2025-03-25T09:30:00Z"; // 9 pagi
    expect(formatTimestamp(timestamp)).toBe("09:30 25/03/2025");
  });

  test("formats timestamp correctly when hours and minutes are both less than 10", () => {
    const timestamp = "2025-03-25T05:05:00Z";
    expect(formatTimestamp(timestamp)).toBe("05:05 25/03/2025");
  });

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
