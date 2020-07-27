import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { File } from "../interfaces/FileInterface";
import { FileRepository } from "../repositories/FileRepository";
import * as jimp from 'jimp'
import { IdUtil } from "../utils/IdUtil";
import * as fs from "fs";
import { ApplicationException } from "../controllers/ExceptionController";
import { BannedInfoDto } from "../dtos/BannedInfoDto";
import { User } from "../interfaces/UserInterface";
import { MessageCode } from "../commons/MessageCode";
import { FileStorageEnum } from "../commons/FileStorageEnum";

@Injectable()
export class FileService {

    constructor(
        @InjectModel('File') readonly fileModel: Model<File>,
        private readonly fileRepository: FileRepository,
    ) {
    }

    async saveFiles(user: User, files: any, type: string, useForId: string, imageType: string = useForId) {
        var saveFiles: File[] = [];
        const id = user.id;
        if (files instanceof Array) {
            for (const i of files) {
                const pathToFile = process.env.DESTINATION_UPLOAD + `/${i}`; //`../upload/${i}`;
                const extension = i.split(".").pop();
                const fileName = IdUtil.generateId(8) + '_' + IdUtil.generateId(8) /*Date.now()*/;
                const internalPath = process.env.DESTINATION_TO_RENDER + `${type}/${id}/${imageType}/${fileName}.${extension}`;
                const localPath = process.env.DESTINATION_SAVE_FILE + `${type}${process.env.SLASH_SYSTEM}${id}${process.env.SLASH_SYSTEM}${imageType}${process.env.SLASH_SYSTEM}${fileName}.${extension}`
                const localDir = process.env.DESTINATION_SAVE_FILE + `${type}${process.env.SLASH_SYSTEM}${id}${process.env.SLASH_SYSTEM}${imageType}${process.env.SLASH_SYSTEM}`
                if (type === FileStorageEnum.IMAGES) {
                    const saveFile = await jimp.read(pathToFile);
                    await saveFile
                        //.resize(600, 400, jimp.RESIZE_BEZIER)
                        //.scaleToFit(200, 200)
                        .quality(100)
                        .normalize()
                        .write(localPath);
                } else {
                    try {
                        fs.mkdirSync(localDir, { recursive: true });
                        const data = fs.readFileSync(pathToFile);
                        fs.writeFileSync(localPath, data);
                    } catch (error) {
                        throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.FILE_NOT_FOUND)
                    }

                    //fs.unlinkSync(localPath);
                }
                fs.unlinkSync(pathToFile);
                const saved: File = new this.fileModel({
                    useForId: useForId,
                    internalPath: internalPath,
                    localPath: localPath,
                    fileName: fileName,
                    extension: extension,
                    type: type,
                    createdAt: Math.round(new Date().getTime() / 1000),
                    createdBy: user.username
                });
                saveFiles.push(saved);
                // console.log(saveFiles);
            }
            await this.fileModel.insertMany(saveFiles);
            return { status: true, msg: saveFiles }
        }
        //return await this.fileModel.find({ userId: userId }).exec()
        throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.FILE_NOT_FOUND)
    }

    async delete(useForId: string, bannedInfoDto: BannedInfoDto) {
        const file: File = await this.fileRepository.getFileDetailsById(useForId);
        if (!file) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.FILE_NOT_FOUND);
        }
        fs.unlinkSync(file.localPath);
        fs.rmdirSync(file.localPath.substring(0, file.localPath.length - 21))
        await this.fileRepository.deleteFileById(useForId, bannedInfoDto);
        return { statusCode: 200, message: "Xóa thành công" }
    }
}
