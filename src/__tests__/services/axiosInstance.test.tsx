import MockAdapter from 'axios-mock-adapter'
import axiosInstance from '../../services/axiosInstance'

describe('axiosInstance', () => {
    let mock: MockAdapter
  
    beforeEach(() => {
      mock = new MockAdapter(axiosInstance) 
    })
  
    afterEach(() => {
      mock.reset()
    })
  
    test('should successfully make a GET request', async () => {
      const mockData = { message: 'Success' }
      mock.onGet('/test-endpoint').reply(200, mockData)
  
      const response = await axiosInstance.get('/test-endpoint')
      
      expect(response.status).toBe(200)
      expect(response.data).toEqual(mockData)
    })
  
    test('should handle a 404 error response', async () => {
      mock.onGet('/not-found').reply(404, { error: 'Not Found' })
  
      await expect(axiosInstance.get('/not-found')).rejects.toThrow('Request failed with status code 404')
    })
  
    test('should handle a POST request successfully', async () => {
      const postData = { title: 'Test' }
      const mockResponse = { message: 'Created' }
      
      mock.onPost('/create', postData).reply(201, mockResponse)
  
      const response = await axiosInstance.post('/create', postData)
  
      expect(response.status).toBe(201)
      expect(response.data).toEqual(mockResponse)
    })
})