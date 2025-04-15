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
import { UpdateDriveItemDTO } from 'src/cores/dtos/update-driver-item.dto';
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update file or folder',
    description:
      'Updates metadata for a specific file or folder such as name or parent directory',
  })
  @ApiBody({
    type: UpdateDriveItemDTO,
    description:
      'Payload containing the fields to update (name and/or parentId)',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the file/folder to update',
  })
  @ApiOkResponse({
    description: 'File/folder updated successfully',
  })
  @ApiNotFoundResponse({
    description: 'File/folder not found with the provided ID',
  })
  @ApiInternalServerErrorResponse({
    description: 'Server error occurred while updating the file/folder',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request payload or parameters',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description:
      'User is not authorized to update this file or file is deleted',
  })
  async updateFile(
    @Req() request: Request,
    @Param('id') id: string,
    @Body() updateDriveItemDTO: UpdateDriveItemDTO,
  ) {
    const userId = request.user?.['sub'];
    return this.fileService.update({
      id,
      ownerId: userId,
      data: updateDriveItemDTO,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Move file to trash',
    description:
      'Moves the specified file to trash for the authenticated user. Files in trash can be restored or permanently deleted.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized. The user must be authenticated to perform this action.',
  })
  @ApiOkResponse({
    description: 'File was successfully moved to trash.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An unexpected error occurred while moving the file to trash.',
  })
  @ApiNotFoundResponse({
    description:
      'File not found. The file with the given ID does not exist or does not belong to the user.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the file to move to trash.',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  async softDeleteFile(@Req() request: Request, @Param('id') id: string) {
    const userId = request.user?.['sub'];
    return this.fileService.trash(id, userId);
  }

  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restore a file from trash',
    description:
      'Restores a previously deleted file from the trash back to the active files.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the file to be restored',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @ApiNotFoundResponse({
    description:
      'File not found. The file with the given ID does not exist in trash or does not belong to the user.',
  })
  @ApiForbiddenResponse({
    description: 'File not in trash.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. You must be logged in to restore files.',
  })
  @ApiInternalServerErrorResponse({
    description:
      'An unexpected error occurred while attempting to restore the file.',
  })
  async restoreFile(@Req() request: Request, @Param('id') id: string) {
    const userId = request.user?.['sub'];
    return this.fileService.restore(id, userId);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Permanently delete a file or folder',
    description:
      'Permanently deletes a file or folder (and all of its children, if any) from both the database and the storage.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the file or folder to permanently delete',
  })
  @ApiOkResponse({
    description: 'File or folder permanently deleted successfully.',
  })
  @ApiNotFoundResponse({
    description:
      'The file or folder was not found or does not belong to the user.',
  })
  @ApiInternalServerErrorResponse({
    description:
      'An unexpected error occurred while deleting the file or folder.',
  })
  async permanentDeleteFile(@Req() request: Request, @Param('id') id: string) {
    const userId = request.user?.['sub'];
    await this.fileService.permanentDelete(id, userId);
    return {
      success: true,
      message: 'File or folder permanently deleted.',
    };
  }

  @Get(':id/download')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Download file or folder',
    description:
      'Downloads a file directly, or a folder as a ZIP archive including all nested contents.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the file or folder to download',
  })
  @ApiOkResponse({
    description:
      'The file is downloaded successfully. If a folder, a ZIP archive is streamed.',
  })
  async downloadFile(
    @Req() request: Request,
    @Res() response: Response,
    @Param('id') id: string,
  ) {
    const userId = request.user?.['sub'];
    await this.fileService.download(id, userId, response);
    return {
      success: true,
      message: 'Download initiated successfully',
    };
  }

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
