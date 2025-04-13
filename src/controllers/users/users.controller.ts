import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Request } from 'express';

import { Roles } from 'src/cores/decorators/roles.decorator';
import { UsersService } from 'src/services/users/users.service';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get list of users',
    description:
      'Only accessible to admin users. Returns a list of all registered users.',
  })
  @ApiOkResponse({ description: 'Successfully retrieved the list of users.' })
  @ApiInternalServerErrorResponse({
    description:
      'An unexpected error occurred while retrieving the users list.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized. You must be logged in with an admin account to access this resource.',
  })
  async usersList() {
    // TODO: implement filters for pagination data
    return this.usersService.usersList();
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Returns the profile information of the currently authenticated user.',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved the user profile.',
  })
  @ApiInternalServerErrorResponse({
    description:
      'An unexpected error occurred while retrieving the user profile.',
  })
  @ApiNotFoundResponse({
    description: 'User not found. Possibly due to invalid or deleted user ID.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. The request requires a valid JWT access token.',
  })
  async me(@Req() request: Request) {
    const userId = request.user?.['sub'];
    return this.usersService.getCurrentUser(userId);
  }

  // @Put('me')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: '', description: '' })
  // @ApiBody({})
  // @ApiBadRequestResponse({ description: '' })
  // @ApiOkResponse({ description: '' })
  // @ApiInternalServerErrorResponse({ description: '' })
  // @ApiNotFoundResponse({ description: '' })
  // @ApiUnauthorizedResponse({ description: '' })
  // async editMe(@Req() request: Request, @Body() updateUserDTO: UpdateUserDTO) {
  //   const userId = request.user?.['sub'];
  //   return this.usersService.updateCurrentUser({ userId, updateUserDTO });
  // }

  @Get(':username')
  @ApiOperation({
    summary: 'Get user by username',
    description:
      'Retrieves public profile information of a user based on the provided username.',
  })
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'username',
    description: 'The username of the user to retrieve',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved user profile by username.',
  })
  @ApiNotFoundResponse({
    description: 'User with the specified username was not found.',
  })
  @ApiInternalServerErrorResponse({
    description:
      'An unexpected error occurred while retrieving the user profile.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. The request requires a valid JWT access token.',
  })
  async getUserByUsername(@Param('username') username: string) {
    return this.usersService.getUserByUsername(username);
  }
}
