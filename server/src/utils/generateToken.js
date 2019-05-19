import jwt from 'jsonwebtoken'

export default(userId) => {
  return jwt.sign({userId: userId}, process.env.JWT_SECRET, {expiresIn: '7 days'})
}