import jwt from 'jsonwebtoken'

// COOKIE_SECURE=false in server/.env → for plain HTTP localhost
// Leave it unset (or true) → for Codespaces / any HTTPS environment
const secureCookie = process.env.COOKIE_SECURE !== "false"
const sameSiteCookie = secureCookie ? "none" : "lax"

export const GenerateJwtTokenAndSetCookiesEmployee = (res, EMid, EMrole, ORGID) => {
    const token = jwt.sign({ EMid, EMrole, ORGID }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.cookie("EMtoken", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: secureCookie,
        sameSite: sameSiteCookie,
    })

    return token
}

export const GenerateJwtTokenAndSetCookiesHR = (res, HRid, HRrole, ORGID) => {
    const token = jwt.sign({ HRid, HRrole, ORGID }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.cookie("HRtoken", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: secureCookie,
        sameSite: sameSiteCookie,
    })

    return token
}