import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';

import { CreateFolderDTO } from 'src/cores/dtos/create-folder.dto';
import { FoldersService } from 'src/services/folders/folders.service';

@Controller('folders')
@ApiTags('Drive - Folders')
@ApiBearerAuth()
export class FoldersController {
  constructor(private folderService: FoldersService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new folder',
    description:
      'Creates a new folder for the authenticated user. You can optionally provide a parent folder ID to nest it.',
  })
  @ApiBody({
    type: CreateFolderDTO,
    description:
      'Data for the new folder, including name and optional parent folder ID',
  })
  @ApiCreatedResponse({
    description: 'Folder created successfully',
  })
  @ApiUnauthorizedResponse({
    description:
      'User is not authorized. Authentication token may be missing or invalid.',
  })
  @ApiBadRequestResponse({
    description:
      'Invalid input data. Required fields might be missing or malformed.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error occurred while creating the folder',
  })
  async createFolder(
    @Req() request: Request,
    @Body() createFolderDTO: CreateFolderDTO,
  ) {
    const userId = request.user?.['sub'];
    return this.folderService.create({ createFolderDTO, ownerId: userId });
  }
}
