import {decryptCode, encryptCode} from '../helpers/common';

export const decrypt = async (req: Req, res: Res, next: Function) => {
    try {
        const bodyKeys = Object.keys(req.body);
        console.log(bodyKeys)
        if (bodyKeys.length === 0) {
            return res.status(400).json({ message: "Request body is empty" });
        }
        bodyKeys.forEach((key) => {
            if (typeof req.body[key] === 'string' && req.body[key].length > 0) {
                req.body[key] = decryptCode(req.body[key]);
            }
        });

        req.body = req.body;

        next();
    } catch (error) {
        console.error("Decryption error:", error);
        return res.status(400).json({ message: "Invalid Data" });
    }
};


export const encrypt = async (req: Req, res: Res, next: Function) => {
    try {
        const bodyKeys = Object.keys(req.body);
        if (bodyKeys.length === 0) {
            return res.status(400).json({ message: "Request body is empty" });
        }
 

        bodyKeys.forEach((key) => {
            if (typeof req.body[key] === 'string' && req.body[key].length > 0) {
                req.body[key] = encryptCode(req.body[key]);
            }
        });
        req.body = req.body;
        next();
    } catch (error) {
        console.error("Encryption error:", error);
        return res.status(400).json({ message: "Invalid Data" });
    }
}