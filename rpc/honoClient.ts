import hcWithType from './hcWithType'

const client = hcWithType(
  process.env.NODE_ENV === 'production' ? 'https://techtriangle.vercel.app' : 'http://localhost:3000',
  {
    headers() {
      if (typeof localStorage === 'undefined') return { Authorization: '' }
      return {
        Authorization: "test"
      }
    },
  },
)

export default client

export const testClient = hcWithType('http://localhost:3000', {
  headers() {
    return { Authorization: '' }
  },
})
