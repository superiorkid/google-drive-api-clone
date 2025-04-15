import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
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

import { UpdateDriveItemDTO } from 'src/cores/dtos/update-driver-item.dto';
import { DriveItemsService } from 'src/services/drive-items/drive-items.service';

@Controller('drive-item')
@ApiTags('Drive Item')
@ApiBearerAuth()
export class DriveItemController {
  constructor(private driveItemsService: DriveItemsService) {}

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update file or folder',
    description:
      'Updates metadata for a specific file or folder, such as name or parent directory.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the file or folder to update',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @ApiBody({
    type: UpdateDriveItemDTO,
    description:
      'Fields to update (e.g., name and/or parentId) for a file or folder.',
  })
  @ApiOkResponse({ description: 'File or folder updated successfully.' })
  @ApiNotFoundResponse({
    description: 'File or folder not found with the provided ID.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Server error occurred during update.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid update payload or parameters.',
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated.' })
  @ApiForbiddenResponse({
    description: 'Unauthorized to update this file/folder or item is deleted.',
  })
  async updateItem(
    @Req() request: Request,
    @Param('id') id: string,
    @Body() updateDriveItemDTO: UpdateDriveItemDTO,
  ) {
    const userId = request.user?.['sub'];
    return this.driveItemsService.update({
      id,
      ownerId: userId,
      data: updateDriveItemDTO,
    });
  }

  @Get(':id/download')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Download file or folder',
    description:
      'Downloads a file directly or a folder as a ZIP archive including all nested contents.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the file or folder to download',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @ApiOkResponse({
    description:
      'Download initiated successfully. Folders are zipped before download.',
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated.' })
  @ApiNotFoundResponse({ description: 'File or folder not found.' })
  @ApiInternalServerErrorResponse({
    description: 'Server error occurred during download.',
  })
  async downloadFile(
    @Req() request: Request,
    @Res() response: Response,
    @Param('id') id: string,
  ) {
    const userId = request.user?.['sub'];
    await this.driveItemsService.download(id, userId, response);
    return { success: true, message: 'Download initiated successfully' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Move file or folder to trash',
    description:
      'Moves a file or folder to trash. Items in trash can be restored or permanently deleted.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the file or folder to move to trash',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @ApiOkResponse({ description: 'File or folder successfully moved to trash.' })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated.' })
  @ApiNotFoundResponse({
    description: 'File or folder not found or not owned by user.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Error moving file or folder to trash.',
  })
  async softDeleteFile(@Req() request: Request, @Param('id') id: string) {
    const userId = request.user?.['sub'];
    return this.driveItemsService.trash(id, userId);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Permanently delete file or folder',
    description:
      'Completely deletes a file or folder (including all its children) from storage and database.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the file or folder to permanently delete',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @ApiOkResponse({
    description: 'File or folder permanently deleted successfully.',
  })
  @ApiNotFoundResponse({
    description: 'File or folder not found or unauthorized.',
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated.' })
  @ApiInternalServerErrorResponse({
    description: 'Error permanently deleting file or folder.',
  })
  async permanentDeleteFile(@Req() request: Request, @Param('id') id: string) {
    const userId = request.user?.['sub'];
    await this.driveItemsService.permanentDelete(id, userId);
    return { success: true, message: 'File or folder permanently deleted.' };
  }

  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restore file or folder from trash',
    description:
      'Restores a file or folder from trash to its original location.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the file or folder to restore',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @ApiOkResponse({ description: 'File or folder restored successfully.' })
  @ApiNotFoundResponse({
    description: 'File or folder not found in trash or not owned by user.',
  })
  @ApiForbiddenResponse({ description: 'File or folder is not in trash.' })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated.' })
  @ApiInternalServerErrorResponse({
    description: 'Error restoring file or folder.',
  })
  async restoreFile(@Req() request: Request, @Param('id') id: string) {
    const userId = request.user?.['sub'];
    return this.driveItemsService.restore(id, userId);
  }
}
