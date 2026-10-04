import jwt from 'jsonwebtoken';



export function generateToken(logIn) {
    const secret = process.env.JWT_SECRET;
    const payload = {
        id: logIn._id,
        email: logIn.email
    };
    const signedToken = jwt.sign(payload, secret, { expiresIn: process.env.JWT_EXPIRATION_TIME });
    return signedToken;
}


export default generateToken;
