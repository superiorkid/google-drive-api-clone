import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDTO } from 'src/cores/dtos/create-user.dto';
import { AuthenticationService } from 'src/services/authentication/authentication.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService) {}

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user.',
    description: 'Creates a new user account with email and password',
  })
  @ApiBody({ type: CreateUserDTO, description: 'User registration data' })
  @ApiBadRequestResponse({
    description: 'Validation error',
  })
  @ApiCreatedResponse({
    description: 'User successfully registered',
  })
  @ApiConflictResponse({
    description: 'Email or username already exists',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async register(@Body() createUserDTO: CreateUserDTO) {
    return this.authenticationService.signUp(createUserDTO);
  }
}
