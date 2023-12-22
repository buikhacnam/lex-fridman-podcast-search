import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { SignInInput } from './dto/signin-input';
// import { SignUpInput } from './dto/singup-input';
import { AuthResponse } from './dto/auth-response';
import { LogoutResponse } from './dto/logout-response';
import { CurrentUser } from './decorators/currentUser.decorator';
import { UseGuards } from '@nestjs/common';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { RefreshTokenPayload } from 'src/auth/types/types';
// import { Permission, Permissions } from './decorators/permissions.decorator';
import { RateLimitGuard } from './guards/rateLimit.guard';

@Resolver()
@UseGuards(RateLimitGuard)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}
  // @Mutation(() => AuthResponse)
  // signup(@Args('signUpInput') signUpInput: SignUpInput) {
  //   return this.authService.signUp(signUpInput);
  // }
  @Mutation(() => AuthResponse)
  signin(@Args('signInInput') signInInput: SignInInput) {
    return this.authService.signIn(signInInput);
  }

  @Mutation(() => LogoutResponse)
  signout(@Args('tokenId') tokenId: string) {
    return this.authService.signOut(tokenId);
  }

  @UseGuards(RefreshTokenGuard)
  @Mutation(() => AuthResponse)
  getRefreshToken(@CurrentUser() user: RefreshTokenPayload) {
    return this.authService.getNewTokens(user.refreshToken, user.tokenId, {
      email: user.email,
      sub: user.sub,
      iat: user.iat,
      permissions: user.permissions,
    });
  }
}
