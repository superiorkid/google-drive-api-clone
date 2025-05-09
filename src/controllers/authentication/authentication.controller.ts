import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { User } from '@prisma/client';
import { Request } from 'express';

import { Public } from 'src/cores/decorators/public.decorator';
import { CreateUserDTO } from 'src/cores/dtos/create-user.dto';
import { ForgotPasswordDTO } from 'src/cores/dtos/forgot-password.dto';
import { LoginDTO } from 'src/cores/dtos/login.dto';
import { ResendVerificationEmailDTO } from 'src/cores/dtos/resend-verification-email.dto';
import { ResetPasswordDTO } from 'src/cores/dtos/reset-password.dto';
import { LocalGuard } from 'src/cores/guards/local.guard';
import { RefreshTokenGuard } from 'src/cores/guards/refresh-token.guard';
import { AuthTokenService } from 'src/services/auth-token/auth-token.service';
import { AuthenticationService } from 'src/services/authentication/authentication.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthenticationController {
  constructor(
    private authenticationService: AuthenticationService,
    private authTokenService: AuthTokenService,
  ) {}

  @Public()
  @Post('sign-up')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
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

  @Public()
  @Post('sign-in')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
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

  @Public()
  @Get('refresh')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Access token successfully refreshed.' })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occurred during refresh token',
  })
  @ApiForbiddenResponse({
    description: 'Invalid or expired refresh token provided.',
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh token is missing or invalid.',
  })
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Refresh the access token using the refresh token.',
  })
  @ApiBearerAuth()
  async refreshToken(@Req() request: Request) {
    const userId = request?.user?.['sub'];
    const refreshToken = request?.user?.['refreshToken'];
    return this.authenticationService.refreshToken(userId, refreshToken);
  }

  @Get('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout user',
    description:
      "Invalidates the current user's authentication tokens and logs them out. \n\nRequires a valid access token in the Authorization header. Clears session data and revokes refresh tokens.",
  })
  @ApiOkResponse({ description: 'User logged out successfully' })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired acceess token provided.',
  })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiInternalServerErrorResponse({
    description: 'Server error occurred during logout processing.',
  })
  async logout(@Req() request: Request) {
    const userId = request?.user?.['sub'];
    return this.authenticationService.logout(userId);
  }

  @Public()
  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify user email',
    description:
      'Validates the email verification token and marks the user email as verified',
  })
  @ApiBadRequestResponse({
    description: 'Returns when token is invalid, already used, or expired',
  })
  @ApiInternalServerErrorResponse({
    description:
      'Returns when there is an error while updating user verification status',
  })
  @ApiOkResponse({
    description: 'Returns success message when email is successfully verified',
  })
  @ApiQuery({
    name: 'token',
    description: 'Email verification token sent to the user',
    required: true,
    example: 'a1b2c3d4-e5f6-7890-g1h2-3456ij7890kl',
  })
  async verifyEmail(@Query('token') token: string) {
    return this.authTokenService.verifyEmail(token);
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resend verification email',
    description: 'Resends the verification email to the user',
  })
  @ApiBody({
    type: ResendVerificationEmailDTO,
    description: 'Email address to resend verification to',
  })
  @ApiBadRequestResponse({
    description: 'Invalid email format or email not found',
  })
  @ApiOkResponse({
    description: 'Verification email sent successfully',
  })
  @ApiInternalServerErrorResponse({
    description: 'Error sending verification email',
  })
  @ApiNotFoundResponse({ description: '' })
  async resendVerificationEmail(
    @Body() resendVerificationEmalDTO: ResendVerificationEmailDTO,
  ) {
    return this.authTokenService.resendVerificationEmail(
      resendVerificationEmalDTO.email,
    );
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({
    summary: 'Request Password Reset',
    description: 'Sends a password reset email to the user.',
  })
  @ApiBadRequestResponse({
    description:
      'The request is invalid. For example, the email is not in the correct format.',
  })
  @ApiNotFoundResponse({
    description: 'No user found with the provided email address.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An unexpected error occurred while processing the request.',
  })
  @ApiBody({
    type: ForgotPasswordDTO,
    description: "DTO containing the user's email address for password reset.",
  })
  async forgotPassword(@Body() forgotPasswordDTO: ForgotPasswordDTO) {
    return this.authTokenService.forgotPassword(forgotPasswordDTO.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset user password',
    description:
      'Allows users to reset their password using a valid password reset token. This endpoint is typically called after the user submits the new password form.',
  })
  @ApiBody({
    type: ResetPasswordDTO,
    description:
      'DTO containing the password reset token and the new password.',
  })
  @ApiOkResponse({
    description: 'Password has been successfully reset.',
  })
  @ApiBadRequestResponse({
    description:
      'Invalid or expired token, or new password does not meet the required criteria.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An unexpected error occurred while resetting the password.',
  })
  async resetPassword(@Body() resetPasswordDTO: ResetPasswordDTO) {
    const { token, password } = resetPasswordDTO;
    return this.authTokenService.resetPassword(token, password);
  }
}
