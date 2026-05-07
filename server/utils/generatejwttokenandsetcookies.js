import jwt from 'jsonwebtoken'

// In production set COOKIE_SECURE=true in your .env
// In local dev (http://localhost) this MUST be false — browsers reject
// secure cookies on non-HTTPS origins and silently discard them
const isProduction  = process.env.NODE_ENV === 'production'
const secureCookie  = process.env.COOKIE_SECURE === 'true' || isProduction
const sameSiteCookie = secureCookie ? 'none' : 'lax'

export const GenerateJwtTokenAndSetCookiesEmployee = (res, EMid, EMrole, ORGID) => {
    const token = jwt.sign({ EMid, EMrole, ORGID }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.cookie('EMtoken', token, {
        maxAge:   7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure:   secureCookie,
        sameSite: sameSiteCookie,
        path:     '/',
    })

    return token
}

export const GenerateJwtTokenAndSetCookiesHR = (res, HRid, HRrole, ORGID) => {
    const token = jwt.sign({ HRid, HRrole, ORGID }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.cookie('HRtoken', token, {
        maxAge:   7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure:   secureCookie,
        sameSite: sameSiteCookie,
        path:     '/',
    })

    return token
}