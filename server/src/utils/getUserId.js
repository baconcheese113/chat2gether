import jwt from 'jsonwebtoken'

export default (request, requireAuth = true) => {
  // Coming from cookie-parser
  if (request.req.userId) {
    console.log('cookie parsed userId', request.req.userId)
    return request.req.userId
  }

  const header = request.req ? request.req.headers.authorization : request.connection.context.Authorization

  // const token = request.req.headers.cookie
  if (header) {
    const token = header.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded.userId
  }

  // COOKIE SHOULD ALREADY BE PARSED
  // Try to get token from cookies
  // const cookieToken = request.req.headers.cookie
  // console.log(cookieToken)
  // if(cookieToken) {
  //   const decoded = jwt.verify(cookieToken, process.env.JWT_SECRET)
  //   return decoded.userId
  // }

  if (requireAuth) {
    throw new Error('Authentication required')
  }
  return null
}
