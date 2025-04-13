import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { FormDataRequest } from 'nestjs-form-data';

import { CreateFileDTO } from 'src/cores/dtos/create-file.dto';
import { FileService } from 'src/services/file/file.service';

@Controller('files')
@ApiTags('Drive - Files')
@ApiBearerAuth()
export class FileController {
  constructor(private fileSerivice: FileService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @FormDataRequest()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload a file',
    description:
      'Uploads a file to the drive. This route is only for files (not folders).',
  })
  @ApiBody({
    description: 'Form data payload for uploading a file.',
    type: CreateFileDTO,
  })
  @ApiCreatedResponse({
    description: 'The file has been successfully uploaded and saved.',
  })
  @ApiBadRequestResponse({
    description:
      'Bad request. This may occur if required fields are missing or an invalid file is provided.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. You must be logged in to upload files.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Something went wrong during the upload process.',
  })
  async uploadFile(
    @Req() request: Request,
    @Body() createFileDTO: CreateFileDTO,
  ) {
    const userId = request.user?.['sub'];
    createFileDTO.parentId =
      createFileDTO.parentId === '' ? undefined : createFileDTO.parentId;
    return this.fileSerivice.uploadFile({ createFileDTO, ownerId: userId });
  }

  @Get(':id')
  async detailFile() {}

  @Patch(':id')
  async updateFile() {}

  @Delete(':id')
  async softDeleteFile() {}

  @Patch(':id/restore')
  async restoreFile() {}

  @Delete(':id/permanent')
  async permanentDeleteFile() {}

  @Get(':id/download')
  async downloadFile() {}

  @Get(':id/preview')
  async preview(
    @Req() request: Request,
    @Res() response: Response,
    @Param('id') id: string,
  ) {}
}
