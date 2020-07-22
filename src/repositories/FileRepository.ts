import { Injectable, HttpStatus } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { File } from "../interfaces/FileInterface";
import { BannedInfoDto } from "../dtos/BannedInfoDto";
import { MessageCode } from "../commons/MessageCode";
import { ApplicationException } from "../controllers/ExceptionController";
import { FileModal } from "../modals/FileModal";

@Injectable()
export class FileRepository {
    constructor(
        @InjectModel('File') readonly fileModel: Model<File>,
    ) {
    }

    async getFileDetails(useForId: string, fileName: string): Promise<any>{
        return await this.fileModel.findOne({ useForId: useForId, name: fileName.split(".")[0] }).exec()
    }

    async getFileDetailsById(useForId: string): Promise<any>{
        return await this.fileModel.findOne({ useForId: useForId }).exec()
    }

    async deleteFileById(useForId: string, bannedInfoDto: BannedInfoDto): Promise<FileModal> {
        const deleteRef = await this.fileModel.findOne({ useForId }).exec();
        if (!deleteRef.bannedInfo) deleteRef.bannedInfo = { reason: '', isWaiting: false, createdAt: new Date() }
        if (!bannedInfoDto.reason) throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.BANNED_INFO_IS_NULL)
        deleteRef.bannedInfo.reason = bannedInfoDto.reason;
        deleteRef.isDeleted = true;
        return new FileModal(await deleteRef.save())
    }

    async deleteFileByFileName(fileName: string, bannedInfoDto: BannedInfoDto): Promise<FileModal> {
        const deleteRef = await this.fileModel.findOne({ fileName }).exec();
        if (!bannedInfoDto.reason) throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.BANNED_INFO_IS_NULL)
        deleteRef.bannedInfo.reason = bannedInfoDto.reason;
        deleteRef.isDeleted = true;
        return new FileModal(await deleteRef.save())
    }

    /*async deleteFileByFileName(name: string) {
        return await this.fileModel.deleteOne({ name: name }).exec()
    }*/
}
