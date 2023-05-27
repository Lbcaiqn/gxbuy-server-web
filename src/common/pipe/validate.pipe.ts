import { ArgumentMetadata, HttpException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ValidatePipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    const DTO = plainToInstance(metadata.metatype, value);

    const fail = await validate(DTO);
    if (fail.length) {
      throw new HttpException(fail, HttpStatus.BAD_REQUEST);
    }
    return value;
  }
}
