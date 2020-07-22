import { extname } from "path";
import moment = require("moment");

export class FileUtils {

    public static editFileName = (req, file, callback) => {
        const name = file.originalname.split('.')[0];
        const fileExtName = extname(file.originalname);
        const day = moment().format("YYMMDD");
        callback(null, `${name}-${day}${fileExtName}`);
    };

    public static exceptFileImage = (req, file, cb) => {
        if (!file.originalname.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Định dạng không hỗ trợ'), false);
        }
        return cb(null, file.originalname)
    };

    public static exceptFileMusic = (req, file, cb) => {
        if (!file.originalname.toLowerCase().match(/\.(mp3|wav)$/)) {
            return cb(new Error('Định dạng không hỗ trợ'), false);
        }
        return cb(null, file.originalname)
    };
}
