import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {Lable} from "../interfaces/LableInterface";

@Injectable()
export class LableRepository {
    constructor(@InjectModel('Lable') private readonly lableModel: Model<Lable>) {
    }
}
