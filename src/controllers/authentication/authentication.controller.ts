import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Request } from 'express';
import { CreateUserDTO } from 'src/cores/dtos/create-user.dto';
import { LoginDTO } from 'src/cores/dtos/login.dto';
import { LocalGuard } from 'src/cores/guards/local.guard';
import { RefreshTokenGuard } from 'src/cores/guards/refresh-token.guard';
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

  @Post('sign-in')
  @UseGuards(LocalGuard)
  @ApiOperation({
    summary: 'User login',
    description: 'User login with email or password.',
  })
  @ApiBody({ type: LoginDTO, description: 'User login data' })
  @ApiBadRequestResponse({ description: 'Validation Error' })
  @ApiOkResponse({ description: 'Login successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiUnauthorizedResponse({ description: 'User or password not correct.' })
  async login(@Body() _loginDTO: LoginDTO, @Req() request: Request) {
    return this.authenticationService.signIn(request?.user as User);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  async refreshToken(@Req() request: Request) {
    const userId = request?.user?.['sub'];
    const refreshToken = request?.user?.['refreshToken'];
    return this.authenticationService.refreshToken(userId, refreshToken);
  }

  @Get('logout')
  async logout() {}
}
