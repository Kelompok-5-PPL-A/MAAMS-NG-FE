export function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp)
  
    let hours: number | string = date.getUTCHours()
    let minutes: number | string = date.getUTCMinutes()
    let day: number | string = date.getUTCDate()
    let month: number | string = date.getUTCMonth() + 1
  
    hours = hours < 10 ? '0' + hours : hours
    minutes = minutes < 10 ? '0' + minutes : minutes
    day = day < 10 ? '0' + day : day
    month = month < 10 ? '0' + month : month
  
    const year = date.getFullYear()
  
    return `${hours}:${minutes} ${day}/${month}/${year}`
  }
  