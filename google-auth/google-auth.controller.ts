import { Controller, Post, Body } from '@nestjs/common';
import { GoogleAuthService } from './google-auth.service';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { AuthService } from 'src/auth/auth.service';

@Controller('auth/google')
export class GoogleAuthController {
  constructor(
    private readonly googleAuthService: GoogleAuthService,
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  async googleLogin(@Body() loginDto: GoogleAuthDto) {
    const user = await this.googleAuthService.getProfileByToken(loginDto);
    return this.authService.socialSignIn(user);
  }
}
