import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CreateDriveItemPermissionDTO } from 'src/cores/dtos/create-drive-item-permission.dto';
import { DriveItemPermissionsService } from 'src/services/drive-item-permissions/drive-item-permissions.service';

@Controller('drive-items/:driveItemId/permissions')
@ApiTags('Drive Item Permissions')
@ApiBearerAuth()
@ApiParam({
  name: 'driveItemId',
  description:
    'The unique identifier of the drive item to manage permissions for',
  example: '550e8400-e29b-41d4-a716-446655440000',
  type: String,
})
export class DriveItemPermissionsController {
  constructor(
    private driveItemPermissionService: DriveItemPermissionsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Grant permission on a drive item',
    description:
      'Assigns specific access permissions to a user for the specified drive item. Requires owner or manage permissions.',
  })
  @ApiBody({
    type: CreateDriveItemPermissionDTO,
    description: 'Payload containing user ID and permission type to be granted',
  })
  @ApiCreatedResponse({
    description: 'Permission successfully granted',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required - valid JWT token missing or expired',
  })
  @ApiConflictResponse({
    description:
      'Conflict - User already has the requested permission or a permission conflict occurred',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error - Failed to process permission grant',
  })
  @ApiBadRequestResponse({
    description:
      'Invalid request - missing required fields or invalid permission type',
  })
  async grantPermission(
    @Param('driveItemId') driveItemId: string,
    @Body() createDriveItemPermissionDTO: CreateDriveItemPermissionDTO,
  ) {
    const { permission, userId } = createDriveItemPermissionDTO;
    return this.driveItemPermissionService.grantPermission(
      userId,
      driveItemId,
      permission,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List users with access',
    description:
      'Retrieves a list of all users who have permissions to the specified drive item',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved list of users with access',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required - valid JWT token missing or expired',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error - failed to retrieve access list',
  })
  async getUsersWithAccess(@Param('driveItemId') driveItemId: string) {
    return this.driveItemPermissionService.getUsersWithAccess(driveItemId);
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Revoke user permission',
    description:
      "Removes a user's access permissions for the specified drive item. Requires manage permissions on the item.",
  })
  @ApiParam({
    name: 'userId',
    description: 'The ID of the user whose permissions should be revoked',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @ApiOkResponse({
    description: 'Permission successfully revoked',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required - valid JWT token missing or expired',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error - failed to revoke permission',
  })
  @ApiNotFoundResponse({
    description:
      'Not Found - either the drive item or user permission record does not exist',
  })
  async revokePermission(
    @Param('driveItemId') driveItemId: string,
    @Param('userId') userId: string,
  ) {
    return this.driveItemPermissionService.revokePermission(
      userId,
      driveItemId,
    );
  }
}
