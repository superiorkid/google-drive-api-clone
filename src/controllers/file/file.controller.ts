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
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
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
  constructor(private fileService: FileService) {}

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
    return this.fileService.uploadFile({ createFileDTO, ownerId: userId });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get file detail',
    description:
      'Retrieves the detail of a file owned by the authenticated user by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the file to retrieve',
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized. The user must be authenticated to access this endpoint.',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved the file details.',
  })
  @ApiInternalServerErrorResponse({
    description:
      'An unexpected error occurred while retrieving the file details.',
  })
  @ApiNotFoundResponse({
    description:
      'File not found. The file with the provided ID does not exist or does not belong to the user.',
  })
  async detailFile(@Req() request: Request, @Param('id') id: string) {
    const userId = request.user?.['sub'];
    return this.fileService.detail(id, userId);
  }

  @Patch(':id')
  async updateFile() {}

  @Delete(':id')
  async softDeleteFile(@Req() request: Request, @Param('id') id: string) {
    return this.fileService.softDelete();
  }

  @Patch(':id/restore')
  async restoreFile() {}

  @Delete(':id/permanent')
  async permanentDeleteFile() {}

  @Get(':id/download')
  async downloadFile() {}

  @Get(':id/preview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Preview a file',
    description:
      'Returns a preview of the file if the file type is supported and the user has access to it.',
  })
  @ApiOkResponse({
    description: 'File preview returned successfully',
  })
  @ApiForbiddenResponse({
    description:
      'Access denied - either you dont have permission or the file type cannot be previewed',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - authentication required',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the file to preview',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  async preview(
    @Req() request: Request,
    @Res() response: Response,
    @Param('id') id: string,
  ) {
    const userId = request.user?.['sub'];
    return this.fileService.previewFile({ id, response, ownerId: userId });
  }
}
